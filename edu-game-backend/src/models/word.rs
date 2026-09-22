use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Word {
    pub id: i64,
    pub text: String,
    pub audio_path: Option<String>,
    pub image_path: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateWord {
    pub text: String,
    pub audio_path: Option<String>,
    pub image_path: Option<String>,
}
