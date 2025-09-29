import { pool } from './db.js';

export async function createSemanticTask({ user_id, main_keyword }) {
  const [result] = await pool.execute(
    `INSERT INTO semantic_tasks (user_id, main_keyword) VALUES (?, ?)`,
    [user_id, main_keyword]
  );
  return { id: result.insertId, user_id, main_keyword, status: 'pending' };
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
    `UPDATE semantic_tasks SET status = 'ready', result_keywords = ?, updated_at = current_timestamp() WHERE id = ?`,
    [JSON.stringify(keywords), id]
  );
}
