import express from 'express';
import { createSemanticCollectionHandler, getSemanticCollectionHandler } from '../controllers/semanticCollectionController.js';
import { generateSemanticsHandler } from '../controllers/semanticController.js';
import { createSemanticTaskHandler, getSemanticTaskHandler, getPendingSemanticTasksHandler, completeSemanticTaskHandler, getSemanticTaskRawHandler } from '../controllers/semanticTaskController.js';
import {
  createSeoPageHandler,
  getSeoPagesHandler,
  getReadySeoPagesHandler,
  publishSeoPageHandler
} from '../controllers/seoPageController.js';
import { authMiddleware } from '../utils/auth.js';
import multer from 'multer';
import path from 'path';
import { uploadSeoPageImageHandler } from '../controllers/seoPageImageController.js';

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.resolve('uploads/seo_pages'));
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const name = path.basename(file.originalname, ext);
      cb(null, name + '-' + Date.now() + ext);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const router = express.Router();

// Генерация семантики по ключевому слову (бот)
router.post('/semantic/generate', generateSemanticsHandler);
// API для работы с подборками семантики (требует авторизации)
router.post('/semantic-collections/create', authMiddleware, createSemanticCollectionHandler);
router.get('/semantic-collections/:token', authMiddleware, getSemanticCollectionHandler);

// Semantic task endpoints (create task, get status/result)
router.post('/semantic-tasks', authMiddleware, createSemanticTaskHandler);
router.get('/semantic-tasks/:id', authMiddleware, getSemanticTaskHandler);

// Endpoints for bot
router.get('/tasks/semantic-tasks', getPendingSemanticTasksHandler);
router.post('/tasks/semantic-tasks/:id/complete', completeSemanticTaskHandler);
// debug raw row
router.get('/debug/semantic-tasks/:id', getSemanticTaskRawHandler);


// CRUD для пользователя
router.post('/seo-pages', authMiddleware, createSeoPageHandler);
router.get('/seo-pages', authMiddleware, getSeoPagesHandler);

// Загрузка изображений к SEO-странице
router.post('/seo-pages/:id/upload-image', upload.single('image'), uploadSeoPageImageHandler);

// Для бота
router.get('/tasks/seo-pages', getReadySeoPagesHandler);
router.post('/tasks/seo-pages/:id/publish', publishSeoPageHandler);

export default router;
