use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Letter {
    pub id: i64,
    pub char: String,
    pub audio_path: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateLetter {
    pub char: String,
    pub audio_path: Option<String>,
}
