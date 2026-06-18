import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToTop } from '../../utils/scroll';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    scrollToTop({ behavior: 'auto' });
  }, [pathname]);

  return null;
}
