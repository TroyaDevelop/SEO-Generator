import { pool } from './db.js';

export async function getOrdersByUser(userId) {
  const [orders] = await pool.execute('SELECT * FROM seo_orders WHERE user_id = ? ORDER BY id DESC', [userId]);
  return orders;
}

export async function createOrderForUser(userId, keyword) {
  await pool.execute('INSERT INTO seo_orders (user_id, keyword, pay) VALUES (?, ?, 0)', [userId, keyword]);
}

export async function payOrdersForUser(userId) {
  await pool.execute('UPDATE seo_orders SET pay = 1 WHERE user_id = ? AND pay = 0', [userId]);
}

export async function getOrderTextById(orderId, userId) {
  const [orders] = await pool.execute('SELECT text FROM seo_orders WHERE id = ? AND user_id = ? AND pay = 3', [orderId, userId]);
  return orders[0]?.text || null;
}
