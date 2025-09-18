import { createPool } from 'mysql2/promise';

export const pool = createPool({
  host: '127.0.0.1',
  user: 'seo_user',
  password: 'y7Jk2pQw9s',
  database: 'seo_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
