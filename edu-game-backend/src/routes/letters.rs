use axum::{
    extract::{Path, State},
    Json,
};
use crate::{
    error::AppError,
    models::{CreateLetter, Letter},
    state::AppState,
};

pub async fn list_letters(
    State(state): State<AppState>,
) -> Result<Json<Vec<Letter>>, AppError> {
    let letters: Vec<Letter> =
        sqlx::query_as("SELECT id, char, audio_path FROM letters ORDER BY id")
            .fetch_all(&state.db)
            .await?;
    Ok(Json(letters))
}

pub async fn get_letter(
    State(state): State<AppState>,
    Path(id): Path<i64>,
) -> Result<Json<Letter>, AppError> {
    let row: Option<Letter> =
        sqlx::query_as("SELECT id, char, audio_path FROM letters WHERE id = ?")
            .bind(id)
            .fetch_optional(&state.db)
            .await?;
    row.map(Json).ok_or_else(|| AppError::NotFound(format!("letter {} not found", id)))
}

pub async fn create_letter(
    State(state): State<AppState>,
    Json(payload): Json<CreateLetter>,
) -> Result<Json<Letter>, AppError> {
    if payload.char.trim().is_empty() {
        return Err(AppError::BadRequest("char is empty".into()));
    }
    let res = sqlx::query("INSERT INTO letters (char, audio_path) VALUES (?, ?)")
        .bind(&payload.char)
        .bind(&payload.audio_path)
        .execute(&state.db)
        .await
        .map_err(|e| {
            if e.to_string().contains("UNIQUE") {
                AppError::BadRequest("letter already exists".into())
            } else {
                AppError::Internal(e.to_string())
            }
        })?;
    let id = res.last_insert_rowid();
    get_letter(State(state), Path(id)).await
}
