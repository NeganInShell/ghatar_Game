use axum::{
    extract::{Path, State},
    Json,
};
use crate::{
    error::AppError,
    models::{CreateProgress, Progress},
    state::AppState,
};

pub async fn save_progress(
    State(state): State<AppState>,
    Json(payload): Json<CreateProgress>,
) -> Result<Json<Progress>, AppError> {
    if payload.stage < 1 || payload.stage > 20 {
        return Err(AppError::BadRequest("stage must be 1..20".into()));
    }
    sqlx::query(
        r#"INSERT INTO progress (child_id, stage, score, completed, updated_at)
           VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
           ON CONFLICT(child_id, stage) DO UPDATE SET
             score = excluded.score,
             completed = excluded.completed,
             updated_at = CURRENT_TIMESTAMP"#,
    )
    .bind(&payload.child_id)
    .bind(payload.stage)
    .bind(payload.score)
    .bind(payload.completed)
    .execute(&state.db)
    .await?;

    let row: Progress = sqlx::query_as(
        "SELECT id, child_id, stage, score, completed, created_at, updated_at FROM progress WHERE child_id = ? AND stage = ?",
    )
    .bind(&payload.child_id)
    .bind(payload.stage)
    .fetch_one(&state.db)
    .await?;

    Ok(Json(row))
}

pub async fn get_progress(
    State(state): State<AppState>,
    Path(child_id): Path<String>,
) -> Result<Json<Vec<Progress>>, AppError> {
    let rows: Vec<Progress> = sqlx::query_as(
        "SELECT id, child_id, stage, score, completed, created_at, updated_at FROM progress WHERE child_id = ? ORDER BY stage",
    )
    .bind(&child_id)
    .fetch_all(&state.db)
    .await?;
    Ok(Json(rows))
}

pub async fn clear_progress(
    State(state): State<AppState>,
    Path(child_id): Path<String>,
) -> Result<Json<serde_json::Value>, AppError> {
    let res = sqlx::query("DELETE FROM progress WHERE child_id = ?")
        .bind(&child_id)
        .execute(&state.db)
        .await?;
    Ok(Json(
        serde_json::json!({ "ok": true, "deleted": res.rows_affected() }),
    ))
}
