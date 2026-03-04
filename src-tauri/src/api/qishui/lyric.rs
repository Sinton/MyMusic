use crate::http::{HttpClient, HttpResult, HttpResponse};
use crate::error::AppError;
use crate::Options;
use crate::api::netease::parse_params;
use serde_json::Value;

/// Fetch lyrics for a Qishui track.
/// Re-uses the track page SSR data to extract lyrics and convert to LRC format.
pub async fn get(client: &HttpClient, options: Options) -> HttpResult<HttpResponse> {
    let params = parse_params(&options.params);
    let track_id = params.get("track_id").cloned().unwrap_or_default();

    if track_id.is_empty() {
        return Err(AppError::Api("Missing track_id parameter".to_string()));
    }

    let trace_id = options.trace_id.clone().unwrap_or_else(|| "no-trace".to_string());
    println!("[Qishui][{}] Fetching lyrics for track: {}", trace_id, track_id);

    // Fetch the HTML page — same approach as track::detail
    let url = format!(
        "https://music.douyin.com/qishui/share/track?track_id={}",
        track_id
    );

    let html = super::track::fetch_html(client, &url).await?;
    let router_data = super::track::extract_router_data(&html)?;

    let sentences = router_data
        .pointer("/loaderData/track_page/audioWithLyricsOption/lyrics/sentences");

    let lrc = match sentences {
        Some(Value::Array(arr)) => convert_sentences_to_lrc(arr),
        _ => String::new(),
    };

    let result = serde_json::json!({
        "code": 200,
        "data": {
            "trackId": track_id,
            "lrc": lrc,
        }
    });

    println!("[Qishui][{}] Lyrics parsed: {} lines", trace_id, lrc.lines().count());

    Ok(HttpResponse {
        status: 200,
        body: result,
        headers: std::collections::HashMap::new(),
    })
}

/// Convert Qishui `sentences` array to standard LRC format string.
///
/// Each sentence has the structure:
/// ```json
/// {
///   "startMs": 12345,
///   "endMs": 15000,
///   "words": [{ "text": "Hello " }, { "text": "world" }]
/// }
/// ```
fn convert_sentences_to_lrc(sentences: &[Value]) -> String {
    let mut lines = Vec::new();

    for sentence in sentences {
        let start_ms = sentence["startMs"].as_u64().unwrap_or(0);

        // Concatenate all word texts
        let text: String = sentence["words"]
            .as_array()
            .map(|words| {
                words
                    .iter()
                    .filter_map(|w| w["text"].as_str())
                    .collect::<Vec<_>>()
                    .join("")
            })
            .unwrap_or_default();

        if text.is_empty() {
            continue;
        }

        // Convert milliseconds to [mm:ss.xx] LRC time tag
        let minutes = start_ms / 60000;
        let seconds = (start_ms % 60000) / 1000;
        let hundredths = (start_ms % 1000) / 10;

        lines.push(format!("[{:02}:{:02}.{:02}]{}", minutes, seconds, hundredths, text));
    }

    lines.join("\n")
}
