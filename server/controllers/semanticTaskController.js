import { createSemanticTask, getSemanticTaskById } from '../models/semanticTaskModel.js';
import { pool } from '../models/db.js';

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
    const [rows] = await import('../models/db.js').then(m => m.pool.execute(`SELECT * FROM semantic_tasks WHERE pay = 1`));
    const tasks = rows.map(r => ({ id: r.id, token: r.token, main_keyword: r.main_keyword }));
    res.json(tasks);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// Bot posts completed keywords
export async function completeSemanticTaskHandler(req, res) {
  try {
    const { id } = req.params;
    const { keywords, token } = req.body;
    if (!Array.isArray(keywords)) return res.status(400).json({ error: 'Invalid keywords' });
    // If token provided, prefer token-based lookup (bot may send token instead of id)
    if (token) {
      const [rows] = await import('../models/db.js').then(m => m.pool.execute(`SELECT id FROM semantic_tasks WHERE token = ?`, [token]));
      if (rows.length === 0) return res.status(404).json({ error: 'Task not found by token' });
      const foundId = rows[0].id;
      await markSemanticTaskReady(foundId, keywords);
      return res.json({ ok: true });
    }
    await markSemanticTaskReady(id, keywords);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// DEBUG: return raw row from semantic_tasks (no parsing) for troubleshooting
export async function getSemanticTaskRawHandler(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT * FROM semantic_tasks WHERE id = ?', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Not found' });
    return res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
