import { pool } from './db.js';

// Создать SEO-страницу
export async function createSeoPage(data) {
	const {
		main_keyword, city, country, semantic_keywords, images, phone,
		category, subcategory, company_name, video_url, status = 'pending', user_id
	} = data;
	const [result] = await pool.execute(
		`INSERT INTO seo_pages (main_keyword, city, country, semantic_keywords, images, phone, category, subcategory, company_name, video_url, status, user_id)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		[main_keyword, city, country, JSON.stringify(semantic_keywords), JSON.stringify(images), phone, category, subcategory, company_name, video_url, status, user_id]
	);
	return { id: result.insertId, ...data };
}

// Получить все страницы пользователя
export async function getSeoPagesByUser(userId) {
	const [rows] = await pool.execute('SELECT * FROM seo_pages WHERE user_id = ? ORDER BY created_at DESC', [userId]);
	return rows;
}

// Для бота: получить страницы со статусом ready
export async function getReadySeoPagesForBot() {
	const [rows] = await pool.execute("SELECT * FROM seo_pages WHERE status = 'ready'");
	return rows;
}

// Для бота: опубликовать страницу (status = published)
export async function publishSeoPageById(id) {
	await pool.execute("UPDATE seo_pages SET status = 'published' WHERE id = ?", [id]);
	const [rows] = await pool.execute('SELECT * FROM seo_pages WHERE id = ?', [id]);
	return rows[0] || null;
}
