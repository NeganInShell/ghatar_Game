use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Progress {
    pub id: i64,
    pub child_id: String,
    pub stage: i64,
    pub score: i64,
    pub completed: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateProgress {
    pub child_id: String,
    pub stage: i64,
    pub score: i64,
    pub completed: bool,
}
