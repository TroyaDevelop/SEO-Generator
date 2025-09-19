import { pool } from './db.js';
import crypto from 'crypto';

// Для ZennoPoster: получить все заказы, которые нужно сгенерировать (pay=1, text=null)
export async function getTasksForBot() {
  const [orders] = await pool.execute('SELECT * FROM seo_orders WHERE pay = 1 AND text IS NULL');
  return orders;
}

// Для ZennoPoster: сохранить сгенерированный текст и обновить статус заказа
export async function completeTaskForBot(orderId, text) {
  await pool.execute('UPDATE seo_orders SET text = ?, pay = 3 WHERE id = ?', [text, orderId]);
  const [orders] = await pool.execute('SELECT * FROM seo_orders WHERE id = ?', [orderId]);
  return orders[0] || null;
}

export async function getOrdersByUser(userId) {
  const [orders] = await pool.execute('SELECT * FROM seo_orders WHERE user_id = ? ORDER BY id DESC', [userId]);
  return orders;
}

export async function createOrderForUser(userId, keyword) {
  // Генерируем уникальный токен
  let token;
  let isUnique = false;
  while (!isUnique) {
    token = crypto.randomBytes(24).toString('hex');
    const [rows] = await pool.execute('SELECT id FROM seo_orders WHERE token = ?', [token]);
    if (rows.length === 0) isUnique = true;
  }
  await pool.execute('INSERT INTO seo_orders (user_id, keyword, token, pay) VALUES (?, ?, ?, 0)', [userId, keyword, token]);
  return token;
}

export async function payOrdersForUser(userId) {
  await pool.execute('UPDATE seo_orders SET pay = 1 WHERE user_id = ? AND pay = 0', [userId]);
}

export async function getOrderTextById(orderId, userId) {
  const [orders] = await pool.execute('SELECT text FROM seo_orders WHERE id = ? AND user_id = ? AND pay = 3', [orderId, userId]);
  return orders[0]?.text || null;
}
