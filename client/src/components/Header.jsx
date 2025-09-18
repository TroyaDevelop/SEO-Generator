import React from 'react';
import './Header.css';

export default function Header({ user, page, setPage, logout, setShowAuth, setAuthMode }) {
  return (
    <div className="header-bar" style={{ justifyContent: 'flex-end' }}>
      {user && (
        <div className="header-profile">
          {/* SVG профиль */}
          <span className="icon">{/* <ProfileSVG /> */}</span>
          <span className="profile-link" style={{cursor:'default'}}>{user.email || user.login}</span>
          <span className="divider">|</span>
          <span className="logout-link" onClick={logout}>log out</span>
        </div>
      )}
    </div>
  );
}
