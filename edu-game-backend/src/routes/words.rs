use axum::{
    extract::{Path, State},
    Json,
};
use crate::{
    error::AppError,
    models::{CreateWord, Word},
    state::AppState,
};

pub async fn list_words(State(state): State<AppState>) -> Result<Json<Vec<Word>>, AppError> {
    let rows: Vec<Word> =
        sqlx::query_as("SELECT id, text, audio_path, image_path FROM words ORDER BY id")
            .fetch_all(&state.db)
            .await?;
    Ok(Json(rows))
}

pub async fn get_word(
    State(state): State<AppState>,
    Path(id): Path<i64>,
) -> Result<Json<Word>, AppError> {
    let row: Option<Word> =
        sqlx::query_as("SELECT id, text, audio_path, image_path FROM words WHERE id = ?")
            .bind(id)
            .fetch_optional(&state.db)
            .await?;
    row.map(Json)
        .ok_or_else(|| AppError::NotFound(format!("word {} not found", id)))
}

pub async fn create_word(
    State(state): State<AppState>,
    Json(payload): Json<CreateWord>,
) -> Result<Json<Word>, AppError> {
    if payload.text.trim().is_empty() {
        return Err(AppError::BadRequest("text is empty".into()));
    }
    let res = sqlx::query("INSERT INTO words (text, audio_path, image_path) VALUES (?, ?, ?)")
        .bind(&payload.text)
        .bind(&payload.audio_path)
        .bind(&payload.image_path)
        .execute(&state.db)
        .await
        .map_err(|e| {
            if e.to_string().contains("UNIQUE") {
                AppError::BadRequest("word already exists".into())
            } else {
                AppError::Internal(e.to_string())
            }
        })?;
    let id = res.last_insert_rowid();
    get_word(State(state), Path(id)).await
}
