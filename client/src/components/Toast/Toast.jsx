import styles from './Toast.module.scss';

export default function Toast({ show, message, style = {} }) {
  if (!show) return null;
  return (
    <div className={styles.toast} style={style}>
      {message}
    </div>
  );
}
