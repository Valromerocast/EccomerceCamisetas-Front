// Vista del panel de ventas del administrador
// Muestra métricas clave (ingresos totales, pedidos pendientes, en camino y tasa de entrega)
// y la tabla de todos los pedidos con filtrado por estado.
import { useState } from 'react';
import { Link } from 'react-router-dom';

function AdminSales({ orders = [], ordersLoading = false, ordersError = '' }) {
  // Estado del filtro de tabs: por defecto muestra todos los pedidos
  const [statusFilter, setStatusFilter] = useState('Todos');

  // ─── Cálculo de métricas ──────────────────────────────────────────────────
  // Suma el total de todas las órdenes para obtener los ingresos acumulados
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  // Cuenta pedidos en estado "Procesando" (pendientes de despachar)
  const pendingOrders = orders.filter((o) => o.status === 'Procesando').length;

  // Cuenta pedidos en estado "Enviado" (ya despachados, en tránsito)
  const shippingOrders = orders.filter((o) => o.status === 'Enviado').length;

  // Cuenta pedidos entregados exitosamente
  const deliveredOrders = orders.filter((o) => o.status === 'Entregado').length;

  // Tasa de entrega = pedidos entregados / total de pedidos × 100
  // Si no hay pedidos, muestro 100% como valor por defecto
  const deliveryRate = orders.length > 0
    ? ((deliveredOrders / orders.length) * 100).toFixed(1) + '%'
    : '100.0%';

  // Filtrado de pedidos según la pestaña seleccionada
  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'Todos') return true;
    return o.status === statusFilter;
  });

  // Colores del badge de estado según el valor
  const getStatusColor = (status) => {
    switch (status) {
      case 'Procesando':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Enviado':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Entregado':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cancelado':
        return 'bg-red-50 text-red-750 border-red-200';
      default:
        return 'bg-neutral-50 text-neutral-600 border-neutral-200';
    }
  };

  return (
    <div className="space-y-8 text-antracita">

      {/* Encabezado del panel de ventas */}
      <header className="border-b border-neutral-200 pb-5">
        <h1 className="text-2xl font-extrabold text-antracita font-title">Gestión de Ventas</h1>
        <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mt-1">Monitorea los ingresos generados y administra el estado de los pedidos recibidos.</p>
      </header>

      {/* ─── Tarjetas de métricas ─────────────────────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" aria-label="Tarjetas de rendimiento comercial">

        {/* Métrica 1: Ventas totales acumuladas */}
        <article className="bg-white border border-neutral-200 p-5 rounded-xl space-y-1.5 shadow-sm">
          <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Ventas Hoy</span>
          <strong className="text-2xl font-black text-primary font-title block">${totalRevenue.toFixed(2)}</strong>
          <span className="text-[9px] text-neutral-450 block font-semibold">Total acumulado</span>
        </article>

        {/* Métrica 2: Pedidos pendientes de atención */}
        <article className="bg-white border border-neutral-200 p-5 rounded-xl space-y-1.5 shadow-sm">
          <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Pedidos Pendientes</span>
          <strong className="text-2xl font-black text-antracita font-title block">{pendingOrders}</strong>
          <span className="text-[9px] text-neutral-450 block font-semibold">⚠️ Requieren atención</span>
        </article>

        {/* Métrica 3: Pedidos en tránsito */}
        <article className="bg-white border border-neutral-200 p-5 rounded-xl space-y-1.5 shadow-sm">
          <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">En camino</span>
          <strong className="text-2xl font-black text-antracita font-title block">{shippingOrders}</strong>
          <span className="text-[9px] text-neutral-450 block font-semibold">🚚 En tránsito</span>
        </article>

        {/* Métrica 4: Tasa de entrega — tarjeta destacada en verde */}
        <article className="bg-primary text-white p-5 rounded-xl space-y-1.5 shadow-md">
          <span className="text-[9px] text-white/80 font-bold uppercase tracking-wider block">Tasa de entrega</span>
          <strong className="text-2xl font-black font-title block">{deliveryRate}</strong>
          <span className="text-[9px] text-white/80 block font-semibold">Nivel Premium</span>
        </article>
      </section>

      {/* ─── Tabla de pedidos ─────────────────────────────────────────────── */}
      <section className="space-y-4">

        {ordersError && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3.5 rounded-lg text-xs font-bold">
            {ordersError}
          </div>
        )}

        {/* Tabs de filtrado por estado — cada botón activa un filtro diferente */}
        <div className="flex flex-wrap gap-2 border-b border-neutral-200 pb-2">
          {['Todos', 'Procesando', 'Enviado', 'Entregado', 'Cancelado'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                statusFilter === status
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white border-neutral-200 text-neutral-500 hover:text-antracita hover:border-neutral-350'
              }`}
            >
              {/* Renombro "Procesando" a "Pendiente" para que sea más claro en el tab */}
              {status === 'Procesando' ? 'Pendiente' : status}
            </button>
          ))}
        </div>

        {/* Si no hay pedidos con el filtro activo, muestro un mensaje */}
        {ordersLoading ? (
          <div className="text-center py-16 bg-white border border-neutral-200 rounded-xl shadow-sm">
            <p className="text-sm text-neutral-500">Cargando pedidos...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-white border border-neutral-200 rounded-xl shadow-sm">
            <p className="text-sm text-neutral-500">No se encontraron pedidos con el estado seleccionado.</p>
          </div>
        ) : (
          /* Tabla de pedidos */
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-450 font-bold uppercase tracking-wider">
                    <th className="p-4">ID Pedido</th>
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Fecha</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Estado de envío</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200/60">
                  {filteredOrders.map((order) => {
                    return (
                      <tr key={order.id} className="hover:bg-neutral-50/50 text-neutral-600 transition-colors">
                        {/* ID en formato legible (MS- en vez de ORD-) */}
                        <td className="p-4 font-mono font-bold text-primary">#{order.id.replace('ORD-', 'MS-')}</td>
                        <td className="p-4">
                          <p className="font-bold text-antracita font-title">{order.userName}</p>
                          <p className="text-[10px] text-neutral-450 mt-0.5">{order.userEmail}</p>
                        </td>
                        <td className="p-4 font-semibold">{order.date}</td>
                        <td className="p-4 font-extrabold text-antracita">${order.total.toFixed(2)}</td>
                        <td className="p-4">
                          {/* Badge de color según estado */}
                          <span className={`inline-block text-[9px] font-bold px-2 py-0.5 border rounded-full capitalize ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {/* Link al detalle completo del pedido */}
                          <Link
                            to={`/admin/orders/${order.id}`}
                            className="bg-white border border-neutral-350 hover:bg-neutral-50 text-antracita font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer inline-block uppercase text-[9px] tracking-wider"
                          >
                            Ver Detalles
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminSales;
