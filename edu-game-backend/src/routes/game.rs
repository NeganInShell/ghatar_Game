use axum::{
    extract::{Path, Query, State},
    Json,
};
use rand::seq::SliceRandom;
use serde::Deserialize;
use serde_json::{json, Value};

use crate::{error::AppError, state::AppState};

#[derive(Debug, Deserialize)]
pub struct StageQuery {
    pub count: Option<i64>,
}

/// پیکربندی ۲۰ ایستگاه: ساده → دشوار
/// (نوع، استخر محتوا)
fn station_config(station: i64) -> Option<(&'static str, Vec<&'static str>)> {
    match station {
        1 => Some(("letter-pick", vec!["ا", "ب", "م"])),
        2 => Some(("letter-pick", vec!["ن", "ر", "د"])),
        3 => Some(("letter-pick", vec!["س", "ت", "ز"])),
        4 => Some((
            "letter-pick",
            vec!["ا", "ب", "د", "ن", "ر", "س", "ت", "ز", "م", "خ"],
        )),
        5 => Some(("combine", vec!["ما", "با"])),
        6 => Some(("combine", vec!["نا", "را"])),
        7 => Some(("combine", vec!["سا", "تا"])),
        8 => Some(("combine", vec!["دا", "زا", "خا"])),
        9 => Some(("syllable-pick", vec!["ما", "با", "نا"])),
        10 => Some(("syllable-pick", vec!["را", "سا", "تا"])),
        11 => Some(("syllable-pick", vec!["دا", "زا", "خا"])),
        12 => Some((
            "syllable-pick",
            vec!["ما", "با", "نا", "را", "سا", "تا", "دا", "زا", "خا"],
        )),
        13 => Some(("build", vec!["ما", "با"])),
        14 => Some(("build", vec!["نا", "را"])),
        15 => Some(("build", vec!["سا", "تا"])),
        16 => Some(("build", vec!["دا", "زا", "خا"])),
        17 => Some((
            "word-read",
            vec![
                "آب", "بابا", "نان", "باد", "در", "سر", "خر", "بز", "نام", "ابر", "من",
            ],
        )),
        18 => Some((
            "word-read",
            vec![
                "مادر", "برادر", "دختر", "باران", "مار", "درخت", "آسمان", "خزان", "انار",
                "ماست", "خرما",
            ],
        )),
        19 => Some((
            "word-read",
            vec![
                "خرس", "اسب", "سبز", "سرخ", "زرد", "مداد", "درس", "سبد", "تمبر", "تاب",
                "ساز", "تار",
            ],
        )),
        20 => Some((
            "word-read",
            vec![
                "زن", "مرد", "دست", "راز", "دبستان", "درست", "آسان", "داستان", "دندان",
                "نترس",
            ],
        )),
        _ => None,
    }
}

fn shuffled_options(all: &[String], correct: &str, n: usize) -> Vec<String> {
    let mut rng = rand::thread_rng();
    let mut pool: Vec<String> = all.iter().filter(|c| *c != correct).cloned().collect();
    pool.shuffle(&mut rng);
    let mut out = vec![correct.to_string()];
    out.extend(pool.into_iter().take(n));
    out.shuffle(&mut rng);
    out
}

fn cycle_fill<T: Clone>(items: Vec<T>, count: usize) -> Vec<T> {
    if items.is_empty() {
        return vec![];
    }
    let mut out = Vec::with_capacity(count);
    let mut i = 0;
    while out.len() < count {
        out.push(items[i % items.len()].clone());
        i += 1;
    }
    let mut rng = rand::thread_rng();
    out.shuffle(&mut rng);
    out
}

fn split_syllable(syl: &str) -> (String, String) {
    let chars: Vec<String> = syl.chars().map(|c| c.to_string()).collect();
    if chars.len() >= 2 {
        (chars[0].clone(), chars[chars.len() - 1].clone())
    } else {
        (syl.to_string(), "ا".to_string())
    }
}

