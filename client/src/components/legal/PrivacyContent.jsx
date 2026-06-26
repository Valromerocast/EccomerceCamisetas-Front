function PrivacySection({ title, children }) {
  return (
    <div className="space-y-2">
      <h3 className="border-b border-neutral-100 pb-2 text-sm font-bold uppercase tracking-wide text-antracita font-title">
        {title}
      </h3>
      <div className="space-y-2 text-sm leading-relaxed text-neutral-500">{children}</div>
    </div>
  );
}

export default function PrivacyContent() {
  return (
    <article className="space-y-5">
      <PrivacySection title="Compromiso con tu privacidad">
        <p>
          En Mundialista Store tratamos tus datos personales con responsabilidad. Esta política explica
          qué información recopilamos, para qué la usamos y cuáles son tus derechos.
        </p>
      </PrivacySection>

      <PrivacySection title="Datos que recopilamos">
        <ul className="list-disc space-y-2 pl-5 font-semibold">
          <li>
            <strong className="text-antracita">Datos de registro:</strong> nombre, apellido y correo electrónico.
          </li>
          <li>
            <strong className="text-antracita">Datos de compra:</strong> dirección, teléfono y detalle de pedidos.
          </li>
          <li>
            <strong className="text-antracita">Datos de pago:</strong> procesados de forma segura por proveedores externos; no almacenamos datos completos de tarjetas.
          </li>
          <li>
            <strong className="text-antracita">Datos técnicos:</strong> dirección IP, navegador y cookies de sesión.
          </li>
        </ul>
      </PrivacySection>

      <PrivacySection title="Finalidad del tratamiento">
        <p>
          Utilizamos tus datos para crear y administrar tu cuenta, procesar pedidos, gestionar envíos,
          brindar soporte, enviar comunicaciones relacionadas con tu compra y mejorar la experiencia de
          la tienda.
        </p>
      </PrivacySection>

      <PrivacySection title="Conservación y seguridad">
        <p>
          Conservamos la información el tiempo necesario para cumplir obligaciones legales y comerciales.
          Aplicamos medidas técnicas y organizativas razonables para proteger tus datos frente a accesos
          no autorizados, pérdida o alteración.
        </p>
      </PrivacySection>

      <PrivacySection title="Compartición con terceros">
        <p>
          No vendemos ni alquilamos tu información personal. Solo compartimos datos con proveedores que
          nos ayudan a operar el servicio (logística, pagos y hosting), siempre bajo acuerdos de
          confidencialidad y únicamente para las finalidades indicadas.
        </p>
      </PrivacySection>

      <PrivacySection title="Cookies">
        <p>
          Usamos cookies para mantener tu sesión iniciada, recordar el carrito y analizar el uso del sitio.
          Podés configurar tu navegador para rechazarlas, aunque algunas funciones podrían dejar de estar
          disponibles.
        </p>
      </PrivacySection>

      <PrivacySection title="Tus derechos">
        <p>
          Podés solicitar acceso, rectificación o eliminación de tus datos personales escribiendo a{' '}
          <a href="mailto:privacy@mundialista.store" className="font-bold text-primary hover:underline">
            privacy@mundialista.store
          </a>
          . Responderemos dentro de los plazos establecidos por la normativa aplicable.
        </p>
      </PrivacySection>
    </article>
  );
}
