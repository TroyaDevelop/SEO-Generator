import React, { useState, useEffect } from 'react';
import OrderTable from './components/OrderTable.jsx';
import AuthModal from './components/AuthModal.jsx';
import Header from './components/Header.jsx';
import MainLanding from './components/MainLanding.jsx';

// TODO: Личный кабинет

const API_URL = '';


export default function App() {
  const [keyword, setKeyword] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('main'); // 'main' | 'cabinet'
  const [token, setToken] = useState(() => localStorage.getItem('jwt') || '');
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');


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
    await fetch(`${API_URL}/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ keyword })
    });
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
  };

  // Аутентификация (логин/регистрация)
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
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
      setAuthEmail(''); setAuthPassword('');
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
        authError={authError}
        handleAuth={handleAuth}
        setShowAuth={setShowAuth}
      />

      {page === 'main' && (
        <div style={{position: 'relative', width: '100vw', minHeight: '100vh'}}>
          {user && (
            <div style={{
              position: 'absolute',
              top: 120,
              left: 64,
              width: 340,
              background: '#fff',
              border: '2px solid #a259e6',
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
                            border: '1px solid #a259e6',
                            padding: '2px 8px',
                            borderRadius: 6,
                            fontSize: 13,
                            color: '#a259e6',
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
                    К оплате: <span style={{color: '#a259e6'}}>
                      {(orders.filter(o => o.pay === 0).length * 0.5).toFixed(2)} €
                    </span>
                  </span>
                  <button
                    style={{
                      background: '#a259e6', color: '#fff', border: 'none', borderRadius: 8,
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
              if (!user) {
                setShowAuth(true);
                setAuthMode('login');
              } else if (keyword) {
                createOrder();
              }
            }}
          />
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
