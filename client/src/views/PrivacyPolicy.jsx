
function PrivacyPolicy() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-cream text-antracita min-h-screen">
      <header className="border-b border-neutral-350/40 pb-5">
        <h1 className="text-3xl font-extrabold text-antracita font-title">Política de Privacidad</h1>
        <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mt-1">Tu confianza es nuestro mayor trofeo. Descubre cómo protegemos tus datos.</p>
      </header>

      {/* Main Content card */}
      <section className="bg-white border border-neutral-200/85 rounded-2xl p-6 sm:p-8 space-y-6 text-sm text-neutral-500 leading-relaxed shadow-sm">
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-antracita uppercase tracking-wide font-title border-b border-neutral-100 pb-2">Compromiso Mundialista</h2>
          <p>
            En Mundialista Store, valoramos tu privacidad de manera absoluta y nos comprometemos a proteger los datos personales que decidas compartir con nosotros. Esta política detalla nuestras prácticas respecto a la recolección, uso y seguridad de tu información, reflejando nuestra dedicación a la transparencia y la excelencia.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-bold text-antracita uppercase tracking-wide font-title border-b border-neutral-100 pb-2">Recolección de Información</h2>
          <p>
            Recopilamos información necesaria para brindarte la mejor experiencia de coleccionismo. Esto incluye:
          </p>
          <ul className="list-disc pl-5 space-y-2 font-semibold">
            <li><strong className="text-antracita">Datos identificativos:</strong> Nombre, apellido y dirección de correo electrónico al registrarte.</li>
            <li><strong className="text-antracita">Información de Envío:</strong> Dirección física y número de contacto para la entrega de tus prendas históricas.</li>
            <li><strong className="text-antracita">Datos de Transacción:</strong> Información de pago procesada de forma cifrada a través de pasarelas seguras.</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-bold text-antracita uppercase tracking-wide font-title border-b border-neutral-100 pb-2">Uso de los Datos</h2>
          <p>
            Utilizamos la información con el fin primordial de gestionar tus pedidos y personalizar tu experiencia de compra en nuestra plataforma. Tus datos nos permiten informarte sobre lanzamientos exclusivos, adiciones límites al catálogo e información relevante de tus envíos.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-bold text-antracita uppercase tracking-wide font-title border-b border-neutral-100 pb-2">Política de Cookies</h2>
          <p>
            Mundialista Store utiliza cookies para optimizar la navegación. Estas pequeñas piezas de datos nos ayudan a recordar tu carrito de compras y tus preferencias de idioma, asegurando que cada visita sea fluida y profesional.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-bold text-antracita uppercase tracking-wide font-title border-b border-neutral-100 pb-2">Intercambio con Terceros</h2>
          <p>
            No vendemos ni alquilamos tus datos a terceros. Compartimos información únicamente con socios estratégicos que hacen posible nuestras operaciones: servicios de logística global, pasarelas de pago y herramientas de análisis que nos ayudan a mejorar el diseño de nuestra curaduría.
          </p>
        </div>

        {/* Security Alert Card (Page 10) */}
        <div className="bg-neutral-900 rounded-xl p-5 text-xs text-white space-y-3.5 border border-neutral-850 shadow-inner">
          <div className="flex items-center space-x-2 border-b border-white/10 pb-2">
            <span className="text-lg">🛡️</span>
            <h3 className="font-bold text-white uppercase tracking-wider font-title">Seguridad de Datos</h3>
          </div>
          <p className="text-neutral-350 leading-relaxed font-semibold">
            Implementamos protocolos de cifrado SSL de última generación para proteger cada transacción. Nuestro sistema monitorea constantemente cualquier intento de acceso no autorizado.
          </p>
          <span className="inline-block text-[9px] font-extrabold uppercase tracking-widest bg-emerald-600/20 text-emerald-450 border border-emerald-500/20 px-2 py-0.5 rounded">
            Protección de Grado Bancario
          </span>
        </div>

        <div className="text-center pt-4">
          <p className="text-xs text-neutral-450 font-bold">¿Tienes preguntas sobre tus datos?</p>
          <a href="mailto:privacy@mundialista.store" className="text-primary hover:underline text-sm font-black mt-1 inline-block">
            privacy@mundialista.store
          </a>
        </div>
      </section>
    </main>
  );
}

export default PrivacyPolicy;
