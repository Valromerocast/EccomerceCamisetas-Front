// Vista de confirmación de compra exitosa
// Se muestra después de que el usuario confirma el checkout.
// Muestra el detalle del pedido, desglose de costos y fecha estimada de entrega.
import { Link } from 'react-router-dom';

function OrderSuccess({ orders = [] }) {
  // El pedido más reciente siempre es el primero (el App los inserta al principio del array)
  const lastOrder = orders[0];

  // Si no hay ninguna orden, muestro un mensaje de error con link al inicio
  if (!lastOrder) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4 text-antracita">
        <h2 className="text-xl font-bold font-title">No se encontró ningún pedido reciente</h2>
        <Link to="/" className="inline-block bg-primary hover:bg-primary/95 text-white font-semibold text-xs py-2.5 px-5 rounded-lg transition-colors">
          Ir al Inicio
        </Link>
      </main>
    );
  }

  // Si la imagen de algún ítem no carga, muestro la imagen de fallback del producto
  const handleImageError = (e, item) => {
    e.target.src = item.product.fallbackImage || "/assets/success.svg";
  };

  // Calcula precios basados en la orden
  const subtotal = lastOrder.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const total = lastOrder.total;

  // Genera fecha estimada de entrega (3 a 5 días)
  const getDeliveryEstimate = () => {
    const months = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun", 
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    ];
    // Intentamos parsear la fecha de la orden, si no usamos la actual
    let orderDate = new Date();
    if (lastOrder.date) {
      const parts = lastOrder.date.split('/');
      if (parts.length === 3) {
        // Formato DD/MM/YYYY
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        orderDate = new Date(year, month, day);
      }
    }
    const dateStart = new Date(orderDate);
    dateStart.setDate(orderDate.getDate() + 3);
    const dateEnd = new Date(orderDate);
    dateEnd.setDate(orderDate.getDate() + 6);
    
    return `${dateStart.getDate()} ${months[dateStart.getMonth()]} - ${dateEnd.getDate()} ${months[dateEnd.getMonth()]}`;
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 text-antracita min-h-screen">
      
      {/* Sección Superior: Éxito */}
      <section className="flex flex-col items-center text-center space-y-4">
        {/* Icono de Checkmark dentro de figure para mantener semántica correcta */}
        <figure className="mb-2">
          <img 
            src="/assets/Background (1).svg" 
            className="w-16 h-16 object-contain" 
            alt="Ícono de compra exitosa" 
          />
        </figure>
        
        {/* Badge de pedido confirmado */}
        <div>
          <span className="inline-block bg-white border border-[#3E664F] text-[#3E664F] text-[10px] font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm">
            Pedido Confirmado
          </span>
        </div>

        {/* Título */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-antracita font-title tracking-tight">
          ¡Gracias por tu compra!
        </h1>
        
        {/* Subtítulo */}
        <p className="text-xs text-neutral-500 max-w-xl leading-relaxed">
          Tu pedido fue registrado con éxito y el stock se actualizó en nuestra tienda.
        </p>
      </section>

      {/* Grid Principal: detalle del pedido y columna lateral */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Columna Izquierda (2/3): Detalle del Pedido */}
        <section className="lg:col-span-2 bg-[#F9F9FB] border border-neutral-200/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          {/* Header del pedido */}
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider">Pedido No.</span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#3E664F] font-mono leading-none">
                #{lastOrder.id.replace('ORD-', 'MS-')}
              </h2>
            </div>
            <div className="text-right space-y-0.5">
              <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider">Fecha de compra</span>
              <p className="text-xs font-bold text-neutral-700">{lastOrder.date}</p>
            </div>
          </div>

          <hr className="border-neutral-200" />

          {/* Lista de productos */}
          <ul className="divide-y divide-neutral-200/60">
            {lastOrder.items.map((item) => (
              <li key={item.cartKey} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center text-xs">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-14 h-16 object-cover rounded-xl bg-white border border-neutral-200 shadow-sm"
                    onError={(e) => handleImageError(e, item)}
                  />
                  <div>
                    <h3 className="font-title font-extrabold text-[#3E664F] text-base leading-snug">
                      {item.product.name}
                    </h3>
                    <p className="text-neutral-500 mt-1 font-semibold text-[11px]">
                      Talle: <span className="text-antracita font-bold">{item.size}</span>
                      {item.dorsal && (
                        <>
                          <span className="mx-1.5">•</span>
                          Dorsal: <span className="text-antracita font-bold">{item.dorsal}</span>
                        </>
                      )}
                    </p>
                    <p className="text-neutral-455 mt-1 font-medium">Cantidad: x{item.quantity}</p>
                  </div>
                </div>
                <div className="text-right font-bold text-sm text-antracita">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </div>
              </li>
            ))}
          </ul>

          <hr className="border-neutral-200" />

          {/* Resumen de costos */}
          <div className="space-y-3.5 text-xs text-neutral-500 font-semibold">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-antracita font-bold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Envío</span>
              <span className="text-[#3E664F] font-bold">GRATIS</span>
            </div>
          </div>

          <hr className="border-neutral-200" />

          {/* Total */}
          <div className="flex justify-between items-center font-title font-bold text-lg sm:text-xl text-antracita">
            <span>Total</span>
            <span className="text-[#3E664F] text-2xl font-extrabold">${total.toFixed(2)}</span>
          </div>
        </section>

        {/* Columna Derecha (1/3): Estimación de Entrega y Ayuda */}
        <aside className="lg:col-span-1 space-y-6">
          
          {/* Card 1: Estimación de Entrega */}
          <article className="bg-[#3E664F] text-white rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-bold text-white/70 tracking-wider">Estimación de entrega</span>
              <h3 className="text-2xl font-extrabold font-title tracking-tight">
                {getDeliveryEstimate()}
              </h3>
            </div>
            <div className="flex items-center space-x-2.5 text-xs font-semibold pt-1 border-t border-white/10">
              <img 
                src="/assets/Icon (3).svg" 
                className="w-4 h-4 object-contain brightness-0 invert" 
                alt="" 
              />
              <span>
                {lastOrder.shippingInfo.city
                  ? `Envío prioritario a ${lastOrder.shippingInfo.city}`
                  : 'Datos de envío informados durante el checkout'}
              </span>
            </div>
          </article>

          {/* Card 2: Ayuda */}
          <article className="bg-neutral-100 rounded-2xl p-6 space-y-3 shadow-sm border border-neutral-200/50">
            <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider">¿Necesitas ayuda?</span>
            <p className="text-xs text-neutral-500 leading-relaxed font-medium">
              Nuestro equipo de soporte está disponible 24/7 para cualquier consulta sobre tu pedido.
            </p>
          </article>
        </aside>
      </section>

      {/* Botón inferior para volver a la tienda */}
      <footer className="flex justify-center pt-4">
        <Link
          to="/"
          className="bg-[#2D4D3A] hover:bg-[#233D2E] text-white font-bold text-xs uppercase tracking-wider py-3.5 px-8 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          Volver a la tienda
        </Link>
      </footer>
    </main>
  );
}

export default OrderSuccess;
