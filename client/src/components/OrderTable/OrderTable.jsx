import styles from './OrderTable.module.scss';

export default function OrderTable({ orders, loading, payOrders }) {
  return (
    <div className={styles.orderTableWrap}>
      <h3>Ваши заказы</h3>
      <table className={styles.orderTable}>
        <thead>
          <tr>
            <th>Ключевое слово</th>
            <th>Статус</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>{order.keyword}</td>
              <td>
                {order.pay === 3 && order.text ? (
                  <>
                    <span className={styles.statusReady}>Готово</span>
                    <a
                      href={`/download/${order.token}`}
                      className={styles.downloadBtn}
                      download
                    >
                      Скачать .txt
                    </a>
                  </>
                ) : order.pay === 1 ? (
                  <span className={styles.statusWait}>Ожидание...</span>
                ) : (
                  <span className={styles.statusWait}>ожидание оплаты</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
