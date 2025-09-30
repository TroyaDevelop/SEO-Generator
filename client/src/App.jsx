import React, { useState, useEffect } from 'react';
import OrderTable from './components/OrderTable';
import AuthModal from './components/AuthModal';
import Header from './components/Header';
import MainLanding from './components/MainLanding';
import Toast from './components/Toast';
import TabSwitcher from './components/TabSwitcher';
import SeoPagesPanel from './components/SeoPages';

// TODO: Личный кабинет

const API_URL = '';


export default function App() {
  const [keyword, setKeyword] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('main'); // 'main' | 'cabinet'
  const [tab, setTab] = useState('texts'); // 'texts' | 'pages'
  const [token, setToken] = useState(() => localStorage.getItem('jwt') || '');
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authPasswordRepeat, setAuthPasswordRepeat] = useState('');
  const [orderError, setOrderError] = useState('');
  const [showOrderError, setShowOrderError] = useState(false);


  // Получить все заказы
  const fetchOrders = async () => {
    if (!token) return setOrders([]);
    try {
      const res = await fetch(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        setUser(null); setToken(''); localStorage.removeItem('jwt'); setOrders([]); return;
      }
      const data = await res.json();
      setOrders(data);
    } catch (e) {
      setOrders([]);
    }
  };

  // Получить пользователя
  const fetchUser = async (jwt) => {
    if (!jwt) return setUser(null);
    const res = await fetch(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${jwt}` }
    });
    if (res.status === 200) setUser(await res.json());
    else { setUser(null); setToken(''); localStorage.removeItem('jwt'); }
  };

  useEffect(() => {
    if (token) fetchUser(token);
    fetchOrders();
    // eslint-disable-next-line
  }, [token]);


  // Создать заказ
  const createOrder = async () => {
    if (!keyword || !token) return;
    setLoading(true);
    const res = await fetch(`${API_URL}/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ keyword })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setOrderError(data.error || 'Ошибка создания заказа');
      setShowOrderError(true);
      setLoading(false);
      setTimeout(() => setShowOrderError(false), 3000);
      return;
    }
    setKeyword('');
    await fetchOrders();
    setLoading(false);
  };



  // Оплатить все неоплаченные заказы
  const payOrders = async () => {
    if (!token) return;
    setLoading(true);
    await fetch(`${API_URL}/pay-orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    await fetchOrders();
    setLoading(false);
  };

  // Выйти
  const logout = () => {
    setUser(null); setToken(''); localStorage.removeItem('jwt'); setOrders([]);
    // При выходе принудительно вернём пользователя на главную и на вкладку генерации текстов
    setPage('main');
    setTab('texts');
    setShowAuth(false);
  };

  // Аутентификация (логин/регистрация)
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (authMode === 'register') {
      if (authPassword !== authPasswordRepeat) {
        setAuthError('Пароли не совпадают');
        return;
      }
    }
    const url = authMode === 'login' ? '/login' : '/register';
    const res = await fetch(`${API_URL}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: authEmail, password: authPassword })
    });
    const data = await res.json();
    if (res.ok && data.token) {
      setToken(data.token);
      localStorage.setItem('jwt', data.token);
      setShowAuth(false);
      setAuthEmail(''); setAuthPassword(''); setAuthPasswordRepeat('');
    } else if (res.ok && data.email) { // регистрация успешна
      setAuthMode('login');
      setAuthError('Регистрация успешна, войдите!');
    } else {
      setAuthError(data.error || 'Ошибка');
    }
  };



  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <Header user={user} page={page} setPage={setPage} logout={logout} setShowAuth={setShowAuth} setAuthMode={setAuthMode} />
      <AuthModal
        show={showAuth}
        authMode={authMode}
        setAuthMode={setAuthMode}
        authEmail={authEmail}
        setAuthEmail={setAuthEmail}
        authPassword={authPassword}
        setAuthPassword={setAuthPassword}
        authPasswordRepeat={authPasswordRepeat}
        setAuthPasswordRepeat={setAuthPasswordRepeat}
        authError={authError}
        handleAuth={handleAuth}
        setShowAuth={setShowAuth}
      />

      {page === 'main' && (
        <div style={{position: 'relative', width: '100vw', minHeight: '100vh'}}>
          <TabSwitcher tab={tab} setTab={setTab} user={user} setShowAuth={setShowAuth} setAuthMode={setAuthMode} />
          {/* Старая логика генерации текстов */}
          {tab === 'texts' && (
            <>
              <Toast show={showOrderError} message={orderError} />
              {user && (
                <div style={{
                  position: 'absolute',
                  top: 120,
                  left: 64,
                  width: 340,
                  background: '#fff',
                  border: '2px solid #897CE9',
                  borderRadius: 16,
                  boxShadow: '0 2px 12px 0 #a259e622',
                  padding: 24,
                  minHeight: 180,
                  fontSize: 18,
                  zIndex: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 400
                }}>
                  <div style={{fontWeight: 500, marginBottom: 12}}>Ваши заказы</div>
                  <div style={{flex: 1, overflowY: 'auto', marginBottom: 10}}>
                    {orders.length === 0 ? (
                      <div style={{color: '#aaa'}}>Нет заказов</div>
                    ) : (
                      orders.map(order => (
                        <div key={order.id} style={{borderBottom: '1px solid #eee', padding: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8}}>
                          <span>
                            #{order.id}: <b>{order.keyword}</b> <span style={{color: '#aaa', fontSize: 15}}>({order.pay === 3 ? 'Готово' : order.pay === 1 ? 'В процессе' : 'Ожидание оплаты'})</span>
                          </span>
                          {order.pay === 3 && order.text && (
                            <a
                              href={`/download/${order.token}`}
                              style={{
                                border: '1px solid #897CE9',
                                padding: '2px 8px',
                                borderRadius: 6,
                                fontSize: 13,
                                color: '#897CE9',
                                background: '#f7f2fa',
                                textDecoration: 'none',
                                marginLeft: 8
                              }}
                              download
                            >
                              Скачать .txt
                            </a>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  {/* Миниблок оплаты */}
                  {orders.filter(o => o.pay === 0).length > 0 && (
                    <div style={{
                      padding: '12px 0 0',
                      borderTop: '1px solid #eee',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12
                    }}>
                      <span style={{fontWeight: 500, fontSize: 17}}>
                        К оплате: <span style={{color: '#897CE9'}}>
                          {(orders.filter(o => o.pay === 0).length * 0.5).toFixed(2)} €
                        </span>
                      </span>
                      <button
                        style={{
                          background: '#897CE9', color: '#fff', border: 'none', borderRadius: 8,
                          padding: '8px 18px', fontWeight: 600, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #a259e633'
                        }}
                        onClick={payOrders}
                        disabled={loading}
                      >
                        Оплатить
                      </button>
                    </div>
                  )}
                </div>
              )}
              <MainLanding
                keyword={keyword}
                setKeyword={setKeyword}
                onStart={() => {
                  const normalized = keyword ? keyword.trim() : '';
                  const validKeywordRegex = /^[A-Za-zА-Яа-яЁё]+$/u; // single word only
                  if (!user) {
                    setShowAuth(true);
                    setAuthMode('login');
                  } else if (normalized && normalized.length >= 6 && validKeywordRegex.test(normalized)) {
                    createOrder();
                  } else {
                    // show a quick toast using shared Toast component
                    setOrderError('Ключевое слово: одно слово, минимум 6 букв, только буквы');
                    setShowOrderError(true);
                    setTimeout(() => setShowOrderError(false), 3000);
                  }
                }}
              />
            </>
          )}
          {/* Вкладка генератора SEO-страниц */}
          {tab === 'pages' && <SeoPagesPanel />}
        </div>
      )}

      {page === 'cabinet' && user && (
        <div style={{ marginTop: 32, maxWidth: 700 }}>
          <h3>Личный кабинет</h3>
          {/* Здесь может быть личная информация или настройки */}
        </div>
      )}
    </div>
  );
}
