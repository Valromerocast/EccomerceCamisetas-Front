import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { closeNotification } from '../../store/slices/notificationsSlice';

const TYPE_STYLES = {
  success: {
    label: 'Éxito',
    container: 'border-emerald-200 bg-emerald-50 text-emerald-950',
    icon: 'bg-emerald-100 text-emerald-700',
    symbol: '✓',
    duration: 4000
  },
  error: {
    label: 'Error',
    container: 'border-red-200 bg-red-50 text-red-950',
    icon: 'bg-red-100 text-red-700',
    symbol: '!',
    duration: 0
  },
  warning: {
    label: 'Advertencia',
    container: 'border-amber-200 bg-amber-50 text-amber-950',
    icon: 'bg-amber-100 text-amber-700',
    symbol: '!',
    duration: 6000
  },
  info: {
    label: 'Información',
    container: 'border-sky-200 bg-sky-50 text-sky-950',
    icon: 'bg-sky-100 text-sky-700',
    symbol: 'i',
    duration: 4500
  }
};

function Toast({ notification }) {
  const dispatch = useDispatch();
  const style = TYPE_STYLES[notification.type] || TYPE_STYLES.info;
  const duration = notification.duration ?? style.duration;

  useEffect(() => {
    if (duration <= 0) return undefined;
    const timer = window.setTimeout(() => {
      dispatch(closeNotification(notification.id));
    }, duration);
    return () => window.clearTimeout(timer);
  }, [dispatch, duration, notification.id]);

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
        <p className="mt-1 text-sm font-semibold leading-5">{notification.message}</p>
      </div>

      <button
        type="button"
        onClick={() => dispatch(closeNotification(notification.id))}
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

export default function NotificationCenter() {
  const notifications = useSelector((state) => state.notifications.items);

  return createPortal(
    <div
      className="pointer-events-none fixed inset-x-4 top-4 z-[90] flex flex-col items-end gap-3 sm:left-auto sm:right-5 sm:w-full sm:max-w-sm"
      aria-live="polite"
      aria-atomic="false"
    >
      {notifications.map((notification) => (
        <Toast key={notification.id} notification={notification} />
      ))}
    </div>,
    document.body
  );
}
