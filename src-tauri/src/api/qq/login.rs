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
    // Stage 0: Clear stale cookies and establish baseline session
    let _ = client.clear_cookies("qq.com");
    
    let ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

    // Visit y.qq.com
    let _ = client.request_full("GET", "https://y.qq.com/", vec![], "".to_string(), None, true).await?;
    
    // Visit graph.qq.com authorize to set pt_login_sig on that domain
    let pre_auth_url = "https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=100497308&redirect_uri=https%3A%2F%2Fy.qq.com%2Fportal%2Fwx_redirect.html%3Flogin_type%3D1%26surl%3Dhttps%253A%252F%252Fy.qq.com%252F&state=state&display=pc&scope=get_user_info";
    let _ = client.request_full("GET", pre_auth_url, vec![("User-Agent".to_string(), ua.to_string())], "".to_string(), None, true).await?;

    // Stage 1: Get pt_login_sig from xlogin with official params
    let xlogin_url = "https://xui.ptlogin2.qq.com/cgi-bin/xlogin?appid=716027609&daid=383&style=33&login_text=%E7%99%BB%E5%BD%95&hide_title_bar=1&hide_border=1&target=self&s_url=https%3A%2F%2Fgraph.qq.com%2Foauth2.0%2Flogin_jump&pt_3rd_aid=100497308";
    let xlogin_resp = client.request_full("GET", xlogin_url, vec![("User-Agent".to_string(), ua.to_string())], "".to_string(), None, false).await?;
    
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
        "https://ssl.ptlogin2.qq.com/ptqrshow?appid=716027609&e=2&l=M&s=3&d=72&v=4&t=0.{}&daid=383&pt_3rd_aid=100497308",
        now
    );
    
    let mut headers = Vec::new();
    headers.push(("Referer".to_string(), "https://xui.ptlogin2.qq.com/".to_string()));
    headers.push(("User-Agent".to_string(), ua.to_string()));
    
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
        "https://ssl.ptlogin2.qq.com/ptqrlogin?u1=https%3A%2F%2Fgraph.qq.com%2Foauth2.0%2Flogin_jump&ptqrtoken={}&ptredirect=0&h=1&t=1&g=1&from_ui=1&ptlang=2052&action=0-0-{}&js_ver=25112611&js_type=1&login_sig={}&aid=716027609&daid=383&pt_3rd_aid=100497308&pt_js_version=42f2bcc1",
        ptqrtoken, now, login_sig
    );

    let mut headers = Vec::new();
    headers.push(("Cookie".to_string(), format!("qrsig={}; pt_login_sig={}", qrsig, login_sig)));
    headers.push(("Referer".to_string(), format!("https://xui.ptlogin2.qq.com/cgi-bin/xlogin?appid=716027609&daid=383&style=33&login_text=%E7%99%BB%E5%BD%95&hide_title_bar=1&hide_border=1&target=self&s_url=https%3A%2F%2Fgraph.qq.com%2Foauth2.0%2Flogin_jump&pt_3rd_aid=100497308")));
    headers.push(("Origin".to_string(), "https://xui.ptlogin2.qq.com".to_string()));
    headers.push(("User-Agent".to_string(), "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36".to_string()));

    let mut resp = client.request_full("GET", &url, headers.clone(), "".to_string(), options.trace_id, false).await?;
    
    // If ptqrlogin is successful, follow the OAuth chain
    if resp.body["code"] == "0" {
        if let Some(redirect_url) = resp.body["url"].as_str() {
            println!("[QQ AUTH] Scan successful. Following redirect chain to harvest tokens...");
            
            // STEP B: Request the redirect_url (check_sig)
            let mut sig_headers = Vec::new();
            sig_headers.push(("Referer".to_string(), "https://xui.ptlogin2.qq.com/".to_string()));
            sig_headers.push(("Upgrade-Insecure-Requests".to_string(), "1".to_string()));
            
            let sig_resp = client.request_full("GET", redirect_url, sig_headers, "".to_string(), None, true).await?;
            println!("[QQ AUTH DEBUG] check_sig status: {}", sig_resp.status);

            // STEP B.1: Visit login_jump (S_URL)
            let jump_url = "https://graph.qq.com/oauth2.0/login_jump";
            let mut jump_headers = Vec::new();
            jump_headers.push(("Referer".to_string(), "https://xui.ptlogin2.qq.com/".to_string()));
            
            let _ = client.request_full("GET", jump_url, jump_headers, "".to_string(), None, true).await?;
            println!("[QQ AUTH DEBUG] login_jump visited.");

            // STEP C: Call Authorize (Official Redirect URI with params)
            let authorize_url = "https://graph.qq.com/oauth2.0/authorize?client_id=100497308&response_type=code&scope=all&redirect_uri=https%3A%2F%2Fy.qq.com%2Fportal%2Fwx_redirect.html%3Flogin_type%3D1%26surl%3Dhttps%253A%252F%252Fy.qq.com%252F&display=pc";
            
            let mut auth_headers = Vec::new();
            auth_headers.push(("Referer".to_string(), "https://graph.qq.com/oauth2.0/login_jump".to_string()));
            auth_headers.push(("Upgrade-Insecure-Requests".to_string(), "1".to_string()));
            auth_headers.push(("Accept".to_string(), "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7".to_string()));
            auth_headers.push(("Accept-Language".to_string(), "zh-CN,zh;q=0.9,en;q=0.8".to_string()));
            auth_headers.push(("User-Agent".to_string(), "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36".to_string()));
            
            let auth_resp = client.request_full("GET", authorize_url, auth_headers, "".to_string(), None, true).await?;
            println!("[QQ AUTH DEBUG] Authorize status: {}", auth_resp.status);

            // STEP D: If successful, harvest cookies from .y.qq.com
            // Re-identify if we are on security page
            let body_text = String::from_utf8_lossy(&auth_resp.raw_body);
            if body_text.contains("帐号安全登录") {
                if let Some(obj) = resp.body.as_object_mut() {
                    println!("[QQ AUTH] SECURITY PAGE DETECTED. Providing auth_origin_url.");
                    obj.insert("auth_origin_url".to_string(), serde_json::json!(authorize_url));
                }
            } else {
                // If not security page, we might have been redirected or reached the success page
                // We attempt to call the final redirect URL to trigger the y.qq.com cookies
                // Usually the redirect is in the Location header
                if let Some(loc) = auth_resp.headers.get("location") {
                    println!("[QQ AUTH] Following final callback: {}", loc);
                    let mut cb_headers = Vec::new();
                    cb_headers.push(("Referer".to_string(), "https://graph.qq.com/".to_string()));
                    let _ = client.request_full("GET", loc, cb_headers, "".to_string(), None, true).await?;
                }
            }

            // Collect all relevant domain cookies
            let domains = ["https://qq.com/", "https://graph.qq.com/", "https://y.qq.com/"];
            let mut all_business_cookies = Vec::new();
            for domain in domains {
                let c = client.export_cookies(domain);
                if !c.is_empty() {
                    all_business_cookies.push(c);
                }
            }

            let final_cookie_str = all_business_cookies.join("; ");
            println!("[QQ AUTH DEBUG] Final Multi-Domain Cookie Collected (Len: {})", final_cookie_str.len());

            // Extract UID for avatar from the ptqrlogin response (resp.body)
            let mut uin = String::new();
            let body_json_str = serde_json::to_string(&resp.body).unwrap_or_default();
            if let Some(pos) = body_json_str.find("uin=") {
                let sub = &body_json_str[pos + 4..];
                let end = sub.find(|c: char| !c.is_numeric()).unwrap_or(sub.len());
                if end > 0 { uin = sub[..end].to_string(); }
            }

            // Inject data back to frontend
            if let Some(obj) = resp.body.as_object_mut() {
                obj.insert("cookie".to_string(), serde_json::json!(final_cookie_str));
                
                if !uin.is_empty() {
                    obj.insert("avatar".to_string(), serde_json::json!(format!("https://q.qlogo.cn/g?b=qq&nk={}&s=100", uin)));
                    obj.insert("uin".to_string(), serde_json::json!(uin));
                    obj.insert("auth_id".to_string(), serde_json::json!(uin));
                }
            }
        }
    }
    
    Ok(resp)
}

