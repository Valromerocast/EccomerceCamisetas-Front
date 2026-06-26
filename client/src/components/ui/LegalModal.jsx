import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function LegalModal({ open, title, onClose, children }) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-antracita/50 p-4 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-modal-title"
        className="flex max-h-[min(90vh,720px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-cream text-antracita shadow-2xl shadow-black/20"
      >
        <header className="flex items-start justify-between gap-4 border-b border-neutral-200 bg-white px-5 py-4 sm:px-6">
          <div>
            <h2 id="legal-modal-title" className="font-title text-xl font-bold text-[#325B42]">
              {title}
            </h2>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
              Mundialista Store
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-antracita focus:outline-none focus:ring-2 focus:ring-primary/30"
            aria-label="Cerrar"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        <div className="overflow-y-auto px-5 py-5 sm:px-6">
          {children}
        </div>

        <footer className="border-t border-neutral-200 bg-white px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-[#325B42] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#284935] sm:w-auto"
          >
            Entendido
          </button>
        </footer>
      </section>
    </div>,
    document.body
  );
}
