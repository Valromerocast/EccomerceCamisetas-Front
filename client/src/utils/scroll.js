export function scrollToTop(options = {}) {
  const behavior = options.behavior || 'smooth';

  window.requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior });
  });
}