pub async fn qr_complete(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    let mut params_map = std::collections::HashMap::new();
    for pair in options.params.split('&') {
        if let Some((k, v)) = pair.split_once('=') {
            params_map.insert(k.to_string(), v.to_string());
        }
    }

    let code = params_map.get("code").ok_or(AppError::MissingParam("code".to_string()))?;
    
    // Final callback URL where qm_keyst and other business tokens are set
    let callback_url = format!(
        "https://y.qq.com/portal/wx_redirect.html?login_type=1&surl=https%3A%2F%2Fy.qq.com%2F&code={}",
        code
    );

    println!("[QQ AUTH] Completing hybrid flow with code: {}", code);

    let mut headers = Vec::new();
    headers.push(("Referer".to_string(), "https://graph.qq.com/".to_string()));
    headers.push(("User-Agent".to_string(), "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36".to_string()));

    // Visit the callback URL to trigger cookie setting
    let cb_resp = client.request_full("GET", &callback_url, headers, "".to_string(), options.trace_id, true).await?;
    println!("[QQ AUTH] Final callback completed. Status: {}", cb_resp.status);

    // Collect all relevant domain cookies from our store
    let domains = ["https://qq.com/", "https://graph.qq.com/", "https://y.qq.com/"];
    let mut all_business_cookies = Vec::new();
    for domain in domains {
        let c = client.export_cookies(domain);
        if !c.is_empty() {
            all_business_cookies.push(c);
        }
    }

    let final_cookie_str = all_business_cookies.join("; ");
    println!("[QQ AUTH] Final synchronized cookies length: {}", final_cookie_str.len());
    
    // Return a success response with the updated cookie string
    let mut resp = HttpResponse {
        status: 200,
        body: serde_json::json!({
            "code": 0,
            "status": "success",
            "cookie": final_cookie_str
        }),
        headers: std::collections::HashMap::new(),
        raw_body: Vec::new(),
    };
    
    Ok(resp)
}
