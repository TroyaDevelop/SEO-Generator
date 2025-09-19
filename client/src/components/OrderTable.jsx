import React from 'react';

// Функция best practice для скачивания .txt с авторизацией
async function downloadTxt(orderId, token) {
  const response = await fetch(`/download-text/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) {
    alert('Ошибка скачивания');
    return;
  }
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `text_${orderId}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export default function OrderTable({ orders, loading, payOrders, token }) {
  return (
    <div style={{ marginTop: 32, maxWidth: 700 }}>
      <h3>Ваши заказы</h3>
      <table style={{ border: '2px solid red', borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ border: '2px solid red', padding: 8 }}>Ключевое слово</th>
            <th style={{ border: '2px solid red', padding: 8 }}>Статус</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td style={{ border: '2px solid red', padding: 8 }}>{order.keyword}</td>
              <td style={{ border: '2px solid red', padding: 8 }}>
                {order.pay === 3 && order.text ? (
                  <>
                    <span style={{ color: 'green' }}>Готово</span>
                    <button
                      style={{
                        border: '1px solid #aaa',
                        padding: '2px 10px',
                        marginLeft: 8,
                        textDecoration: 'none',
                        color: 'red',
                        background: 'white',
                        borderRadius: 4,
                        fontSize: 14,
                        cursor: 'pointer'
                      }}
                      onClick={() => downloadTxt(order.id, token)}
                    >
                      Скачать .txt
                    </button>
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
  );
}
