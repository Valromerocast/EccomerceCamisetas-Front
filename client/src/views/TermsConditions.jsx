import TermsContent from '../components/legal/TermsContent';

function TermsConditions() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-cream text-antracita min-h-screen">
      <header className="border-b border-neutral-350/40 pb-5">
        <h1 className="text-3xl font-extrabold text-antracita font-title">Términos y condiciones</h1>
        <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mt-1">
          Mundialista Store &copy; {new Date().getFullYear()}
        </p>
      </header>

      <section className="bg-white border border-neutral-200/85 rounded-2xl p-6 sm:p-8 shadow-sm">
        <TermsContent />
      </section>
    </main>
  );
}

export default TermsConditions;
