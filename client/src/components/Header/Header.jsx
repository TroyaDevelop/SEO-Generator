import styles from './Header.module.scss';
import personSvg from '../../assets/svg/person.svg';

export default function Header({ user, page, setPage, logout, setShowAuth, setAuthMode }) {
  return (
    <div className={styles.headerBar} style={{ justifyContent: 'flex-end' }}>
      {user ? (
        <div className={styles.headerProfile}>
          {/* SVG профиль */}
          <img src={personSvg} alt="profile" className="icon" />
          <span className={styles.profileLink} style={{cursor:'default'}}>{user.email || user.login}</span>
          <span className={styles.divider}>|</span>
          <span className={styles.logoutLink} onClick={logout}>log out</span>
        </div>
      ) : (
        <div className={styles.headerProfile}>
          <button
            className={styles.signBtn}
            onClick={() => { setAuthMode('login'); setShowAuth(true); }}
            aria-label="Sign in"
          >
            <img src={personSvg} alt="sign in" className="icon" />
            <span className={styles.profileLink}>sign in</span>
          </button>
        </div>
      )}
    </div>
  );
}
