import express from 'express';
import { getOrders, createOrder, payOrders, downloadText } from '../controllers/orderController.js';
import { authMiddleware } from '../utils/auth.js';

const router = express.Router();

router.get('/orders', authMiddleware, getOrders);
router.post('/create-order', authMiddleware, createOrder);
router.post('/pay-orders', authMiddleware, payOrders);
router.get('/download-text/:id', authMiddleware, downloadText);

export default router;
