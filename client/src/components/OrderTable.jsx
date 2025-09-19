import React from 'react';

export default function OrderTable({ orders, loading, payOrders }) {
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
                    <a
                      href={`/download/${order.token}`}
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
  );
}
