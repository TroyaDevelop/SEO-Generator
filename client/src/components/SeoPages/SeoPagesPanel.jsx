import checkedSvg from '../../assets/svg/checked.svg';
import bg from '../../assets/svg/background.svg';
import styles from './SeoPagesPanel.module.scss';
import SharedLandingBg from '../SharedLandingBg/SharedLandingBg';

import React, { useEffect, useState, useRef } from 'react';
import Toast from '../../components/Toast';

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
  const [semOriginalList, setSemOriginalList] = useState(null);
  const semPollRef = useRef(null);
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
  const [semTaskId, setSemTaskId] = useState(null);
  const [semPolling, setSemPolling] = useState(false);
  const [showSemModal, setShowSemModal] = useState(false);
  const [semLastKeyword, setSemLastKeyword] = useState('');
  const [semGeneratedList, setSemGeneratedList] = useState([]); // full list returned by bot
  const fetchSemantics = async () => {
    const normalizedMain = form.main_keyword ? form.main_keyword.trim() : '';
    // only letters allowed, no spaces or digits/specials
    const validKeywordRegex = /^[A-Za-zА-Яа-яЁё]+$/u;
    if (!normalizedMain || normalizedMain.length < 6 || !validKeywordRegex.test(normalizedMain)) {
      setToast('Введите ключевое слово: одно слово, минимум 6 букв, только буквы');
      setTimeout(() => setToast(''), 2000);
      return;
    }
    // if keyword hasn't changed since last generation — just open modal with existing list
    const normalized = form.main_keyword.trim();
    if (semLastKeyword && normalized === semLastKeyword) {
      // restore semanticList from last generated full list and current saved selections
      const full = Array.isArray(semGeneratedList) && semGeneratedList.length ? semGeneratedList : [];
      const saved = Array.isArray(form.semantic_keywords) ? form.semantic_keywords : [];
      if (full.length > 0) {
        const merged = full.map(word => ({ word, checked: saved.includes(word) }));
        setSemanticList(merged);
      } else {
        // fallback: show saved selections as checked items
        const fallback = saved.map(word => ({ word, checked: true }));
        setSemanticList(fallback);
      }
      setShowSemModal(true);
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
      // Создаём задачу на сервере (бот выполнит генерацию в фоне)
      try {
        const taskRes = await fetch('/semantic-tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` },
          body: JSON.stringify({ main_keyword: form.main_keyword })
        });
        const taskData = await taskRes.json();
        if (!taskRes.ok) {
          setToast(taskData.error || 'Ошибка создания задачи семантики');
          setTimeout(() => setToast(''), 2000);
          setSemLoading(false);
          return;
        }
        // Открываем модал и начинаем опрос задачи
  setSemTaskId(taskData.id);
  if (taskData.token) setSemToken(taskData.token);
        setShowSemModal(true);
        setSemPolling(true);
        // polling
        const poll = async () => {
          const ping = await fetch(`/semantic-tasks/${taskData.id}`, { headers: { 'Authorization': `Bearer ${jwt}` } });
          if (!ping.ok) return null;
          const d = await ping.json();
          return d;
        };
        // store interval id in ref so we can clear it on cancel
        semPollRef.current = setInterval(async () => {
          const d = await poll();
          if (d && d.pay === 2) {
            clearInterval(semPollRef.current);
            semPollRef.current = null;
            setSemPolling(false);
            setShowSemModal(true);
            // keep the generated list visible but remember the previous saved selection so Cancel can revert
            const generatedArr = Array.isArray(d.result_keywords) ? d.result_keywords : [];
            const generated = generatedArr.map(word => ({ word, checked: true }));
            setSemanticList(generated);
            setSemGeneratedList(generatedArr);
            // previous saved semantics from form (if any) — used to restore on Cancel
            const prev = Array.isArray(form.semantic_keywords) ? form.semantic_keywords.map(word => ({ word, checked: true })) : [];
            setSemOriginalList(prev);
            setSemToken(null);
            setSemTaskId(null);
            // remember last generated keyword
            setSemLastKeyword(normalized);
          }
        }, 1500);
      } catch (e) {
        setToast('Ошибка сети или сервера при создании задачи');
        setTimeout(() => setToast(''), 2000);
      }
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
    // saved — clear original snapshot
    setSemOriginalList(null);
    // after saving, mark last keyword as current form keyword so re-opening doesn't regenerate
    const normalized = form.main_keyword ? form.main_keyword.trim() : '';
    if (normalized) setSemLastKeyword(normalized);
  };

  // toggle body class so global selectors can dim and disable background UI
  useEffect(() => {
    if (showSemModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [showSemModal]);

  // Получить список страниц
  const fetchPages = async () => {
    const token = localStorage.getItem('jwt');
    const res = await fetch('/seo-pages', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.status === 401) {
      // token missing or invalid — force user back to main (will show login if needed)
      localStorage.removeItem('jwt');
      // reload to let App pick up missing token and show main page
      window.location.href = '/';
      return;
    }
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
    const normalizedMain2 = form.main_keyword ? form.main_keyword.trim() : '';
    const validKeywordRegex2 = /^[A-Za-zА-Яа-яЁё]+$/u;
    if (!normalizedMain2 || normalizedMain2.length < 6 || !validKeywordRegex2.test(normalizedMain2)) {
      setToast('Основное ключевое слово должно быть одно слово: минимум 6 букв, только буквы');
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
    const sems = Array.isArray(form.semantic_keywords) ? form.semantic_keywords : [];
    const semValidRe = /^[A-Za-zА-Яа-яЁё]+$/u;
    if (!Array.isArray(sems) || sems.length === 0 || sems.some(k => !k || k.trim().length < 6 || !semValidRe.test(k.trim()))) {
      setToast('Добавьте хотя бы одно ключевое слово: одно слово, минимум 6 букв, только буквы');
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
  <Toast show={!!toast} message={toast} />

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
                  {showSemModal && (
                    <div className={styles.semanticModalOverlay}>
                      <div className={styles.semanticModal}>
                        <h3>Подобранные ключевые слова</h3>
                        {semPolling && <div>Идёт генерация...</div>}
                        <div className={styles.semanticList}
                             onCopy={e => e.preventDefault()}
                             onContextMenu={e => e.preventDefault()}
                             onDragStart={e => e.preventDefault()}>
                          {semanticList.map((item, idx) => (
                            <div key={idx} className={styles.semanticItem} onClick={() => handleSemanticCheck(idx)}>
                              <input type="checkbox" checked={item.checked} readOnly />
                              <span>{item.word}</span>
                            </div>
                          ))}
                        </div>
                        <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
                          <button type="button" className={styles.saveSemBtn} onClick={() => { saveSelectedSemantics(); setShowSemModal(false); }}>Сохранить</button>
                          <button type="button" onClick={() => {
                            // Cancel: restore previous saved semantics (do not persist current checks)
                            if (semPollRef.current) {
                              clearInterval(semPollRef.current);
                              semPollRef.current = null;
                            }
                            if (semOriginalList) {
                              setSemanticList(semOriginalList);
                            }
                            setSemPolling(false);
                            setSemTaskId(null);
                            setShowSemModal(false);
                          }}>Отменить</button>
                        </div>
                      </div>
                    </div>
                  )}
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
