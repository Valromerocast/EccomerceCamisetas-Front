// Vista de confirmación de compra exitosa
// Se muestra después de que el usuario confirma el checkout.
// Toma el primer pedido del array (el más reciente) y muestra sus detalles.
import React from 'react';
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

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-center text-antracita bg-cream min-h-screen">

      {/* Tarjeta principal de confirmación */}
      <section className="bg-white border border-neutral-200/80 rounded-2xl p-8 sm:p-12 space-y-6 flex flex-col items-center shadow-sm">

        {/* Ícono de checkmark en círculo verde */}
        <div className="bg-emerald-100 text-emerald-600 p-4 rounded-full border border-emerald-200">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Título y descripción de éxito */}
        <div className="space-y-1.5">
          <span className="inline-block bg-emerald-100 text-emerald-800 text-[9px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-200 shadow-sm">
            Pago Confirmado
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-antracita font-title">¡Gracias por tu compra!</h1>
          <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
            Tu pedido ha sido procesado con éxito. Prepárate para lucir la historia del fútbol mundial. Te hemos enviado un correo de confirmación.
          </p>
        </div>

        {/* Número de pedido en formato legible (reemplaza ORD- por MS-) */}
        <div className="bg-cream px-6 py-4 rounded-xl border border-neutral-200 inline-block">
          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">Nro. de Pedido</span>
          <strong className="text-lg font-mono text-primary mt-1 block">#{lastOrder.id.replace('ORD-', 'MS-')}</strong>
        </div>

        {/* Tarjeta con el detalle completo del pedido */}
        <article className="w-full text-left bg-cream/30 border border-neutral-200 rounded-xl p-5 sm:p-6 space-y-5 text-xs">
          <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
            <h2 className="text-xs font-bold text-antracita uppercase tracking-wider font-title">Detalles de la compra</h2>
            <span className="text-neutral-500 font-semibold">{lastOrder.date}</span>
          </div>

          {/* Datos del cliente, método de pago y dirección de envío */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-neutral-500 font-semibold">
            <div>
              <p className="text-[9px] uppercase font-bold text-neutral-400">Cliente</p>
              <p className="font-bold text-antracita mt-0.5">{lastOrder.shippingInfo.fullName}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase font-bold text-neutral-400">Método de Pago</p>
              {/* Formato legible del método de pago */}
              <p className="font-bold text-antracita mt-0.5 capitalize">{lastOrder.paymentMethod === 'mercadopago' ? 'Mercado Pago' : lastOrder.paymentMethod}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-[9px] uppercase font-bold text-neutral-400">Dirección de Envío</p>
              <p className="font-bold text-antracita mt-0.5">
                {lastOrder.shippingInfo.address}, {lastOrder.shippingInfo.city} ({lastOrder.shippingInfo.zipCode})
              </p>
            </div>
          </div>

          <hr className="border-neutral-200" />

          {/* Lista de artículos comprados con imagen, nombre, talle, color y precio */}
          <h2 className="text-xs font-bold text-antracita uppercase tracking-wider font-title">Artículos</h2>
          <ul className="divide-y divide-neutral-200/50">
            {lastOrder.items.map((item) => (
              <li key={item.cartKey} className="py-3 flex justify-between items-center text-neutral-500 font-semibold">
                <div className="flex items-center space-x-3">
                  {/* Miniatura del artículo */}
                  <img
                    src={item.product.image}
                    alt={`Camiseta ${item.product.name}`}
                    className="w-8 h-10 object-cover rounded bg-neutral-100 border border-neutral-200"
                    onError={(e) => handleImageError(e, item)}
                  />
                  <span>
                    {item.product.name} ({item.size} - {item.color}) <strong className="text-neutral-400">x{item.quantity}</strong>
                  </span>
                </div>
                {/* Subtotal del ítem */}
                <span className="font-bold text-antracita">${(item.product.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>

          {/* Total final del pedido */}
          <div className="flex justify-between items-center pt-3 border-t border-neutral-200 font-bold text-sm text-antracita">
            <span>Total abonado:</span>
            <span className="text-primary text-base font-title">${lastOrder.total.toFixed(2)}</span>
          </div>
        </article>

        {/* Botones de acción post-compra */}
        <div className="pt-4 flex flex-col sm:flex-row gap-4 w-full justify-center">
          {/* Volver al catálogo a seguir comprando */}
          <Link
            to="/catalog"
            className="bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider py-3 px-6 rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            Seguir Comprando
          </Link>
          {/* Ver el historial de pedidos en el perfil */}
          <Link
            to="/profile"
            className="bg-white border border-neutral-300 hover:bg-neutral-50 text-antracita font-bold text-xs uppercase tracking-wider py-3 px-6 rounded-lg transition-all cursor-pointer shadow-sm"
          >
            Ver mis Pedidos
          </Link>
        </div>
      </section>
    </main>
  );
}

export default OrderSuccess;