/// endpoint قدیمی ۱..۵ (سازگار با قبل) — حالا با ترتیب تصادفی واقعی
pub async fn stage_questions(
    State(state): State<AppState>,
    Path(stage): Path<i64>,
    Query(q): Query<StageQuery>,
) -> Result<Json<Value>, AppError> {
    if !(1..=5).contains(&stage) {
        return Err(AppError::BadRequest("stage must be 1..5".into()));
    }
    let count = q.count.unwrap_or(4).clamp(3, 5);

    match stage {
        1 => {
            let letters: Vec<(i64, String)> =
                sqlx::query_as("SELECT id, char FROM letters ORDER BY RANDOM() LIMIT ?")
                    .bind(count)
                    .fetch_all(&state.db)
                    .await?;
            let all_letters: Vec<String> =
                sqlx::query_scalar("SELECT char FROM letters ORDER BY id")
                    .fetch_all(&state.db)
                    .await?;
            let mut questions = vec![];
            for (id, ch) in letters {
                let options = shuffled_options(&all_letters, &ch, 2);
                questions.push(json!({
                    "id": id, "type": "letter-pick",
                    "prompt": ch,
                    "instruction": format!("حرف «{}» را پیدا کن 👀", ch),
                    "options": options, "correct": ch,
                    "sound": format!("/sounds/letters/letter-{}.mp3", ch),
                    "image": null,
                }));
            }
            Ok(Json(json!({ "stage": 1, "questions": questions })))
        }
        2 => {
            let syllables: Vec<(i64, String)> =
                sqlx::query_as("SELECT id, text FROM syllables ORDER BY RANDOM() LIMIT ?")
                    .bind(count)
                    .fetch_all(&state.db)
                    .await?;
            let mut questions = vec![];
            for (id, syl) in syllables {
                let (a, b) = split_syllable(&syl);
                questions.push(json!({
                    "id": id, "type": "combine",
                    "a": a, "b": b, "result": syl,
                    "instruction": format!("{} + {} = ؟ 🚂", a, b),
                    "sound": format!("/sounds/combine/combine-{}-{}.mp3", a, b),
                    "resultSound": format!("/sounds/syllables/syllable-{}.mp3", syl),
                }));
            }
            Ok(Json(json!({ "stage": 2, "questions": questions })))
        }
        3 => {
            let syllables: Vec<(i64, String)> =
                sqlx::query_as("SELECT id, text FROM syllables ORDER BY RANDOM() LIMIT ?")
                    .bind(count)
                    .fetch_all(&state.db)
                    .await?;
            let all: Vec<String> = sqlx::query_scalar("SELECT text FROM syllables ORDER BY id")
                .fetch_all(&state.db)
                .await?;
            let mut questions = vec![];
            for (id, syl) in syllables {
                let options = shuffled_options(&all, &syl, 2);
                questions.push(json!({
                    "id": id, "type": "syllable-pick",
                    "prompt": syl,
                    "instruction": format!("«{}» کدومه؟ 👂", syl),
                    "options": options, "correct": syl,
                    "sound": format!("/sounds/syllables/syllable-{}.mp3", syl),
                }));
            }
            Ok(Json(json!({ "stage": 3, "questions": questions })))
        }
        4 => {
            let syllables: Vec<(i64, String)> =
                sqlx::query_as("SELECT id, text FROM syllables ORDER BY RANDOM() LIMIT ?")
                    .bind(count)
                    .fetch_all(&state.db)
                    .await?;
            let mut questions = vec![];
            for (id, syl) in syllables {
                let (a, b) = split_syllable(&syl);
                let mut pool = vec![a.clone(), b.clone(), "ب".to_string(), "ن".to_string()];
                pool.sort();
                pool.dedup();
                pool.shuffle(&mut rand::thread_rng());
                questions.push(json!({
                    "id": id, "type": "build",
                    "result": syl, "parts": [a, b], "pool": pool,
                    "instruction": format!("با کارت‌ها «{}» را بساز 🧩", syl),
                    "sound": format!("/sounds/syllables/syllable-{}.mp3", syl),
                }));
            }
            Ok(Json(json!({ "stage": 4, "questions": questions })))
        }
        _ => {
            let words: Vec<(i64, String, Option<String>)> = sqlx::query_as(
                "SELECT id, text, image_path FROM words ORDER BY RANDOM() LIMIT ?",
            )
            .bind(count)
            .fetch_all(&state.db)
            .await?;
            let all_words: Vec<String> = sqlx::query_scalar("SELECT text FROM words ORDER BY id")
                .fetch_all(&state.db)
                .await?;
            let mut questions = vec![];
            for (id, w, emoji) in words {
                let options = shuffled_options(&all_words, &w, 2);
                questions.push(json!({
                    "id": id, "type": "word-read",
                    "word": w,
                    "emoji": emoji.clone().unwrap_or("⭐".to_string()),
                    "image": format!("/images/words/word-{}.svg", w),
                    "instruction": "این کلمه را بخوان 📖",
                    "options": options, "correct": w,
                    "sound": format!("/sounds/words/word-{}.mp3", w),
                }));
            }
            Ok(Json(json!({ "stage": 5, "questions": questions })))
        }
    }
}

