

import React, { useState, useEffect } from 'react';
import bg from '../../assets/svg/background.svg';
import styles from './SeoPagesPanel.module.scss';

export default function SeoPagesPanel() {
  // Состояния для формы (минимальный каркас)
  const [form, setForm] = useState({
    main_keyword: '',
    city: '',
    country: '',
    phone: '',
    category: '',
    subcategory: '',
    company_name: '',
    video_url: '',
    images: [],
    imageSource: 'own', // own/other/stock
  });
  // Состояние для семантики (заглушка)
  const [semanticList, setSemanticList] = useState([]); // [{word, checked}]
  const [semLoading, setSemLoading] = useState(false);
  // Состояние для списка страниц
  const [pages, setPages] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  // Состояние для ошибок/уведомлений
  const [toast, setToast] = useState('');

  // Пример обработчика изменения поля
  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };


  // Загрузка изображения для ключевого слова (только локально, без API)
  const handleImageChange = (i, file) => {
    setForm(f => {
      const arr = [...(f.images || [])];
      arr[i] = file;
      return { ...f, images: arr };
    });
  };


  // Получить семантику через новую таблицу (сохраняется подборка и возвращается токен)
  const [semToken, setSemToken] = useState(null);
  const fetchSemantics = async () => {
    if (!form.main_keyword || form.main_keyword.trim().length < 3) {
      setToast('Введите ключевое слово (минимум 3 символа)');
      setTimeout(() => setToast(''), 2000);
      return;
    }
    setSemLoading(true);
    try {
      const jwt = localStorage.getItem('jwt');
      // Мок: подборка семантики (заменить на реальный генератор при необходимости)
      const fakeSemantics = [
        'купить окна',
        'цены на окна',
        'пластиковые окна',
        'монтаж окон',
        'установка окон',
        'ремонт окон',
        'окна ПВХ',
        'энергосберегающие окна',
        'окна для дачи',
        'окна в квартиру',
      ];
      // Сохраняем подборку через API
      const res = await fetch('/api/seo-pages/semantic-collections/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({ main_keyword: form.main_keyword, semantic_keywords: fakeSemantics })
      });
      const data = await res.json();
      if (!res.ok) {
        setToast(data.error || 'Ошибка генерации семантики');
        setTimeout(() => setToast(''), 2000);
        setSemLoading(false);
        return;
      }
      setSemToken(data.token);
      setSemanticList(Array.isArray(data.semantic_keywords) ? data.semantic_keywords.map(word => ({ word, checked: true })) : []);
    } catch (e) {
      setToast('Ошибка сети или сервера');
      setTimeout(() => setToast(''), 2000);
    } finally {
      setSemLoading(false);
    }
  };

  // Обработка чекбоксов семантики
  const handleSemanticCheck = idx => {
    setSemanticList(list => list.map((item, i) => i === idx ? { ...item, checked: !item.checked } : item));
  };

  // Сохранить выбранные ключевые слова
  const saveSelectedSemantics = () => {
    const selected = semanticList.filter(s => s.checked).map(s => s.word);
    setForm(f => ({ ...f, semantic_keywords: selected }));
    setToast('Ключевые слова сохранены!');
    setTimeout(() => setToast(''), 1500);
  };

  // Получить список страниц
  const fetchPages = async () => {
    const token = localStorage.getItem('jwt');
    const res = await fetch('/seo-pages', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      setPages(await res.json());
    }
  };

  useEffect(() => { fetchPages(); }, []);

  // Отправка формы с загрузкой изображений
  const handleSubmit = async e => {
    e.preventDefault();
    setToast('');
    // Валидация на фронте
    if (!form.main_keyword || form.main_keyword.trim().length < 3) {
      setToast('Основное ключевое слово должно быть не короче 3 символов');
      setTimeout(() => setToast(''), 3000); return;
    }
    if (!form.video_url || !/^https?:\/\/.+/.test(form.video_url)) {
      setToast('Укажите корректную ссылку на видео');
      setTimeout(() => setToast(''), 3000); return;
    }
    if (form.phone && !/^\+?[0-9\-() ]{7,}$/.test(form.phone)) {
      setToast('Некорректный формат телефона');
      setTimeout(() => setToast(''), 3000); return;
    }
    if (!Array.isArray(form.semantic_keywords) || form.semantic_keywords.length === 0 || form.semantic_keywords.some(k => !k || k.trim().length < 3)) {
      setToast('Добавьте хотя бы одно ключевое слово (минимум 3 символа)');
      setTimeout(() => setToast(''), 3000); return;
    }
    // 1. Отправить данные страницы (без изображений)
    const token = localStorage.getItem('jwt');
    const pageRes = await fetch('/seo-pages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        ...form,
        images: undefined, // изображения отдельно
        semToken // передаём токен подборки для автоудаления
      })
    });
    const pageData = await pageRes.json();
    if (!pageRes.ok) {
      setToast(pageData.error || 'Ошибка создания страницы');
      setTimeout(() => setToast(''), 3000);
      return;
    }
    // 2. Загрузить изображения (если есть)
    const uploaded = [];
    for (let i = 0; i < form.images.length; ++i) {
      const file = form.images[i];
      if (!file) continue;
      const fd = new FormData();
      fd.append('image', file);
      const imgRes = await fetch(`/seo-pages/${pageData.id}/upload-image`, {
        method: 'POST',
        body: fd
      });
      const imgData = await imgRes.json();
      if (imgRes.ok) uploaded.push(imgData.filename);
    }
    setToast('SEO-страница создана!');
    setTimeout(() => setToast(''), 2000);
    fetchPages();
    setForm({
      main_keyword: '', city: '', country: '', semantic_keywords: [''], phone: '', category: '', subcategory: '', company_name: '', video_url: '', images: [], imageSource: 'own'
    });
  };


  return (
    <div
      className={styles.root}
      style={{ background: `url(${bg}) center center/cover no-repeat` }}
    >
      <div className={styles.panel}>
        <h2 className={styles.title}>Генератор SEO-страниц</h2>
        {toast && <div className={styles.toast}>{toast}</div>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <input name="main_keyword" value={form.main_keyword} onChange={handleChange} placeholder="Основное ключевое слово" className={styles.input} required />
            <input name="city" value={form.city} onChange={handleChange} placeholder="Город" className={styles.input} />
            <input name="country" value={form.country} onChange={handleChange} placeholder="Страна" className={styles.input} />
          </div>
          <div className={styles.mb12}>
            <div className={styles.keywordsLabel}>
              Ключевые слова:
              <button
                type="button"
                onClick={fetchSemantics}
                className={styles.semanticBtn}
                disabled={semLoading || !form.main_keyword}
              >
                {semLoading ? 'Подбираю...' : 'Подобрать семантику'}
              </button>
            </div>
            {semanticList.length > 0 && (
              <div className={styles.semanticList}>
                {semanticList.map((item, i) => (
                  <label key={i} className={styles.semanticItem}>
                    <input type="checkbox" checked={item.checked} onChange={() => handleSemanticCheck(i)} />
                    <span>{item.word}</span>
                  </label>
                ))}
              </div>
            )}
            {semanticList.length > 0 && (
              <button
                type="button"
                onClick={saveSelectedSemantics}
                className={styles.saveSemBtn}
              >
                Сохранить выбранные
              </button>
            )}
          </div>
          <div className={styles.mb12}>
            <label className={styles.label}>Источник изображений:</label>
            <label>
              <input type="radio" name="imageSource" value="own" checked={form.imageSource === 'own'} onChange={handleChange} /> Свои
            </label>
            <label className={styles.ml12}>
              <input type="radio" name="imageSource" value="other" checked={form.imageSource === 'other'} onChange={handleChange} /> Чужие
            </label>
            <label className={styles.ml12}>
              <input type="radio" name="imageSource" value="stock" checked={form.imageSource === 'stock'} onChange={handleChange} /> Фотобанк
            </label>
          </div>
          <div className={styles.mb12}>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Телефон" className={styles.inputPhone} />
          </div>
          <div className={`${styles.mb12} ${styles.row}`}>
            <input name="category" value={form.category} onChange={handleChange} placeholder="Категория" className={styles.input} />
            <input name="subcategory" value={form.subcategory} onChange={handleChange} placeholder="Подкатегория" className={styles.input} />
          </div>
          <div className={styles.mb12}>
            <input name="company_name" value={form.company_name} onChange={handleChange} placeholder="Название компании" className={styles.inputWide} />
          </div>
          <div className={styles.mb12}>
            <input name="video_url" value={form.video_url} onChange={handleChange} placeholder="Ссылка на видео (обязательно)" className={styles.inputWide} required />
          </div>
          {/* Загрузчик изображений и чекбоксы для semantic_keywords будут позже */}
          <button type="submit" className={styles.submitBtn}>Создать SEO-страницу</button>
        </form>
        <div className={styles.pagesBlock}>
          <h3 className={styles.pagesTitle}>Ваши SEO-страницы</h3>
          <div className={styles.mb12}>
            <label className={styles.label} style={{ marginRight: 8 }}>Статус:</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className={styles.select}
            >
              <option value="all">Все</option>
              <option value="pending">pending</option>
              <option value="ready">ready</option>
              <option value="published">published</option>
            </select>
          </div>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeadRow}>
                <th className={styles.tableCell}>ID</th>
                <th className={styles.tableCell}>Ключевое слово</th>
                <th className={styles.tableCell}>Город</th>
                <th className={styles.tableCell}>Статус</th>
                <th className={styles.tableCell}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {pages.filter(p => statusFilter === 'all' || p.status === statusFilter).map(page => (
                <tr key={page.id}>
                  <td className={styles.tableCell}>{page.id}</td>
                  <td className={styles.tableCell}>{page.main_keyword}</td>
                  <td className={styles.tableCell}>{page.city}</td>
                  <td className={styles.tableCell}>{page.status}</td>
                  <td className={styles.tableCell}>
                    {(page.status === 'pending' || page.status === 'ready') && (
                      <button className={styles.editBtn}>Редактировать</button>
                    )}
                    {page.status === 'published' && <span className={styles.dash}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pages.length === 0 && <div className={styles.noPages}>Нет страниц</div>}
        </div>
      </div>
    </div>
  );
}
