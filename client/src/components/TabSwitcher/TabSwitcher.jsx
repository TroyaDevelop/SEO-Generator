
import styles from './TabSwitcher.module.scss';

export default function TabSwitcher({ tab, setTab, user, setShowAuth, setAuthMode }) {
  const openLogin = () => {
    setAuthMode && setAuthMode('login');
    setShowAuth && setShowAuth(true);
  };

  const handlePagesClick = () => {
    if (!user) {
      openLogin();
      return;
    }
    setTab('pages');
  };

  return (
    <div className={styles.tabSwitcher}>
      <button
        onClick={() => setTab('texts')}
        className={tab === 'texts' ? `${styles.tabBtn} ${styles.tabBtnActive}` : styles.tabBtn}
      >
        Генерация SEO-текстов
      </button>
      <button
        onClick={handlePagesClick}
        className={tab === 'pages' ? `${styles.tabBtn} ${styles.tabBtnActive}` : styles.tabBtn}
      >
        Генератор SEO-страниц
      </button>
    </div>
  );

}