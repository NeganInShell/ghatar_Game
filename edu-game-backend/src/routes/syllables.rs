use axum::{
    extract::{Path, State},
    Json,
};
use crate::{
    error::AppError,
    models::{CreateSyllable, Syllable},
    state::AppState,
};

pub async fn list_syllables(
    State(state): State<AppState>,
) -> Result<Json<Vec<Syllable>>, AppError> {
    let rows: Vec<Syllable> =
        sqlx::query_as("SELECT id, text, audio_path FROM syllables ORDER BY id")
            .fetch_all(&state.db)
            .await?;
    Ok(Json(rows))
}

pub async fn get_syllable(
    State(state): State<AppState>,
    Path(id): Path<i64>,
) -> Result<Json<Syllable>, AppError> {
    let row: Option<Syllable> =
        sqlx::query_as("SELECT id, text, audio_path FROM syllables WHERE id = ?")
            .bind(id)
            .fetch_optional(&state.db)
            .await?;
    row.map(Json)
        .ok_or_else(|| AppError::NotFound(format!("syllable {} not found", id)))
}

pub async fn create_syllable(
    State(state): State<AppState>,
    Json(payload): Json<CreateSyllable>,
) -> Result<Json<Syllable>, AppError> {
    if payload.text.trim().is_empty() {
        return Err(AppError::BadRequest("text is empty".into()));
    }
    let res = sqlx::query("INSERT INTO syllables (text, audio_path) VALUES (?, ?)")
        .bind(&payload.text)
        .bind(&payload.audio_path)
        .execute(&state.db)
        .await
        .map_err(|e| {
            if e.to_string().contains("UNIQUE") {
                AppError::BadRequest("syllable already exists".into())
            } else {
                AppError::Internal(e.to_string())
            }
        })?;
    let id = res.last_insert_rowid();
    get_syllable(State(state), Path(id)).await
}
