import checkedSvg from '../../assets/svg/checked.svg';
import bg from '../../assets/svg/background.svg';
import styles from './SeoPagesPanel.module.scss';
import SharedLandingBg from '../SharedLandingBg/SharedLandingBg';

import React, { useEffect, useState } from 'react';

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
  // active tab: 'create' | 'list'
  const [activeTab, setActiveTab] = useState('create');
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
    <SharedLandingBg className={styles.root}>
      <div className={styles.panel}>
        {toast && <div className={styles.toast}>{toast}</div>}

        <div className={styles.columns}>
          <aside className={styles.leftColumn}>
            <div className={styles.leftHeader}>
              <div className={styles.logoRow1}>
                <span className={styles.logoSEO}>SEO</span>
                <span className={styles.logoGenerator}>Generator</span>
              </div>
              <div className={styles.logoRow2}>
                <span className={styles.logoPages}>pages</span>
              </div>
            </div>
            <div className={styles.leftTabsWrap}>
              <button
                type="button"
                className={activeTab === 'create' ? styles.leftTabActive : styles.leftTab}
                onClick={() => setActiveTab('create')}
              >
                сгенерировать страницу
              </button>
              <button
                type="button"
                className={activeTab === 'list' ? styles.leftTabActive : styles.leftTab}
                onClick={() => setActiveTab('list')}
              >
                Ваши CEO страницы
              </button>
            </div>
            <div className={styles.leftIconsBg}>
              {/* SVG-иконки, если есть: globe, list, key, search */}
              {/* Пример: <img src={require('../../assets/svg/globe.svg')} alt="globe" className={styles.iconGlobe} /> */}
              {/* <img src={require('../../assets/svg/list.svg')} alt="list" className={styles.iconList} /> */}
              {/* <img src={require('../../assets/svg/key.svg')} alt="key" className={styles.iconKey} /> */}
              {/* <img src={require('../../assets/svg/search.svg')} alt="search" className={styles.iconSearch} /> */}
            </div>
          </aside>

          <main className={styles.rightColumn}>
            {activeTab === 'create' && (
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputRow}>
                  <input name="main_keyword" value={form.main_keyword} onChange={handleChange} placeholder="основное ключевое слово" className={styles.mainKeywordInput} required />
                </div>
                <div className={styles.inputRow}>
                  <input name="city" value={form.city} onChange={handleChange} placeholder="Город" className={styles.rowInput} />
                  <input name="country" value={form.country} onChange={handleChange} placeholder="Страна" className={styles.rowInput} />
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="Телефон" className={styles.rowInput} />
                </div>
                <div className={styles.keywordsBlock}>
                  <div className={styles.keywordsLabel}>
                    <span className={styles.keywordsLabelLarge}>Ключевые слова...</span>
                    <img src={checkedSvg} alt="checked" style={{height:'22px', marginLeft:'8px', verticalAlign:'middle'}} />
                    <span className={styles.selectedText}>Выбрано!</span>
                  </div>
                  <button
                    type="button"
                    onClick={fetchSemantics}
                    className={styles.semanticBtnWide}
                    disabled={semLoading || !form.main_keyword}
                  >
                    подобрать семантику
                  </button>
                </div>
                <div className={styles.inputRow}>
                  <input name="category" value={form.category} onChange={handleChange} placeholder="Категория" className={styles.input350} />
                  <input name="subcategory" value={form.subcategory} onChange={handleChange} placeholder="Подкатегория" className={styles.input350} />
                </div>
                <div className={styles.inputRow}>
                  <input name="company_name" value={form.company_name} onChange={handleChange} placeholder="Название Компании" className={styles.input350} />
                </div>
                <div className={styles.inputRow}>
                  <input name="video_url" value={form.video_url} onChange={handleChange} placeholder="Ссылка на видео (обязательно)" className={styles.inputWide758} required />
                </div>
                <div className={styles.imagesBlock}>
                  <div className={styles.imagesLabel}>Источник изображений:</div>
                  <div className={styles.imagesRadios}>
                    <label className={form.imageSource === 'own' ? `${styles.radioLabel} ${styles.radioLabelActive}` : styles.radioLabel}>
                      <input type="radio" name="imageSource" value="own" checked={form.imageSource === 'own'} onChange={handleChange} />
                      <span className={styles.radioCustom} aria-hidden="true"></span>
                      <span className={styles.radioText}>Свои</span>
                    </label>
                    <label className={form.imageSource === 'other' ? `${styles.radioLabel} ${styles.radioLabelActive}` : styles.radioLabel}>
                      <input type="radio" name="imageSource" value="other" checked={form.imageSource === 'other'} onChange={handleChange} />
                      <span className={styles.radioCustom} aria-hidden="true"></span>
                      <span className={styles.radioText}>Чужие</span>
                    </label>
                    <label className={form.imageSource === 'stock' ? `${styles.radioLabel} ${styles.radioLabelActive}` : styles.radioLabel}>
                      <input type="radio" name="imageSource" value="stock" checked={form.imageSource === 'stock'} onChange={handleChange} />
                      <span className={styles.radioCustom} aria-hidden="true"></span>
                      <span className={styles.radioText}>Фотобанк</span>
                    </label>
                  </div>
                </div>
                <div className={styles.startBtnRow}>
                  <div className={styles.startLine}></div>
                  <button type="submit" className={styles.startBtn}>START</button>
                  <div className={styles.startLine}></div>
                </div>
              </form>
            )}

            {activeTab === 'list' && (
              <div className={styles.listTabWrap}>
                <div className={styles.filterRowWrap}>
                  <div className={styles.statusRow}>
                    <div className={styles.statusLabel}>Статус:</div>
                    <div className={styles.selectWrap}>
                      <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className={styles.selectCustom}
                      >
                        <option value="all">Все</option>
                        <option value="pending">pending</option>
                        <option value="ready">ready</option>
                        <option value="published">published</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className={styles.pagesPanel}>
                  <div className={styles.pagesHeaderRow}>
                    <div className={styles.hCell}>ID</div>
                    <div className={styles.hCell}>Ключевое слово</div>
                    <div className={styles.hCell}>Город</div>
                    <div className={styles.hCell}>Статус</div>
                    <div className={styles.hCell}>Действия</div>
                  </div>
                  <div className={styles.pagesScrollArea}>
                    {pages.filter(p => statusFilter === 'all' || p.status === statusFilter).map(page => (
                      <div key={page.id} className={styles.pageRow}>
                        <div className={styles.cId}>{page.id}</div>
                        <div className={styles.cKeyword}>{page.main_keyword}</div>
                        <div className={styles.cCity}>{page.city}</div>
                        <div className={styles.cStatus}>{page.status}</div>
                        <div className={styles.cActions}>
                          {(page.status === 'pending' || page.status === 'ready') && (
                            <button className={styles.rowEditBtn}>Редактировать</button>
                          )}
                          {page.status === 'published' && <span className={styles.dash}>—</span>}
                        </div>
                      </div>
                    ))}
                    {pages.length === 0 && <div className={styles.noPages}>Нет страниц</div>}
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </SharedLandingBg>
  );
}
