import React, { useEffect } from 'react';
import styles from './AuthModal.module.scss';

export default function AuthModal({
  show, authMode, setAuthMode, authEmail, setAuthEmail, authPassword, setAuthPassword, authPasswordRepeat, setAuthPasswordRepeat, authError, handleAuth, setShowAuth
}) {
  useEffect(() => {
    if (show) {
      document.body.classList.add('modal-open');
      // prevent background scroll
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
    }
    return () => {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
    };
  }, [show]);

  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={() => setShowAuth(false)}>
      <form
        className={styles.modalForm}
        onClick={e => e.stopPropagation()}
        onSubmit={handleAuth}
      >
        <h3>{authMode === 'login' ? 'Вход' : 'Регистрация'}</h3>
        <input
          type="email"
          placeholder="Email"
          value={authEmail}
          onChange={e => setAuthEmail(e.target.value)}
          className={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          value={authPassword}
          onChange={e => setAuthPassword(e.target.value)}
          className={styles.input}
          required
        />
        {authMode === 'register' && (
          <input
            type="password"
            placeholder="Повторите пароль"
            value={authPasswordRepeat}
            onChange={e => setAuthPasswordRepeat(e.target.value)}
            className={styles.input}
            required
          />
        )}
        {authError && <div className={styles.error}>{authError}</div>}
        <button type="submit" className={styles.submitBtn}>
          {authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}
        </button>
        <span
          className={styles.switchLink}
          onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
        >
          {authMode === 'login'
            ? 'Нет аккаунта? Зарегистрироваться'
            : 'Уже есть аккаунт? Войти'}
        </span>
      </form>
    </div>
  );
}
