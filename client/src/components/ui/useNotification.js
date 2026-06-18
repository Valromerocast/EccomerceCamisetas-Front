import { useContext } from 'react';
import { NotificationContext } from './notification-context';

export function useNotification() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotification debe usarse dentro de NotificationProvider.');
  }

  return context;
}
