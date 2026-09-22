use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Answer {
    pub id: i64,
    pub child_id: String,
    pub question_id: i64,
    pub stage: i64,
    pub is_correct: bool,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateAnswer {
    pub child_id: String,
    pub question_id: i64,
    pub stage: i64,
    pub is_correct: bool,
}
