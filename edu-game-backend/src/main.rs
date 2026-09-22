mod db;
mod error;
mod models;
mod routes;
mod seed;
mod state;

use axum::{
    extract::State,
    routing::{delete, get, post},
    Json, Router,
};
use serde_json::{json, Value};
use std::net::SocketAddr;
use tower_http::cors::{Any, CorsLayer};

use crate::state::AppState;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();
    dotenvy::dotenv().ok();

    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "sqlite:data/edu_game.db?mode=rwc".to_string());

    let db = db::init_db(&database_url)
        .await
        .expect("Failed to init database");

    seed::seed(&db).await.expect("Failed to seed database");

    let state = AppState { db };

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/api/health", get(health))
        .route("/api/db-check", get(db_check))
        .route(
            "/api/letters",
            get(routes::letters::list_letters).post(routes::letters::create_letter),
        )
        .route("/api/letters/:id", get(routes::letters::get_letter))
        .route(
            "/api/syllables",
            get(routes::syllables::list_syllables).post(routes::syllables::create_syllable),
        )
        .route("/api/syllables/:id", get(routes::syllables::get_syllable))
        .route(
            "/api/words",
            get(routes::words::list_words).post(routes::words::create_word),
        )
        .route("/api/words/:id", get(routes::words::get_word))
        .route(
            "/api/game/stage/:stage",
            get(routes::game::stage_questions),
        )
        .route(
            "/api/game/station/:station",
            get(routes::game::station_questions),
        )
        .route("/api/progress", post(routes::progress::save_progress))
        .route(
            "/api/progress/:child_id",
            get(routes::progress::get_progress).delete(routes::progress::clear_progress),
        )
        .route("/api/answers", post(routes::answers::save_answer))
        .route(
            "/api/answers/:child_id",
            get(routes::answers::get_answers).delete(routes::answers::clear_answers),
        )
        .route(
            "/api/history/:child_id",
            delete(routes::history::clear_history),
        )
        .layer(cors)
        .with_state(state);

    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    tracing::info!("🚀 Server running on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn health() -> &'static str {
    "OK"
}

async fn db_check(State(state): State<AppState>) -> Json<Value> {
    let result: Result<(i64,), sqlx::Error> = sqlx::query_as("SELECT 1").fetch_one(&state.db).await;

    match result {
        Ok(_) => Json(json!({
            "status": "ok",
            "database": "connected"
        })),
        Err(e) => Json(json!({
            "status": "error",
            "database": e.to_string()
        })),
    }
}
