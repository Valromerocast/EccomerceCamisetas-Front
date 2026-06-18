
function TermsConditions() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-cream text-antracita min-h-screen">
      <header className="border-b border-neutral-350/40 pb-5">
        <h1 className="text-3xl font-extrabold text-antracita font-title">Términos y condiciones</h1>
        <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mt-1">Mundialista Heritage Store &copy; {new Date().getFullYear()}</p>
      </header>

      {/* Main Content card */}
      <section className="bg-white border border-neutral-200/85 rounded-2xl p-6 sm:p-8 space-y-6 text-sm text-neutral-500 leading-relaxed shadow-sm">
        <div className="space-y-2 border-l-2 border-primary pl-4">
          <h2 className="text-sm font-bold text-antracita uppercase tracking-wide font-title">Introducción</h2>
          <p>
            Bienvenido a Mundialista Store. Estos términos y condiciones constituyen un acuerdo vinculante entre usted y Mundialista Store respecto del uso de este sitio web y de todos los productos y servicios ofrecidos en él.
          </p>
        </div>

        <div className="space-y-2 border-l-2 border-primary pl-4">
          <h2 className="text-sm font-bold text-antracita uppercase tracking-wide font-title">Propiedad Intelectual</h2>
          <p>
            Este sitio web contiene material que es de propiedad o está licenciado a nosotros. Este material incluye, pero no se limita al, diseño, la apariencia y los gráficos. La reproducción está prohibida salvo de acuerdo con el aviso de copyright que forma parte de estos términos y condiciones.
          </p>
        </div>

        {/* Mid-document banner image mockup */}
        <div className="aspect-[21/9] bg-neutral-900 rounded-xl overflow-hidden shadow-inner border border-neutral-200 relative my-6">
          <img
            src="/assets/hero-left.svg"
            alt="Detalle textil de la costura de una camiseta de fútbol"
            className="w-full h-full object-cover opacity-80"
          />
        </div>

        <div className="space-y-2 border-l-2 border-primary pl-4">
          <h2 className="text-sm font-bold text-antracita uppercase tracking-wide font-title">Cuentas de Usuario</h2>
          <p>
            Al crear una cuenta en nuestro sitio, usted es responsable de mantener la seguridad de su cuenta y es plenamente responsable de todas las actividades que ocurran bajo esa cuenta de correo electrónico. Debe notificarnos inmediatamente sobre cualquier uso no autorizado de su cuenta.
          </p>
        </div>

        <div className="space-y-2 border-l-2 border-primary pl-4">
          <h2 className="text-sm font-bold text-antracita uppercase tracking-wide font-title">Envíos y Devoluciones</h2>
          <p>
            Nos esforzamos por garantizar que tu pedido llegue en perfectas condiciones. Los plazos de envío pueden variar según la disponibilidad del producto. No nos hacemos responsables de retrasos causados por terceros. Para devoluciones, el producto debe estar en su estado original, sin usar y con todas las etiquetas intactas. Las devoluciones deben solicitarse dentro de los 15 días posteriores a la recepción del pedido. Los costos de envío de la devolución son a cargo del cliente, a menos que el producto esté defectuoso.
          </p>
        </div>

        {/* Highlight Boxes (Page 11) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <div className="bg-cream border border-neutral-200 rounded-xl p-4 space-y-2 text-xs">
            <h3 className="font-bold text-antracita flex items-center space-x-1.5 font-title">
              <span>📦</span>
              <span>Envío Premium</span>
            </h3>
            <p className="text-neutral-500 leading-normal font-semibold">
              Empaque de lujo y seguimiento en tiempo real para todos nuestros mantos históricos.
            </p>
          </div>

          <div className="bg-cream border border-neutral-200 rounded-xl p-4 space-y-2 text-xs">
            <h3 className="font-bold text-antracita flex items-center space-x-1.5 font-title">
              <span>🛡️</span>
              <span>Garantía de Calidad</span>
            </h3>
            <p className="text-neutral-500 leading-normal font-semibold">
              Cada prenda es inspeccionada y rigurosamente aprobada antes de salir de nuestro centro.
            </p>
          </div>
        </div>

        <hr className="border-neutral-100" />

        <div className="space-y-2 border-l-2 border-primary pl-4">
          <h2 className="text-sm font-bold text-antracita uppercase tracking-wide font-title">Limitación de Responsabilidad</h2>
          <p>
            En la medida máxima permitida por la ley aplicable, en ningún caso Mundialista Store, sus afiliados, directores, empleados o agentes serán responsables ante ninguna persona por cualquier daño indirecto, incidental, especial, punitivo o consecuente.
          </p>
        </div>
      </section>
    </main>
  );
}

export default TermsConditions;
