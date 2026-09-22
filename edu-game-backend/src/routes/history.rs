use axum::{
    extract::{Path, State},
    Json,
};
use crate::{error::AppError, state::AppState};

/// پاک‌کردن کامل تاریخچه یک کودک: پیشرفت + پاسخ‌ها
pub async fn clear_history(
    State(state): State<AppState>,
    Path(child_id): Path<String>,
) -> Result<Json<serde_json::Value>, AppError> {
    let p = sqlx::query("DELETE FROM progress WHERE child_id = ?")
        .bind(&child_id)
        .execute(&state.db)
        .await?;
    let a = sqlx::query("DELETE FROM answers WHERE child_id = ?")
        .bind(&child_id)
        .execute(&state.db)
        .await?;
    Ok(Json(serde_json::json!({
        "ok": true,
        "progress_deleted": p.rows_affected(),
        "answers_deleted": a.rows_affected(),
    })))
}
