use serde::Serialize;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("Network error: {0}")]
    Network(#[from] reqwest::Error),

    #[error("Crypto error: {0}")]
    Crypto(String),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("API error: {0}")]
    Api(String),

    #[error("Internal error: {0}")]
    Internal(String),

    #[error("Missing parameter: {0}")]
    MissingParam(String),
}

// Implement Serialize so we can return AppError from Tauri commands
impl Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

pub type AppResult<T> = Result<T, AppError>;
