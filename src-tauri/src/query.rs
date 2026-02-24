use std::collections::HashMap;

/// URL-encoded query string builder, replacing the urlqstring dependency
pub fn params_to_query_string(params: Vec<(&str, &str)>) -> String {
    params
        .iter()
        .map(|(k, v)| format!("{}={}", urlencoded(k), urlencoded(v)))
        .collect::<Vec<_>>()
        .join("&")
}

/// Convert HashMap to JSON-like string (matches urlqstring's .json() output)
pub fn map_to_json(map: HashMap<&str, &str>) -> String {
    let entries: Vec<String> = map
        .iter()
        .map(|(k, v)| format!(r#""{}":"{}""#, k, v))
        .collect();
    format!("{{{}}}", entries.join(","))
}

/// Simple URL encoding
fn urlencoded(s: &str) -> String {
    let mut result = String::new();
    for c in s.chars() {
        match c {
            'a'..='z' | 'A'..='Z' | '0'..='9' | '-' | '_' | '.' | '~' => result.push(c),
            ' ' => result.push('+'),
            _ => {
                for b in c.to_string().as_bytes() {
                    result.push_str(&format!("%{:02X}", b));
                }
            }
        }
    }
    result
}
