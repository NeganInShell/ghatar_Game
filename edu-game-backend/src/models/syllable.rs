use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Syllable {
    pub id: i64,
    pub text: String,
    pub audio_path: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateSyllable {
    pub text: String,
    pub audio_path: Option<String>,
}
