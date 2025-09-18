import { getTasksForBot, completeTaskForBot } from '../models/orderModel.js';

// GET /tasks — получить все заказы для генерации (pay=1, text=null)
export async function getTasks(req, res) {
  try {
    const tasks = await getTasksForBot();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
}

// POST /tasks/:id/complete — сохранить сгенерированный текст
export async function completeTask(req, res) {
  const { id } = req.params;
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });
  try {
    const updated = await completeTaskForBot(id, text);
    if (!updated) return res.status(404).json({ error: 'Order not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
}
