// Основной файл сервера Express
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createPool } from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';


// Для поддержки __dirname в ES-модулях
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;


app.use(cors());
app.use(bodyParser.json());

// Раздача статики React (build)
app.use(express.static(path.join(__dirname, '../client/build')));

// MariaDB pool
const pool = createPool({
  host: '127.0.0.1',
  user: 'seo_user',
  password: 'y7Jk2pQw9s',
  database: 'seo_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Скачать сгенерированный текст заказа в .txt
app.get('/download-text/:id', async (req, res) => {
  const { id } = req.params;
  const [rows] = await pool.execute('SELECT * FROM seo_orders WHERE id = ?', [id]);
  if (!rows.length || !rows[0].text) return res.status(404).send('Text not found');
  const keyword = rows[0].keyword;
  const text = rows[0].text;
  res.setHeader('Content-Disposition', `attachment; filename="seo-text-${id}.txt"`);
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(text);
});

// Создание заказа (pay=0, ожидание оплаты, с уникальным токеном)
import crypto from 'crypto';

app.post('/create-order', async (req, res) => {
  const { keyword } = req.body;
  if (!keyword) return res.status(400).json({ error: 'keyword required' });

  // Генерируем уникальный токен
  let token;
  let isUnique = false;
  while (!isUnique) {
    token = crypto.randomBytes(24).toString('hex');
    const [rows] = await pool.execute('SELECT id FROM seo_orders WHERE token = ?', [token]);
    if (rows.length === 0) isUnique = true;
  }

  const [result] = await pool.execute(
    'INSERT INTO seo_orders (token, keyword, pay) VALUES (?, ?, 0)',
    [token, keyword]
  );
  res.json({ id: result.insertId, token, keyword, pay: 0, text: null });
});

// Получение всех заказов
app.get('/orders', async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM seo_orders');
  res.json(rows);
});


// Оплата всех неоплаченных заказов (корзины)
app.post('/pay-orders', async (req, res) => {
  const [result] = await pool.execute('UPDATE seo_orders SET pay = 1 WHERE pay = 0');
  res.json({ success: true, affectedRows: result.affectedRows });
});

// Генерация текста для заказа
app.post('/generate-text/:id', async (req, res) => {
  const { id } = req.params;
  const { text } = req.body; // Получаем текст от внешнего бота
  
  const [orderRows] = await pool.execute('SELECT * FROM seo_orders WHERE id = ?', [id]);
  if (!orderRows.length) return res.status(404).json({ error: 'Order not found' });
  
  // Используем текст от бота или генерируем простой шаблон
  const generatedText = text || `SEO текст для ключевого слова: "${orderRows[0].keyword}". Ваш бизнес будет расти!`;
  
  await pool.execute('UPDATE seo_orders SET text = ? WHERE id = ?', [generatedText, id]);
  res.json({ id, text: generatedText });
});



// SPA fallback: отдаём index.html только для не-API маршрутов
app.get('*', (req, res, next) => {
  if (
    req.path.startsWith('/orders') ||
    req.path.startsWith('/create-order') ||
    req.path.startsWith('/pay-orders') ||
    req.path.startsWith('/generate-text')
  ) {
    return next(); // пропускаем запрос к API
  }
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});
