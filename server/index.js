
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import seoPageRoutes from './routes/seoPageRoutes.js';
import './controllers/semanticController.js'; // для esm-импорта, если потребуется

// Для поддержки __dirname в ES-модулях
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());
// Раздача статики React (build)
app.use(express.static(path.join(__dirname, '../client/build')));

// API роуты
app.use(userRoutes);
app.use(orderRoutes);
app.use(taskRoutes);
app.use(seoPageRoutes);
// Роут для генерации семантики теперь внутри seoPageRoutes

// SPA fallback: отдаём index.html только для не-API маршрутов
app.get('*', (req, res, next) => {
  if (
    req.path.startsWith('/orders') ||
    req.path.startsWith('/create-order') ||
    req.path.startsWith('/pay-orders') ||
    req.path.startsWith('/generate-text') ||
    req.path.startsWith('/tasks') ||
    req.path.startsWith('/download-text') ||
    req.path.startsWith('/download/')
  ) {
    return next(); // пропускаем запрос к API
  }
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});
