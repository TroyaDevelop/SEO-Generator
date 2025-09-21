import { pool } from './db.js';

// Создать новую подборку семантики
export async function createSemanticCollection({ user_id, token, main_keyword, semantic_keywords }) {
  const [result] = await pool.execute(
    `INSERT INTO semantic_collections (user_id, token, main_keyword, semantic_keywords) VALUES (?, ?, ?, ?)`,
    [user_id, token, main_keyword, JSON.stringify(semantic_keywords)]
  );
  return { id: result.insertId, user_id, token, main_keyword, semantic_keywords };
}


// Удалить подборку по токену и user_id
export async function deleteSemanticCollectionByToken(user_id, token) {
  await pool.execute(
    `DELETE FROM semantic_collections WHERE user_id = ? AND token = ?`,
    [user_id, token]
  );
}

// Получить подборку по токену и user_id
export async function getSemanticCollectionByToken(user_id, token) {
  const [rows] = await pool.execute(
    `SELECT * FROM semantic_collections WHERE user_id = ? AND token = ?`,
    [user_id, token]
  );
  if (rows.length === 0) return null;
  const row = rows[0];
  return {
    ...row,
    semantic_keywords: row.semantic_keywords ? JSON.parse(row.semantic_keywords) : []
  };
}
