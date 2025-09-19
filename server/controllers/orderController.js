import { 
  getOrdersByUser, 
  createOrderForUser, 
  payOrdersForUser, 
  getOrderTextById,
  getOrderByToken 
} from '../models/orderModel.js';

export async function getOrders(req, res) {
  try {
    const orders = await getOrdersByUser(req.user.id);
    res.json(orders);
  } catch (e) {
    res.status(500).json({ error: 'Ошибка получения заказов', details: e.message });
  }
}

export async function createOrder(req, res) {
  const { keyword } = req.body;
  if (!keyword) return res.status(400).json({ error: 'Не указано ключевое слово' });
  try {
    await createOrderForUser(req.user.id, keyword);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка создания заказа', details: e.message });
  }
}

export async function payOrders(req, res) {
  try {
    await payOrdersForUser(req.user.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка оплаты', details: e.message });
  }
}

export async function downloadText(req, res) {
  const { id } = req.params;
  try {
    const text = await getOrderTextById(id, req.user.id);
    if (!text) return res.status(404).send('Not found');
    res.setHeader('Content-Disposition', `attachment; filename="text_${id}.txt"`);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(text);
  } catch (e) {
    res.status(500).send('Ошибка скачивания');
  }
}

export async function downloadTextByToken(req, res) {
  const { token } = req.params;
  try {
    const order = await getOrderByToken(token);
    if (!order || !order.text) {
      return res.status(404).send('Файл не найден или еще не готов');
    }
    res.setHeader('Content-Disposition', `attachment; filename="text_${order.id}.txt"`);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(order.text);
  } catch (e) {
    res.status(500).send('Ошибка скачивания');
  }
}