/// endpoint جدید ۱..۲۰
pub async fn station_questions(
    State(state): State<AppState>,
    Path(station): Path<i64>,
    Query(q): Query<StageQuery>,
) -> Result<Json<Value>, AppError> {
    let (qtype, pool) = station_config(station)
        .ok_or_else(|| AppError::BadRequest("station must be 1..20".into()))?;
    let count = q.count.unwrap_or(4).clamp(3, 5);

    match qtype {
        "letter-pick" => {
            let placeholders = vec!["?"; pool.len()].join(",");
            let sql = format!(
                "SELECT id, char FROM letters WHERE char IN ({})",
                placeholders
            );
            let mut query = sqlx::query_as::<_, (i64, String)>(&sql);
            for p in &pool {
                query = query.bind(p);
            }
            let rows: Vec<(i64, String)> = query.fetch_all(&state.db).await?;
            let all_letters: Vec<String> =
                sqlx::query_scalar("SELECT char FROM letters ORDER BY id")
                    .fetch_all(&state.db)
                    .await?;
            let picked = cycle_fill(rows, count as usize);
            let mut questions = vec![];
            for (id, ch) in picked {
                questions.push(json!({
                    "id": id, "type": "letter-pick",
                    "prompt": ch,
                    "instruction": format!("حرف «{}» را پیدا کن 👀", ch),
                    "options": shuffled_options(&all_letters, &ch, 2),
                    "correct": ch,
                    "sound": format!("/sounds/letters/letter-{}.mp3", ch),
                }));
            }
            Ok(Json(json!({ "station": station, "type": qtype, "questions": questions })))
        }
        "combine" => {
            let placeholders = vec!["?"; pool.len()].join(",");
            let sql = format!(
                "SELECT id, text FROM syllables WHERE text IN ({})",
                placeholders
            );
            let mut query = sqlx::query_as::<_, (i64, String)>(&sql);
            for p in &pool {
                query = query.bind(p);
            }
            let rows: Vec<(i64, String)> = query.fetch_all(&state.db).await?;
            let picked = cycle_fill(rows, count as usize);
            let mut questions = vec![];
            for (id, syl) in picked {
                let (a, b) = split_syllable(&syl);
                questions.push(json!({
                    "id": id, "type": "combine",
                    "a": a, "b": b, "result": syl,
                    "instruction": format!("{} + {} = ؟ 🚂", a, b),
                    "sound": format!("/sounds/combine/combine-{}-{}.mp3", a, b),
                    "resultSound": format!("/sounds/syllables/syllable-{}.mp3", syl),
                }));
            }
            Ok(Json(json!({ "station": station, "type": qtype, "questions": questions })))
        }
        "syllable-pick" => {
            let placeholders = vec!["?"; pool.len()].join(",");
            let sql = format!(
                "SELECT id, text FROM syllables WHERE text IN ({})",
                placeholders
            );
            let mut query = sqlx::query_as::<_, (i64, String)>(&sql);
            for p in &pool {
                query = query.bind(p);
            }
            let rows: Vec<(i64, String)> = query.fetch_all(&state.db).await?;
            let all: Vec<String> = sqlx::query_scalar("SELECT text FROM syllables ORDER BY id")
                .fetch_all(&state.db)
                .await?;
            let picked = cycle_fill(rows, count as usize);
            let mut questions = vec![];
            for (id, syl) in picked {
                questions.push(json!({
                    "id": id, "type": "syllable-pick",
                    "prompt": syl,
                    "instruction": format!("«{}» کدومه؟ 👂", syl),
                    "options": shuffled_options(&all, &syl, 2),
                    "correct": syl,
                    "sound": format!("/sounds/syllables/syllable-{}.mp3", syl),
                }));
            }
            Ok(Json(json!({ "station": station, "type": qtype, "questions": questions })))
        }
        "build" => {
            let placeholders = vec!["?"; pool.len()].join(",");
            let sql = format!(
                "SELECT id, text FROM syllables WHERE text IN ({})",
                placeholders
            );
            let mut query = sqlx::query_as::<_, (i64, String)>(&sql);
            for p in &pool {
                query = query.bind(p);
            }
            let rows: Vec<(i64, String)> = query.fetch_all(&state.db).await?;
            let picked = cycle_fill(rows, count as usize);
            let mut questions = vec![];
            for (id, syl) in picked {
                let (a, b) = split_syllable(&syl);
                let mut card_pool = vec![a.clone(), b.clone(), "ب".to_string(), "ن".to_string()];
                card_pool.sort();
                card_pool.dedup();
                card_pool.shuffle(&mut rand::thread_rng());
                questions.push(json!({
                    "id": id, "type": "build",
                    "result": syl, "parts": [a, b], "pool": card_pool,
                    "instruction": format!("با کارت‌ها «{}» را بساز 🧩", syl),
                    "sound": format!("/sounds/syllables/syllable-{}.mp3", syl),
                }));
            }
            Ok(Json(json!({ "station": station, "type": qtype, "questions": questions })))
        }
        _ => {
            let placeholders = vec!["?"; pool.len()].join(",");
            let sql = format!(
                "SELECT id, text, image_path FROM words WHERE text IN ({})",
                placeholders
            );
            let mut query = sqlx::query_as::<_, (i64, String, Option<String>)>(&sql);
            for p in &pool {
                query = query.bind(p);
            }
            let rows: Vec<(i64, String, Option<String>)> =
                query.fetch_all(&state.db).await?;
            let all_words: Vec<String> = sqlx::query_scalar("SELECT text FROM words ORDER BY id")
                .fetch_all(&state.db)
                .await?;
            let picked = cycle_fill(rows, count as usize);
            let mut questions = vec![];
            for (id, w, emoji) in picked {
                questions.push(json!({
                    "id": id, "type": "word-read",
                    "word": w,
                    "emoji": emoji.clone().unwrap_or("⭐".to_string()),
                    "image": format!("/images/words/word-{}.svg", w),
                    "instruction": "این کلمه را بخوان 📖",
                    "options": shuffled_options(&all_words, &w, 2),
                    "correct": w,
                    "sound": format!("/sounds/words/word-{}.mp3", w),
                }));
            }
            Ok(Json(json!({ "station": station, "type": qtype, "questions": questions })))
        }
    }
}
