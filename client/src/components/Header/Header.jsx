import React from 'react';
import styles from './Header.module.scss';

export default function Header({ user, page, setPage, logout, setShowAuth, setAuthMode }) {
  return (
    <div className={styles.headerBar} style={{ justifyContent: 'flex-end' }}>
      {user && (
        <div className={styles.headerProfile}>
          {/* SVG профиль */}
          <span className="icon">{/* <ProfileSVG /> */}</span>
          <span className={styles.profileLink} style={{cursor:'default'}}>{user.email || user.login}</span>
          <span className={styles.divider}>|</span>
          <span className={styles.logoutLink} onClick={logout}>log out</span>
        </div>
      )}
    </div>
  );
}
