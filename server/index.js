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
  host: 'localhost',
  user: 'seo_user',
  password: 'y7Jk2pQw9s',
  database: 'seo_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Создание заказа
// Создание заказа (pay=0, ожидание оплаты)
app.post('/create-order', async (req, res) => {
  const { keyword } = req.body;
  if (!keyword) return res.status(400).json({ error: 'keyword required' });
  const [result] = await pool.execute(
    'INSERT INTO seo_orders (keyword, pay) VALUES (?, 0)',
    [keyword]
  );
  res.json({ id: result.insertId, keyword, pay: 0, text: null });
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
  // Простой шаблон генерации текста
  const [orderRows] = await pool.execute('SELECT * FROM seo_orders WHERE id = ?', [id]);
  if (!orderRows.length) return res.status(404).json({ error: 'Order not found' });
  const keyword = orderRows[0].keyword;
  const generatedText = `SEO текст для ключевого слова: "${keyword}". Ваш бизнес будет расти!`;
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
