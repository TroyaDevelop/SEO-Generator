import React, { useState, useEffect } from 'react';

// TODO: Личный кабинет

const API_URL = '';

export default function App() {
  const [keyword, setKeyword] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Получить все заказы
  const fetchOrders = async () => {
    const res = await fetch(`${API_URL}/orders`);
    setOrders(await res.json());
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Создать заказ
  const createOrder = async () => {
    if (!keyword) return;
    setLoading(true);
    await fetch(`${API_URL}/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword })
    });
    setKeyword('');
    await fetchOrders();
    setLoading(false);
  };


  // Оплатить все неоплаченные заказы
  const payOrders = async () => {
    setLoading(true);
    await fetch(`${API_URL}/pay-orders`, { method: 'POST' });
    await fetchOrders();
    setLoading(false);
  };



  return (
    <div style={{ fontFamily: 'sans-serif', padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>SEO Generator</h2>
        <div style={{ color: 'red' }}>Имя {/* TODO: добавить имя пользователя */}</div>
      </div>
      <div style={{ border: '2px solid red', display: 'inline-block', marginBottom: 24 }}>
        <table style={{ borderCollapse: 'collapse', minWidth: 500 }}>
          <thead>
            <tr>
              <th style={{ border: '2px solid red', padding: 8 }}>ключевое слово</th>
              <th style={{ border: '2px solid red', padding: 8 }}>статус</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '2px solid red', padding: 8 }}>
                <input
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  placeholder="Введите ключевое слово"
                  style={{ width: '100%' }}
                />
              </td>
              <td style={{ border: '2px solid red', padding: 8 }}>
                <button onClick={createOrder} disabled={loading || !keyword}>
                  Сгенерировать текст за 0.5 €
                </button>
              </td>
            </tr>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td style={{ border: '2px solid red', padding: 8 }}>{order.keyword}</td>
                    <td style={{ border: '2px solid red', padding: 8 }}>
                      {order.pay === 3 && order.text ? (
                        <>
                          <span style={{ color: 'green', marginRight: 8 }}>Готово</span>
                          <a
                            href={`/download-text/${order.id}`}
                            style={{
                              border: '1px solid #aaa',
                              padding: '2px 10px',
                              marginLeft: 8,
                              textDecoration: 'none',
                              color: 'red',
                              background: 'white',
                              borderRadius: 4,
                              fontSize: 14
                            }}
                            download
                          >
                            Скачать .txt
                          </a>
                        </>
                      ) : order.pay === 1 ? (
                        <span style={{ color: 'orange' }}>Ожидание...</span>
                      ) : (
                        <span style={{ color: 'orange' }}>ожидание оплаты</span>
                      )}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'inline-block', verticalAlign: 'top', marginLeft: 16 }}>
        <table style={{ border: '2px solid red', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ border: '2px solid red', padding: 8 }}>кол-во текстов</td>
              <td style={{ border: '2px solid red', padding: 8 }}>{orders.filter(o => o.pay === 0).length}</td>
            </tr>
            <tr>
              <td style={{ border: '2px solid red', padding: 8 }}>сумма</td>
              <td style={{ border: '2px solid red', padding: 8 }}>{(orders.filter(o => o.pay === 0).length * 0.5).toFixed(2)} €</td>
            </tr>
            <tr>
              <td style={{ border: '2px solid red', padding: 8 }}>оплатить</td>
              <td style={{ border: '2px solid red', padding: 8 }}>
                {orders.some(o => o.pay === 0) ? (
                  <button onClick={payOrders} disabled={loading}>
                    Оплатить все
                  </button>
                ) : (
                  <span style={{ color: 'gray' }}>Тестовая оплата</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 32 }}>
        <button style={{ border: '2px solid red', color: 'red', background: 'white', padding: '8px 24px', fontSize: 16 }} disabled>
          скачать готовые тексты архивом
        </button>
      </div>
      <div style={{ marginTop: 24, color: 'gray' }}>
        {/* TODO: Личный кабинет */}
      </div>
    </div>
  );
}
