import {
  createSeoPage,
  getSeoPagesByUser,
  getReadySeoPagesForBot,
  publishSeoPageById
} from '../models/seoPageModel.js';
import { deleteSemanticCollectionByToken } from '../models/semanticCollectionModel.js';

// POST /seo-pages
export async function createSeoPageHandler(req, res) {
  try {
    const userId = req.user.id;
    const {
      main_keyword, city, country, semantic_keywords, images, phone,
      category, subcategory, company_name, video_url, semToken
    } = req.body;

    // Валидация: ключевое слово
    if (!main_keyword || typeof main_keyword !== 'string' || main_keyword.trim().length < 3) {
      return res.status(400).json({ error: 'Основное ключевое слово должно быть не короче 3 символов' });
    }
    // Валидация: телефон (простой паттерн)
    if (phone && !/^\+?[0-9\-() ]{7,}$/.test(phone)) {
      return res.status(400).json({ error: 'Некорректный формат телефона' });
    }
    // Валидация: ссылка на видео
    if (!video_url || !/^https?:\/\/.+/.test(video_url)) {
      return res.status(400).json({ error: 'Укажите корректную ссылку на видео' });
    }
    // Валидация: semantic_keywords (минимум 1, каждый не короче 3 символов)
    let sems = semantic_keywords;
    if (typeof sems === 'string') {
      try { sems = JSON.parse(sems); } catch { sems = []; }
    }
    if (!Array.isArray(sems) || sems.length === 0 || sems.some(k => typeof k !== 'string' || k.trim().length < 3)) {
      return res.status(400).json({ error: 'Добавьте хотя бы одно ключевое слово (минимум 3 символа)' });
    }

    const page = await createSeoPage({ ...req.body, user_id: userId });

    // Если был передан токен подборки — удалить подборку после создания страницы
    if (semToken) {
      await deleteSemanticCollectionByToken(userId, semToken);
    }

    res.status(201).json(page);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

// GET /seo-pages
export async function getSeoPagesHandler(req, res) {
  try {
    const userId = req.user.id;
    const pages = await getSeoPagesByUser(userId);
    res.json(pages);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// GET /tasks/seo-pages (для бота)
export async function getReadySeoPagesHandler(req, res) {
  try {
    const pages = await getReadySeoPagesForBot();
    res.json(pages);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// POST /tasks/seo-pages/:id/publish (для бота)
export async function publishSeoPageHandler(req, res) {
  try {
    const { id } = req.params;
    const page = await publishSeoPageById(id);
    res.json(page);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}
