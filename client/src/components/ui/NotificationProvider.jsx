import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { NotificationContext } from './notification-context';

const TYPE_STYLES = {
  success: {
    label: 'Éxito',
    container: 'border-emerald-200 bg-emerald-50 text-emerald-950',
    icon: 'bg-emerald-100 text-emerald-700',
    symbol: '✓'
  },
  error: {
    label: 'Error',
    container: 'border-red-200 bg-red-50 text-red-950',
    icon: 'bg-red-100 text-red-700',
    symbol: '!'
  },
  warning: {
    label: 'Advertencia',
    container: 'border-amber-200 bg-amber-50 text-amber-950',
    icon: 'bg-amber-100 text-amber-700',
    symbol: '!'
  },
  info: {
    label: 'Información',
    container: 'border-sky-200 bg-sky-50 text-sky-950',
    icon: 'bg-sky-100 text-sky-700',
    symbol: 'i'
  }
};

const AUTO_CLOSE_DURATION = {
  success: 4000,
  warning: 6000,
  info: 4500,
  error: 0
};

function Toast({ notification, onClose }) {
  const style = TYPE_STYLES[notification.type] || TYPE_STYLES.info;

  return (
    <div
      role={notification.type === 'error' ? 'alert' : 'status'}
      className={`pointer-events-auto flex w-full items-start gap-3 rounded-xl border p-4 shadow-lg shadow-black/10 backdrop-blur-sm ${style.container}`}
    >
      <span
        aria-hidden="true"
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-black ${style.icon}`}
      >
        {style.symbol}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] opacity-70">
          {notification.title || style.label}
        </p>
        <p className="mt-1 text-sm font-semibold leading-5">
          {notification.message}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onClose(notification.id)}
        className="rounded-lg p-1 text-current opacity-50 transition hover:bg-black/5 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current/30"
        aria-label="Cerrar notificación"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>
  );
}

function ConfirmModal({ confirmation, onResolve }) {
  useEffect(() => {
    if (!confirmation) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onResolve(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [confirmation, onResolve]);

  if (!confirmation) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-antracita/45 p-4 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onResolve(false);
        }
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        className="w-full max-w-md rounded-2xl border border-neutral-200 bg-cream p-6 text-antracita shadow-2xl shadow-black/20"
      >
        <div className="flex items-start gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-lg font-black text-amber-700">
            !
          </span>
          <div>
            <h2 id="confirm-title" className="font-title text-xl font-bold text-[#325B42]">
              {confirmation.title || 'Confirmar acción'}
            </h2>
            <p id="confirm-message" className="mt-2 text-sm leading-6 text-neutral-600">
              {confirmation.message}
            </p>
          </div>
        </div>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => onResolve(false)}
            className="rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-antracita transition hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {confirmation.cancelText || 'Cancelar'}
          </button>
          <button
            type="button"
            onClick={() => onResolve(true)}
            autoFocus
            className="rounded-lg bg-[#325B42] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#284935] focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {confirmation.confirmText || 'Aceptar'}
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
}

export default function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [confirmation, setConfirmation] = useState(null);
  const nextId = useRef(1);
  const confirmResolver = useRef(null);

  const closeNotification = useCallback((id) => {
    setNotifications((current) => current.filter((item) => item.id !== id));
  }, []);

  const showNotification = useCallback((options) => {
    const type = TYPE_STYLES[options?.type] ? options.type : 'info';
    const id = nextId.current++;
    const duration = options?.duration ?? AUTO_CLOSE_DURATION[type];
    const notification = {
      id,
      type,
      title: options?.title,
      message: options?.message || ''
    };

    setNotifications((current) => [...current, notification]);
    if (duration > 0) {
      window.setTimeout(() => closeNotification(id), duration);
    }

    return id;
  }, [closeNotification]);

  const showConfirm = useCallback((options) => (
    new Promise((resolve) => {
      if (confirmResolver.current) {
        confirmResolver.current(false);
      }

      confirmResolver.current = resolve;
      setConfirmation(options);
    })
  ), []);

  const resolveConfirmation = useCallback((confirmed) => {
    const resolve = confirmResolver.current;
    confirmResolver.current = null;
    setConfirmation(null);
    resolve?.(confirmed);
  }, []);

  const value = useMemo(() => ({
    showNotification,
    showConfirm,
    closeNotification
  }), [showNotification, showConfirm, closeNotification]);

  return (
    <NotificationContext.Provider value={value}>
      {children}

      {createPortal(
        <div
          className="pointer-events-none fixed inset-x-4 top-4 z-[90] flex flex-col items-end gap-3 sm:left-auto sm:right-5 sm:w-full sm:max-w-sm"
          aria-live="polite"
          aria-atomic="false"
        >
          {notifications.map((notification) => (
            <Toast
              key={notification.id}
              notification={notification}
              onClose={closeNotification}
            />
          ))}
        </div>,
        document.body
      )}

      <ConfirmModal confirmation={confirmation} onResolve={resolveConfirmation} />
    </NotificationContext.Provider>
  );
}
