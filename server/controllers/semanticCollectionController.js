import { createSemanticCollection, getSemanticCollectionByToken } from '../models/semanticCollectionModel.js';
import crypto from 'crypto';

// POST /api/semantic-collections/create
export async function createSemanticCollectionHandler(req, res) {
  try {
    const user_id = req.user.id;
    const { main_keyword, semantic_keywords } = req.body;
    if (!main_keyword || typeof main_keyword !== 'string' || main_keyword.trim().length < 3) {
      return res.status(400).json({ error: 'Некорректное ключевое слово' });
    }
    if (!Array.isArray(semantic_keywords) || semantic_keywords.length === 0) {
      return res.status(400).json({ error: 'Нет подобранных ключевых слов' });
    }
    // Генерируем уникальный токен для подборки
    const token = crypto.randomBytes(16).toString('hex');
    const collection = await createSemanticCollection({ user_id, token, main_keyword, semantic_keywords });
    res.status(201).json({ ...collection });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// GET /api/semantic-collections/:token
export async function getSemanticCollectionHandler(req, res) {
  try {
    const user_id = req.user.id;
    const { token } = req.params;
    const collection = await getSemanticCollectionByToken(user_id, token);
    if (!collection) return res.status(404).json({ error: 'Подборка не найдена' });
    res.json(collection);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
