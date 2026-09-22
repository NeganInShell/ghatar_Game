use axum::{
    extract::{Path, State},
    Json,
};
use crate::{
    error::AppError,
    models::{Answer, CreateAnswer},
    state::AppState,
};

pub async fn save_answer(
    State(state): State<AppState>,
    Json(payload): Json<CreateAnswer>,
) -> Result<Json<Answer>, AppError> {
    let result = sqlx::query(
        "INSERT INTO answers (child_id, question_id, stage, is_correct) VALUES (?, ?, ?, ?)",
    )
    .bind(&payload.child_id)
    .bind(payload.question_id)
    .bind(payload.stage)
    .bind(payload.is_correct)
    .execute(&state.db)
    .await?;

    let id = result.last_insert_rowid();
    let row: Answer = sqlx::query_as(
        "SELECT id, child_id, question_id, stage, is_correct, created_at FROM answers WHERE id = ?",
    )
    .bind(id)
    .fetch_one(&state.db)
    .await?;

    Ok(Json(row))
}

pub async fn get_answers(
    State(state): State<AppState>,
    Path(child_id): Path<String>,
) -> Result<Json<Vec<Answer>>, AppError> {
    let rows: Vec<Answer> = sqlx::query_as(
        "SELECT id, child_id, question_id, stage, is_correct, created_at FROM answers WHERE child_id = ? ORDER BY id DESC LIMIT 200",
    )
    .bind(&child_id)
    .fetch_all(&state.db)
    .await?;
    Ok(Json(rows))
}

pub async fn clear_answers(
    State(state): State<AppState>,
    Path(child_id): Path<String>,
) -> Result<Json<serde_json::Value>, AppError> {
    let res = sqlx::query("DELETE FROM answers WHERE child_id = ?")
        .bind(&child_id)
        .execute(&state.db)
        .await?;
    Ok(Json(
        serde_json::json!({ "ok": true, "deleted": res.rows_affected() }),
    ))
}
