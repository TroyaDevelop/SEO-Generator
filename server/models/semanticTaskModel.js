import { pool } from './db.js';
import crypto from 'crypto';

export async function createSemanticTask({ user_id, main_keyword }) {
  // generate unique token similar to seo_orders
  let token;
  let isUnique = false;
  while (!isUnique) {
    token = crypto.randomBytes(24).toString('hex');
    const [rows] = await pool.execute('SELECT id FROM semantic_tasks WHERE token = ?', [token]);
    if (rows.length === 0) isUnique = true;
  }
  const [result] = await pool.execute(
    `INSERT INTO semantic_tasks (user_id, token, main_keyword, pay) VALUES (?, ?, ?, 1)`,
    [user_id, token, main_keyword]
  );
  return { id: result.insertId, user_id, token, main_keyword, pay: 1 };
}

export async function getSemanticTaskById(id) {
  const [rows] = await pool.execute(
    `SELECT * FROM semantic_tasks WHERE id = ?`,
    [id]
  );
  if (rows.length === 0) return null;
  const row = rows[0];
  let parsed = [];
  let raw = row.result_keywords;
  if (raw) {
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      // invalid JSON stored in DB — keep parsed as empty and expose raw for debugging
      console.error('Failed to parse result_keywords for semantic_task', id, err && err.message);
      // Try a simple sanitize pass: remove trailing commas before ] or }
      try {
        const cleaned = raw.replace(/,\s*(?=[\]\}])/g, '');
        parsed = JSON.parse(cleaned);
        // keep raw too but indicate we sanitized
        return {
          ...row,
          result_keywords: parsed,
          result_keywords_raw: raw,
          result_keywords_sanitized: true
        };
      } catch (err2) {
        // still invalid
        parsed = [];
      }
    }
  }
  return {
    ...row,
    result_keywords: parsed,
    result_keywords_raw: raw,
    result_keywords_sanitized: false
  };
}

export async function markSemanticTaskReady(id, keywords) {
  await pool.execute(
    `UPDATE semantic_tasks SET pay = 3, result_keywords = ?, updated_at = current_timestamp() WHERE id = ?`,
    [JSON.stringify(keywords), id]
  );
}
