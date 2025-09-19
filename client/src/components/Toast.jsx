export default function Toast({ show, message, style = {} }) {
  if (!show) return null;
  return (
    <div
      style={{
        position: 'fixed',
        top: 40,
        right: 40,
        background: '#fff0f0',
        color: '#d32f2f',
        border: '1.5px solid #d32f2f',
        borderRadius: 10,
        padding: '14px 28px',
        fontSize: 17,
        fontWeight: 500,
        zIndex: 1000,
        boxShadow: '0 2px 12px #d32f2f22',
        transition: 'opacity 0.3s',
        ...style
      }}
    >
      {message}
    </div>
  );
}
