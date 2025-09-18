import express from 'express';
import { getTasks, completeTask } from '../controllers/taskController.js';

const router = express.Router();

// Для ZennoPoster: получить заказы на генерацию и сохранить результат
router.get('/tasks', getTasks);
router.post('/tasks/:id/complete', completeTask);

export default router;
