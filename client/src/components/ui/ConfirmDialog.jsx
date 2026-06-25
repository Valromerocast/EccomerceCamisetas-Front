import { createPortal } from 'react-dom';

export default function ConfirmDialog({
  open,
  title = 'Confirmar acción',
  message,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel
}) {
  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-antracita/45 p-4 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
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
            <h2 id="confirm-title" className="font-title text-xl font-bold text-[#325B42]">{title}</h2>
            <p id="confirm-message" className="mt-2 text-sm leading-6 text-neutral-600">{message}</p>
          </div>
        </div>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-antracita transition hover:bg-neutral-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            autoFocus
            className="rounded-lg bg-[#325B42] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#284935]"
          >
            {confirmText}
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
}
