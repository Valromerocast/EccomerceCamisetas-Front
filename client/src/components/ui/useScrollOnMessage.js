import { useEffect } from 'react';
import { scrollToTop } from '../../utils/scroll';

export function useScrollOnMessage(message) {
  useEffect(() => {
    if (message) {
      scrollToTop();
    }
  }, [message]);
}
