import React from 'react';

export default function AuthModal({
  show, authMode, setAuthMode, authEmail, setAuthEmail, authPassword, setAuthPassword, authPasswordRepeat, setAuthPasswordRepeat, authError, handleAuth, setShowAuth
}) {
  if (!show) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', zIndex: 10 }} onClick={() => setShowAuth(false)}>
      <form onClick={e => e.stopPropagation()} onSubmit={handleAuth} style={{ background: 'white', maxWidth: 320, margin: '80px auto', padding: 24, border: '2px solid red', borderRadius: 8 }}>
        <h3 style={{ marginTop: 0 }}>{authMode === 'login' ? 'Вход' : 'Регистрация'}</h3>
        <input type="email" placeholder="Email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} style={{ width: '100%', marginBottom: 12, padding: 8 }} required />
        <input type="password" placeholder="Пароль" value={authPassword} onChange={e => setAuthPassword(e.target.value)} style={{ width: '100%', marginBottom: 12, padding: 8 }} required />
        {authMode === 'register' && (
          <input type="password" placeholder="Повторите пароль" value={authPasswordRepeat} onChange={e => setAuthPasswordRepeat(e.target.value)} style={{ width: '100%', marginBottom: 12, padding: 8 }} required />
        )}
        {authError && <div style={{ color: 'red', marginBottom: 8 }}>{authError}</div>}
        <button type="submit" style={{ width: '100%', padding: 8, background: 'red', color: 'white', border: 'none', borderRadius: 4 }}>{authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}</button>
        <div style={{ marginTop: 12, textAlign: 'center' }}>
          {authMode === 'login' ? (
            <span style={{ cursor: 'pointer', color: 'blue' }} onClick={() => { setAuthMode('register'); }}>{'Нет аккаунта? Зарегистрироваться'}</span>
          ) : (
            <span style={{ cursor: 'pointer', color: 'blue' }} onClick={() => { setAuthMode('login'); }}>{'Уже есть аккаунт? Войти'}</span>
          )}
        </div>
      </form>
    </div>
  );
}
