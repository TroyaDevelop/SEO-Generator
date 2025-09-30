import styles from './Toast.module.scss';

export default function Toast({ show, message, style = {} }) {
  if (!show) return null;
  const defaultStyle = {
    position: 'fixed',
    top: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 3000,
  };
  const merged = { ...defaultStyle, ...style };
  return (
    <div className={styles.toast} style={merged}>
      {message}
    </div>
  );
}
