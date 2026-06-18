// Vista del detalle de una orden específica (panel admin)
// Muestra todos los datos del pedido: artículos, info de entrega, método de pago, estado y actividad.
// El admin puede cambiar el estado del pedido desde un botón desplegable interactivo.
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

function AdminOrderDetail({ orders = [], updateOrderStatus }) {
  const { id } = useParams();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

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
  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    setStatusError('');

    const result = await updateOrderStatus(order.id, newStatus);
    if (!result.success) {
      setStatusError(result.message || 'No se pudo actualizar el pedido.');
    }

    setUpdatingStatus(false);
    setIsDropdownOpen(false);
  };

  // Si la imagen de un artículo falla, muestro la imagen de fallback
  const handleImageError = (e, item) => {
    e.target.src = item.product.fallbackImage || "/assets/success.svg";
  };

  // Estilo del badge de estado en el encabezado
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Procesando':
        return 'bg-[#EAEAEA] text-[#333333] border-neutral-300';
      case 'Enviado':
        return 'bg-[#FFF3CD] text-[#856404] border-[#FFEBAA]';
      case 'Entregado':
        return 'bg-[#D4EDDA] text-[#155724] border-[#C3E6CB]';
      case 'Cancelado':
        return 'bg-[#F8D7DA] text-[#721C24] border-[#F5C6CB]';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  // Calcula iniciales para el avatar del cliente
  const initials = order.userName
    ? order.userName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'CL';

  // Cálculos de resumen de precios
  const subtotal = order.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const grandTotal = order.total;

  // Genera eventos dinámicos de la línea de tiempo según el estado actual
  const getTimelineEvents = () => {
    const events = [];
    const dateStr = order.date;
    const timeStr = order.time;

    // Pedido Realizado siempre está activo
    events.push({
      title: 'Pedido Realizado',
      time: `${dateStr} a las ${timeStr}`,
      active: true,
      color: 'bg-[#4A7459]'
    });

    if (order.status === 'Cancelado') {
      events.unshift({
        title: 'Pedido Cancelado',
        time: 'Hoy',
        active: true,
        color: 'bg-red-500'
      });
      return events;
    }

    // Pago Confirmado
    events.unshift({
      title: 'Pago Confirmado',
      time: `${dateStr} a las ${timeStr}`,
      active: true,
      color: 'bg-[#4A7459]'
    });

    // Pedido Procesado / En Proceso
    if (order.status === 'Procesando' || order.status === 'Enviado' || order.status === 'Entregado') {
      events.unshift({
        title: 'Pedido Procesado',
        time: order.status === 'Procesando' ? 'Hoy' : `${dateStr} a las ${timeStr}`,
        active: true,
        color: 'bg-[#4A7459]'
      });
    } else {
      events.unshift({
        title: 'Pedido Procesado',
        time: 'Pendiente',
        active: false,
        color: 'bg-neutral-300'
      });
    }

    // Pedido Enviado
    if (order.status === 'Enviado' || order.status === 'Entregado') {
      events.unshift({
        title: 'Pedido Enviado',
        time: order.status === 'Enviado' ? 'Hoy' : `${dateStr} a las ${timeStr}`,
        active: true,
        color: 'bg-[#4A7459]'
      });
    }

    // Pedido Entregado
    if (order.status === 'Entregado') {
      events.unshift({
        title: 'Pedido Entregado',
        time: 'Hoy',
        active: true,
        color: 'bg-[#4A7459]'
      });
    }

    return events;
  };

  return (
    <div className="space-y-6 text-antracita max-w-6xl mx-auto">
      {/* Encabezado con breadcrumbs y botón interactivo */}
      <header className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4">
        <div className="space-y-1.5">
          <nav className="text-xs text-neutral-500 font-semibold" aria-label="Breadcrumb">
            <Link to="/admin/sales" className="hover:text-primary transition-colors">Ventas</Link>
            <span className="mx-1.5">/</span>
            <span className="text-antracita font-bold">Detalle de Pedido</span>
          </nav>
          <div className="flex items-center space-x-3.5 mt-1">
            <h1 className="text-2xl font-extrabold text-antracita font-title">Pedido</h1>
            <span className="font-mono font-bold text-primary text-base">#{order.id.replace('ORD-', 'MS-')}</span>
          </div>
          <div className="flex items-center space-x-3 mt-1.5">
            <span className={`text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border shadow-sm ${getStatusBadgeStyle(order.status)}`}>
              {order.status}
            </span>
            <span className="text-xs text-neutral-500 font-semibold">
              Realizado el {order.date}
            </span>
          </div>
        </div>

        {/* Dropdown de Cambiar Estado */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={updatingStatus}
            className="bg-[#325B42] hover:bg-[#284935] text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span>{updatingStatus ? 'Actualizando...' : 'Cambiar Estado'}</span>
            <svg className={`w-3.5 h-3.5 transition-transform duration-205 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isDropdownOpen && (
            <>
              {/* Backdrop para cerrar el dropdown al hacer click afuera */}
              <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
              
              <ul className="absolute right-0 mt-2 w-40 bg-white border border-neutral-200 rounded-lg shadow-lg z-20 py-1 font-bold text-xs uppercase tracking-wide">
                {['Procesando', 'Enviado', 'Entregado', 'Cancelado'].map((status) => (
                  <li key={status}>
                    <button
                      onClick={() => handleStatusChange(status)}
                      className={`w-full text-left px-4 py-2 hover:bg-neutral-50 hover:text-[#325B42] transition-colors cursor-pointer ${order.status === status ? 'text-[#325B42] bg-neutral-50/50' : 'text-neutral-600'}`}
                    >
                      {status}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </header>

      {statusError && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3.5 rounded-lg text-xs font-bold">
          {statusError}
        </div>
      )}

      {/* Grilla principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Columna izquierda (2/3): Artículos Comprados y Resumen de Precios */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card de Artículos Comprados */}
          <section className="bg-white border border-neutral-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
            <h2 className="text-[#325B42] font-title font-extrabold text-lg">
              Artículos Comprados ({order.items.reduce((sum, i) => sum + i.quantity, 0)})
            </h2>
            <ul className="divide-y divide-neutral-150/60">
              {order.items.map((item) => (
                <li key={item.cartKey} className="py-4 first:pt-2 last:pb-2 flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.product.image}
                      alt={`Camiseta ${item.product.name}`}
                      className="w-16 h-16 object-cover rounded-xl bg-neutral-105 border border-neutral-200 shadow-sm"
                      onError={(e) => handleImageError(e, item)}
                    />
                    <div>
                      <p className="font-title font-bold text-[#325B42] text-sm leading-snug">{item.product.name}</p>
                      <p className="text-neutral-500 mt-1 font-semibold text-[11px]">
                        Talle: <span className="text-antracita font-bold">{item.size}</span>
                        <span className="mx-1.5">|</span>
                        Dorsal: <span className="text-antracita font-bold">{item.dorsal || 'Sin número'}</span>
                      </p>
                      <p className="text-[#325B42] font-bold mt-1.5">${item.product.price.toFixed(2)} USD</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-antracita text-xs">x{item.quantity}</p>
                    <p className="font-bold text-neutral-500 mt-1">${(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Resumen de Precios */}
          <section className="bg-[#F2EFE9] border border-neutral-250/60 rounded-xl p-5 space-y-3.5 shadow-sm text-xs font-semibold text-neutral-500">
            <div className="flex justify-between items-center">
              <span>Subtotal</span>
              <span className="text-antracita font-bold">${subtotal.toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Envío</span>
              <span className="text-[#325B42] font-bold">Gratis</span>
            </div>
            <hr className="border-neutral-250/50" />
            <div className="flex justify-between items-center text-sm font-bold text-antracita font-title">
              <span>Total</span>
              <span className="text-[#325B42] text-base font-extrabold">${grandTotal.toFixed(2)} USD</span>
            </div>
          </section>
        </div>

        {/* Columna derecha (1/3): Cliente, Envío y Actividad */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Card de Cliente */}
          <section className="bg-white border border-neutral-200/80 rounded-2xl p-6 space-y-5 shadow-sm">
            <div className="flex items-center space-x-2 text-[#325B42] font-title font-bold text-sm">
              <img src="/assets/user-icon.svg" className="w-4 h-4 object-contain" alt="" />
              <span>Cliente</span>
            </div>

            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-full bg-[#D1E7DD] text-[#0F5132] flex items-center justify-center font-bold text-sm">
                {initials}
              </div>
              <div>
                <h3 className="text-sm font-bold text-antracita">{order.userName}</h3>
              </div>
            </div>

            <div className="space-y-3.5 pt-1 text-xs">
              <div className="flex items-start space-x-2.5">
                <svg className="w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div className="space-y-0.5 min-w-0">
                  <p className="text-[9px] uppercase font-bold text-neutral-400">Email</p>
                  <p className="font-semibold text-antracita break-all">{order.userEmail}</p>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <svg className="w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div className="space-y-0.5">
                  <p className="text-[9px] uppercase font-bold text-neutral-400">Teléfono</p>
                  <p className="font-semibold text-antracita">{order.shippingInfo.phone || 'No almacenado'}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Card de Envío */}
          <section className="bg-white border border-neutral-200/80 rounded-2xl p-6 space-y-4 shadow-sm text-xs">
            <div className="flex items-center space-x-2 text-[#325B42] font-title font-bold text-sm">
              <img src="/assets/Icon (3).svg" className="w-4 h-4 object-contain" alt="" />
              <span>Envío</span>
            </div>

            <div className="space-y-1">
              <p className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider">Dirección de Entrega</p>
              <p className="font-bold text-antracita leading-relaxed mt-1">
                {order.shippingInfo.address
                  ? `${order.shippingInfo.address}, ${order.shippingInfo.city} (${order.shippingInfo.zipCode}), ${order.shippingInfo.country || 'Argentina'}`
                  : 'No almacenada por el backend'}
              </p>
            </div>

            <div className="space-y-1 pt-1.5">
              <p className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider">Tiempo Estimado</p>
              <p className="font-bold text-antracita mt-1 flex items-center space-x-1.5">
                <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>2-3 Días Hábiles</span>
              </p>
            </div>
          </section>

          {/* Card de Actividad */}
          <section className="bg-white border border-neutral-200/80 rounded-2xl p-6 space-y-4 shadow-sm text-xs">
            <div className="flex items-center space-x-2 text-[#325B42] font-title font-bold text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Actividad</span>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
              {getTimelineEvents().map((event, idx) => (
                <div key={idx} className="relative">
                  <span className={`absolute -left-[22px] top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm ${event.color}`}></span>
                  <p className={`font-bold ${event.active ? 'text-antracita font-semibold' : 'text-neutral-400 font-normal'}`}>{event.title}</p>
                  <p className="text-[10px] text-neutral-450 font-semibold mt-0.5">{event.time}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default AdminOrderDetail;
