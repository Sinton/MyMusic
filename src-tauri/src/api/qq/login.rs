use crate::http::{HttpClient, HttpResult, HttpResponse};
use crate::error::AppError;
use crate::Options;

/// Standard QQ hash33 algorithm used for ptqrtoken calculation
pub fn hash33(t: &str) -> i32 {
    let mut e: i32 = 0;
    for c in t.chars() {
        let code = c as i32;
        e = e.wrapping_add(e.wrapping_shl(5)).wrapping_add(code);
    }
    2147483647 & e
}

pub async fn qr_init(client: &HttpClient, _options: Options) -> HttpResult<HttpResponse> {
    // Stage 1: Get pt_login_sig from xlogin
    let xlogin_url = "https://xui.ptlogin2.qq.com/cgi-bin/xlogin?appid=716027609&daid=383&style=33&login_text=QQ%E9%9F%B3%E4%B9%90&pt_3rd_aid=100497308&s_url=https%3A%2F%2Fgraph.qq.com%2Foauth2.0%2Flogin_jump";
    let xlogin_resp = client.request_full("GET", xlogin_url, vec![], "".to_string(), None, false).await?;
    
    // Extract pt_login_sig from cookies
    let mut login_sig = String::new();
    if let Some(v) = xlogin_resp.headers.get("set-cookie") {
        for full_cookie in v.split(";;") {
            if let Some(cookie_part) = full_cookie.split(';').next() {
                if let Some((name, val)) = cookie_part.split_once('=') {
                    if name.trim() == "pt_login_sig" {
                        login_sig = val.trim().to_string();
                        break;
                    }
                }
            }
        }
    }

    // Stage 2: Get QR Image and qrsig
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis();
    
    let qr_show_url = format!(
        "https://xui.ptlogin2.qq.com/ssl/ptqrshow?appid=716027609&e=2&l=M&s=3&d=72&v=4&t=0.{}&daid=383&pt_3rd_aid=100497308",
        now
    );
    
    let mut headers = Vec::new();
    headers.push(("Referer".to_string(), "https://xui.ptlogin2.qq.com/".to_string()));
    
    let mut qr_resp = client.request_full("GET", &qr_show_url, headers, "".to_string(), None, false).await?;
    
    // Inject the login_sig into headers so the mapper can combine it into auth_id
    if !login_sig.is_empty() {
        qr_resp.headers.insert("x-login-sig".to_string(), login_sig);
    }
    
    Ok(qr_resp)
}

pub async fn qr_check(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    let mut params_map = std::collections::HashMap::new();
    for pair in options.params.split('&') {
        if let Some((k, v)) = pair.split_once('=') {
            params_map.insert(k.to_string(), v.to_string());
        }
    }

    // auth_id now contains "qrsig|login_sig"
    let combined_id = params_map.get("auth_id").ok_or(AppError::MissingParam("auth_id".to_string()))?;
    let (qrsig, login_sig) = combined_id.split_once('|').unwrap_or((combined_id, ""));
    
    let ptqrtoken = hash33(qrsig);
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis();

    // Use official parameters from captured trace
    let url = format!(
        "https://xui.ptlogin2.qq.com/ssl/ptqrlogin?u1=https%3A%2F%2Fgraph.qq.com%2Foauth2.0%2Flogin_jump&ptqrtoken={}&ptredirect=0&h=1&t=1&g=1&from_ui=1&ptlang=2052&action=0-0-{}&js_ver=25112611&js_type=1&login_sig={}&aid=716027609&daid=383&pt_3rd_aid=100497308&pt_js_version=42f2bcc1",
        ptqrtoken, now, login_sig
    );

    let mut headers = Vec::new();
    headers.push(("Cookie".to_string(), format!("qrsig={}; pt_login_sig={}", qrsig, login_sig)));
    headers.push(("Referer".to_string(), "https://xui.ptlogin2.qq.com/".to_string()));

    let mut resp = client.request_full("GET", &url, headers.clone(), "".to_string(), options.trace_id, false).await?;
    
    // If successful, follow the redirect URL to get final cookies (skey, uin, etc.)
    if resp.body["code"] == "0" {
        if let Some(redirect_url) = resp.body["url"].as_str() {
            let mut final_headers = Vec::new();
            final_headers.push(("Referer".to_string(), "https://xui.ptlogin2.qq.com/".to_string()));
            
            // Request the redirect URL. This sets the actual login cookies.
            // IMPORTANT: We MUST pass the original headers (cookies) to check_sig!
            let redirect_resp = client.request_full("GET", redirect_url, headers, "".to_string(), None, false).await?;
            
            // Extract uin from multiple potential sources
            let mut uin = String::new();

            // Source A: Raw body text (often contains uin=12345)
            let body_json_str = serde_json::to_string(&resp.body).unwrap_or_default();
            if let Some(pos) = body_json_str.find("uin=") {
                let sub = &body_json_str[pos + 4..];
                let end = sub.find(|c: char| !c.is_numeric()).unwrap_or(sub.len());
                if end > 0 {
                    uin = sub[..end].to_string();
                }
            }

            // Extract all cookies from the redirect response
            let mut all_cookies = Vec::new();
            if let Some(v) = redirect_resp.headers.get("set-cookie") {
                for full_cookie in v.split(";;") {
                    if let Some(cookie_part) = full_cookie.split(';').next() {
                        all_cookies.push(cookie_part.to_string());
                        
                        // Source B: Scanning cookies for uin patterns
                        if uin.is_empty() {
                            if let Some((name, val)) = cookie_part.split_once('=') {
                                let name = name.trim();
                                if name == "uin" || name == "luin" || name == "superuin" || name == "pt2gguin" {
                                    // Clean 'o' and '0' prefixes
                                    let clean_val = val.trim().trim_start_matches('o').trim_start_matches('0');
                                    if !clean_val.is_empty() && clean_val.chars().all(|c| c.is_numeric()) {
                                        uin = clean_val.to_string();
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            // Inject portrait and cookies into the response body
            if let Some(obj) = resp.body.as_object_mut() {
                let cookie_str = all_cookies.join("; ");
                println!("[QQ AUTH DEBUG] Final captured cookies: {}", cookie_str);
                obj.insert("cookie".to_string(), serde_json::json!(cookie_str));
                
                // No more nickname filtering here - keep raw NULL if that's what API returned
                
                if !uin.is_empty() {
                    obj.insert("avatar".to_string(), serde_json::json!(format!("https://q.qlogo.cn/g?b=qq&nk={}&s=100", uin)));
                    obj.insert("uin".to_string(), serde_json::json!(uin));
                } else {
                    // Final fallback only if everything else fails: QQ official logo (QQ Team)
                    obj.insert("avatar".to_string(), serde_json::json!("https://q.qlogo.cn/g?b=qq&nk=10000&s=100"));
                }
            }
        }
    }

    Ok(resp)
}
