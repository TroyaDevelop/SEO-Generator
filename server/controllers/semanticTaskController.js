import { createSemanticTask, getSemanticTaskById } from '../models/semanticTaskModel.js';

// POST /semantic-tasks
export async function createSemanticTaskHandler(req, res) {
  try {
    const user_id = req.user.id;
    const { main_keyword } = req.body;
    if (!main_keyword || typeof main_keyword !== 'string' || main_keyword.trim().length < 5) {
      return res.status(400).json({ error: 'Некорректное ключевое слово (минимум 5 символов)' });
    }
    const task = await createSemanticTask({ user_id, main_keyword });
    res.status(201).json(task);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// GET /semantic-tasks/:id
export async function getSemanticTaskHandler(req, res) {
  try {
    const { id } = req.params;
    const task = await getSemanticTaskById(id);
    if (!task) return res.status(404).json({ error: 'Задача не найдена' });
    // Security: only owner can fetch
    if (req.user && req.user.id !== task.user_id) return res.status(403).json({ error: 'Forbidden' });
    res.json(task);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// For bot: get pending tasks
import { markSemanticTaskReady } from '../models/semanticTaskModel.js';
export async function getPendingSemanticTasksHandler(req, res) {
  try {
    const [rows] = await import('../models/db.js').then(m => m.pool.execute(`SELECT * FROM semantic_tasks WHERE status = 'pending'`));
    const tasks = rows.map(r => ({ id: r.id, user_id: r.user_id, main_keyword: r.main_keyword }));
    res.json(tasks);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// Bot posts completed keywords
export async function completeSemanticTaskHandler(req, res) {
  try {
    const { id } = req.params;
    const { keywords } = req.body;
    if (!Array.isArray(keywords)) return res.status(400).json({ error: 'Invalid keywords' });
    await markSemanticTaskReady(id, keywords);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
