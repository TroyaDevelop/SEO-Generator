import { pool } from './db.js';

export async function getUserByEmail(email) {
  const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
  return users[0] || null;
}

export async function createUser(email, password_hash) {
  const [result] = await pool.execute('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, password_hash]);
  return result;
}
