import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          insetInlineStart: 20,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="fade-in"
            style={{
              background: '#fff',
              border: '1px solid var(--line)',
              borderInlineStart: `4px solid ${
                t.type === 'error' ? 'var(--danger)' : t.type === 'success' ? 'var(--teal)' : 'var(--gold)'
              }`,
              borderRadius: 10,
              padding: '13px 18px',
              boxShadow: 'var(--shadow-lg)',
              fontSize: 13.5,
              fontWeight: 600,
              maxWidth: 320,
              color: 'var(--ink)',
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
