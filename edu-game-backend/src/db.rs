use sqlx::sqlite::{SqlitePool, SqlitePoolOptions};

pub type Db = SqlitePool;

pub async fn init_db(database_url: &str) -> Result<Db, sqlx::Error> {
    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(database_url)
        .await?;

    // اجرای migration
    sqlx::query(include_str!("../migrations/001_init.sql"))
        .execute(&pool)
        .await?;

    tracing::info!("✅ Database initialized");

    Ok(pool)
}
