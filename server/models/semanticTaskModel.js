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
  return {
    ...row,
    result_keywords: row.result_keywords ? JSON.parse(row.result_keywords) : []
  };
}

export async function markSemanticTaskReady(id, keywords) {
  await pool.execute(
    `UPDATE semantic_tasks SET pay = 2, result_keywords = ?, updated_at = current_timestamp() WHERE id = ?`,
    [JSON.stringify(keywords), id]
  );
}
