import path from 'path';
import fs from 'fs';
import { pool } from '../models/db.js';

// POST /seo-pages/:id/upload-image
export async function uploadSeoPageImageHandler(req, res) {
  try {
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ error: 'Файл не загружен' });
    // Получить текущие images
    const [rows] = await pool.execute('SELECT images FROM seo_pages WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Страница не найдена' });
    let images = [];
    try { images = JSON.parse(rows[0].images || '[]'); } catch { images = []; }
    images.push(req.file.filename);
    await pool.execute('UPDATE seo_pages SET images = ? WHERE id = ?', [JSON.stringify(images), id]);
    res.json({ success: true, filename: req.file.filename, images });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
