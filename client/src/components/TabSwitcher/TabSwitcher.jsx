
import styles from './TabSwitcher.module.scss';

export default function TabSwitcher({ tab, setTab }) {
  return (
    <div className={styles.tabSwitcher}>
      <button
        onClick={() => setTab('texts')}
        className={tab === 'texts' ? `${styles.tabBtn} ${styles.tabBtnActive}` : styles.tabBtn}
      >
        Генерация SEO-текстов
      </button>
      <button
        onClick={() => setTab('pages')}
        className={tab === 'pages' ? `${styles.tabBtn} ${styles.tabBtnActive}` : styles.tabBtn}
      >
        Генератор SEO-страниц
      </button>
    </div>
  );

}