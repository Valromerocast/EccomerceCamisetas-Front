function TermsSection({ title, children }) {
  return (
    <div className="space-y-2 border-l-2 border-primary pl-4">
      <h3 className="text-sm font-bold uppercase tracking-wide text-antracita font-title">{title}</h3>
      <div className="space-y-2 text-sm leading-relaxed text-neutral-500">{children}</div>
    </div>
  );
}

export default function TermsContent({ compact = false }) {
  const year = new Date().getFullYear();

  return (
    <article className={`space-y-5 ${compact ? '' : 'text-sm leading-relaxed text-neutral-500'}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-450">
        Última actualización: {year}
      </p>

      <TermsSection title="1. Introducción">
        <p>
          Bienvenido a Mundialista Store. Al registrarte, navegar o realizar una compra en nuestro sitio,
          aceptás estos Términos y Condiciones. Si no estás de acuerdo con alguna parte, te pedimos que no
          utilices la plataforma.
        </p>
      </TermsSection>

      <TermsSection title="2. Uso del sitio">
        <p>
          El sitio está destinado a personas mayores de 18 años o con autorización de un adulto responsable.
          Te comprometés a usar la tienda de forma lícita, sin realizar actividades fraudulentas, publicar
          información falsa ni intentar afectar el funcionamiento del servicio.
        </p>
      </TermsSection>

      <TermsSection title="3. Cuenta de usuario">
        <p>
          Para comprar debés crear una cuenta con datos reales y actualizados. Sos responsable de mantener
          la confidencialidad de tu contraseña y de todas las actividades realizadas desde tu cuenta.
          Mundialista Store puede suspender o cancelar cuentas que incumplan estas condiciones.
        </p>
      </TermsSection>

      <TermsSection title="4. Productos y precios">
        <p>
          Ofrecemos camisetas y productos relacionados con selecciones nacionales. Las imágenes son
          referenciales y pueden presentar variaciones menores de color o diseño. Los precios se expresan
          en pesos argentinos e incluyen los impuestos aplicables, salvo que se indique lo contrario.
          Nos reservamos el derecho de modificar precios, promociones y disponibilidad sin previo aviso.
        </p>
      </TermsSection>

      <TermsSection title="5. Pedidos y pagos">
        <p>
          Al confirmar una compra, recibís una solicitud de pedido sujeta a disponibilidad de stock.
          El contrato de compraventa se considera perfeccionado cuando el pago es aprobado. Podemos
          rechazar o cancelar pedidos por errores en el precio, stock insuficiente o sospecha de fraude.
        </p>
      </TermsSection>

      <TermsSection title="6. Envíos">
        <p>
          Los plazos de entrega son estimados y pueden variar según la zona y el operador logístico.
          Mundialista Store no se responsabiliza por demoras atribuibles a terceros, fuerza mayor o datos
          de envío incorrectos proporcionados por el cliente.
        </p>
      </TermsSection>

      <TermsSection title="7. Cambios y devoluciones">
        <p>
          Podés solicitar un cambio o devolución dentro de los 15 días corridos desde la recepción del
          producto, siempre que la prenda no haya sido usada, conserve etiquetas y se encuentre en su
          estado original. Los gastos de envío de la devolución corren por cuenta del cliente, salvo
          defecto de fabricación o error atribuible a la tienda.
        </p>
      </TermsSection>

      <TermsSection title="8. Propiedad intelectual">
        <p>
          Todo el contenido del sitio —textos, imágenes, logotipos, diseño y código— es propiedad de
          Mundialista Store o de sus licenciantes. Queda prohibida su reproducción sin autorización
          expresa por escrito.
        </p>
      </TermsSection>

      <TermsSection title="9. Limitación de responsabilidad">
        <p>
          En la máxima medida permitida por la ley, Mundialista Store no será responsable por daños
          indirectos, lucro cesante o pérdidas derivadas del uso o imposibilidad de uso del sitio,
          salvo disposición legal en contrario.
        </p>
      </TermsSection>

      <TermsSection title="10. Modificaciones">
        <p>
          Podemos actualizar estos términos en cualquier momento. Las versiones vigentes se publicarán en
          esta página. El uso continuado del sitio después de un cambio implica la aceptación de los
          nuevos términos.
        </p>
      </TermsSection>

      <TermsSection title="11. Contacto">
        <p>
          Para consultas sobre estos términos podés escribirnos a{' '}
          <a href="mailto:legal@mundialista.store" className="font-bold text-primary hover:underline">
            legal@mundialista.store
          </a>
          {' '}o a través de nuestra sección de Ayuda.
        </p>
      </TermsSection>
    </article>
  );
}
