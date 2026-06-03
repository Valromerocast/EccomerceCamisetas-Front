// Vista del detalle de una orden específica (panel admin)
// Muestra todos los datos del pedido: artículos, info de entrega, método de pago y estado.
// El admin puede cambiar el estado del pedido desde un selector desplegable.
import { useParams, Link } from 'react-router-dom';

function AdminOrderDetail({ orders = [], updateOrderStatus }) {
  const { id } = useParams();

  // Busco el pedido por ID en el array de órdenes
  const order = orders.find((o) => o.id === id);

  // Si no existe el pedido (ID inválido o borrado), muestro un mensaje y link para volver
  if (!order) {
    return (
      <div className="space-y-4 text-center py-16 bg-white border border-neutral-200 rounded-xl shadow-sm text-antracita">
        <h2 className="text-lg font-bold font-title">Pedido no encontrado</h2>
        <p className="text-xs text-neutral-500">El número de orden {id} no existe en los registros.</p>
        <Link
          to="/admin/sales"
          className="inline-block bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-5 rounded-lg transition-colors cursor-pointer shadow-sm"
        >
          Volver a Ventas
        </Link>
      </div>
    );
  }

  // Actualiza el estado del pedido al seleccionar una opción del dropdown
  const handleStatusChange = (e) => {
    updateOrderStatus(order.id, e.target.value);
    alert(`Estado del pedido ${order.id} cambiado a "${e.target.value}"`);
  };

  // Si la imagen de un artículo falla, muestro la imagen de fallback
  const handleImageError = (e, item) => {
    e.target.src = item.product.fallbackImage || "/assets/success.svg";
  };

  return (
    <div className="space-y-6 text-antracita">

      {/* Encabezado del detalle: ID del pedido y fecha de registro */}
      <header className="border-b border-neutral-200 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3.5">
            <h1 className="text-2xl font-extrabold text-antracita font-title">Pedido</h1>
            {/* ID formateado como MS- en lugar de ORD- */}
            <span className="font-mono font-bold text-primary text-base">#{order.id.replace('ORD-', 'MS-')}</span>
          </div>
          <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mt-1">Registrado el {order.date} a las {order.time}</p>
        </div>
        {/* Link para volver al listado de ventas */}
        <Link
          to="/admin/sales"
          className="text-xs text-primary hover:underline font-bold uppercase tracking-wider"
        >
          &larr; Volver a Ventas
        </Link>
      </header>

      {/* Grilla de 3 columnas: contenido del pedido a la izquierda y acciones a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Columna izquierda (2/3): artículos y datos de entrega */}
        <div className="lg:col-span-2 space-y-6">

          {/* Tarjeta de artículos comprados */}
          <section className="bg-white border border-neutral-200 rounded-xl p-5 sm:p-6 space-y-4 shadow-sm">
            <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wider font-title">
              Artículos Comprados ({order.items.reduce((sum, i) => sum + i.quantity, 0)})
            </h2>
            <ul className="divide-y divide-neutral-100">
              {order.items.map((item) => (
                <li key={item.cartKey} className="py-4 flex items-center justify-between text-xs text-neutral-500 font-semibold">
                  <div className="flex items-center space-x-3.5">
                    {/* Miniatura del artículo */}
                    <img
                      src={item.product.image}
                      alt={`Camiseta ${item.product.name}`}
                      className="w-10 h-12 object-cover rounded bg-neutral-150 border border-neutral-200"
                      onError={(e) => handleImageError(e, item)}
                    />
                    <div>
                      <p className="font-bold text-antracita font-title text-sm">{item.product.name}</p>
                      <p className="text-neutral-450 mt-0.5 uppercase text-[10px]">Talle: {item.size} | Color: {item.color}</p>
                    </div>
                  </div>
                  {/* Precio unitario × cantidad y subtotal del ítem */}
                  <div className="text-right">
                    <p className="font-bold text-neutral-500">${item.product.price.toFixed(2)} x{item.quantity}</p>
                    <p className="font-extrabold text-antracita mt-0.5">${(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Total del pedido al pie de la lista */}
            <div className="flex justify-between items-center pt-4 border-t border-neutral-200 font-bold text-sm text-antracita font-title">
              <span>Total del Pedido:</span>
              <span className="text-primary text-base">${order.total.toFixed(2)}</span>
            </div>
          </section>

          {/* Tarjeta de información de entrega */}
          <section className="bg-white border border-neutral-200 rounded-xl p-5 sm:p-6 space-y-4 shadow-sm">
            <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wider font-title">Información de Entrega</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-neutral-500 font-semibold">
              <div>
                <p className="text-[9px] uppercase font-bold text-neutral-400">Destinatario</p>
                <p className="font-bold text-antracita mt-0.5">{order.shippingInfo.fullName}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-neutral-400">Teléfono</p>
                <p className="font-bold text-antracita mt-0.5">{order.shippingInfo.phone}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-neutral-400">Dirección</p>
                <p className="font-bold text-antracita mt-0.5">
                  {order.shippingInfo.address}, {order.shippingInfo.city} ({order.shippingInfo.zipCode})
                </p>
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-neutral-400">Email de Registro</p>
                <p className="font-bold text-antracita mt-0.5">{order.userEmail}</p>
              </div>
            </div>
          </section>
        </div>

        {/* Columna derecha (1/3): acciones del pedido */}
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-white border border-neutral-200 rounded-xl p-5 sm:p-6 space-y-6 shadow-sm">
            <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wider font-title">Estado del Pedido</h2>

            {/* Selector de estado — el admin puede cambiar el estado del pedido desde acá */}
            <div className="space-y-2">
              <label htmlFor="orderStatus" className="text-[9px] font-bold text-neutral-500 tracking-wider uppercase">
                Actualizar Estado
              </label>
              <select
                id="orderStatus"
                value={order.status}
                onChange={handleStatusChange}
                className="w-full bg-cream border border-neutral-250 text-antracita text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary shadow-inner cursor-pointer"
              >
                <option value="Procesando">Procesando</option>
                <option value="Enviado">Enviado</option>
                <option value="Entregado">Entregado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>

            {/* Información adicional del pedido */}
            <div className="border-t border-neutral-100 pt-4 space-y-3 text-xs text-neutral-500 font-semibold">
              <div>
                <p className="text-neutral-400 font-bold uppercase tracking-wider text-[9px]">Método de Pago</p>
                <p className="font-bold text-antracita mt-0.5 capitalize">{order.paymentMethod === 'mercadopago' ? 'Mercado Pago' : order.paymentMethod}</p>
              </div>
              <div>
                <p className="text-neutral-400 font-bold uppercase tracking-wider text-[9px]">Fecha del Registro</p>
                <p className="font-bold text-antracita mt-0.5">{order.date} a las {order.time}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default AdminOrderDetail;
