// Vista del perfil del usuario
// Muestra los datos de la cuenta y el historial de pedidos del usuario logueado.
// Si no hay sesión activa, redirige al login.
import { Navigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectEnrichedOrders, selectUser } from '../store/selectors';
import { logout } from '../store/slices/authSlice';

function Profile() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const orders = useSelector(selectEnrichedOrders);
  const ordersLoading = useSelector((state) => state.orders.loading);
  const ordersError = useSelector((state) => state.orders.error);
  // Si no hay usuario logueado, lo mando al login sin importar qué
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Filtro solo las órdenes que pertenecen al usuario actual (por email)
  const userOrders = orders.filter((o) => o.userEmail === user.email);

  // Devuelve las clases de color según el estado del pedido para los badges
  const getStatusColor = (status) => {
    switch (status) {
      case 'Procesando':
        return 'bg-blue-50 text-blue-700 border-blue-200';    // azul = en proceso
      case 'Enviado':
        return 'bg-amber-50 text-amber-700 border-amber-200'; // naranja = en camino
      case 'Entregado':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'; // verde = entregado
      case 'Cancelado':
        return 'bg-red-50 text-red-750 border-red-200';       // rojo = cancelado
      default:
        return 'bg-neutral-50 text-neutral-600 border-neutral-200';
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* Encabezado del perfil con botón de cerrar sesión */}
      <header className="border-b border-neutral-300 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-antracita font-title">Mi Perfil</h1>
          <p className="text-xs text-neutral-500 mt-1">Administra tus datos personales e historial de compras.</p>
        </div>
        {/* Botón de logout: cambia de color al hacer hover para indicar que es una acción destructiva */}
        <button
          onClick={() => dispatch(logout())}
          className="bg-white border border-neutral-300 hover:border-red-500 hover:text-red-500 text-xs font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer shadow-sm"
        >
          Cerrar Sesión
        </button>
      </header>

        {/* Grilla de 3 columnas: datos del usuario a la izquierda, pedidos a la derecha */}
        <div className={`grid grid-cols-1 gap-8 ${user.role !== 'admin' ? 'lg:grid-cols-3' : ''}`}>

        {/* Columna izquierda: tarjeta con datos personales */}
        <section className="lg:col-span-1 bg-white border border-neutral-200/80 rounded-2xl p-6 space-y-6 shadow-sm">
          {/* Avatar con la inicial del nombre + nombre y rol */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg font-title">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-bold text-antracita font-title">{user.name}</h2>
              <span className="inline-block text-[9px] font-bold text-primary uppercase tracking-wide bg-primary/10 border border-primary/20 px-2 py-0.5 rounded mt-1">
                Cliente {user.role === 'admin' && ' / Admin'}
              </span>
            </div>
          </div>

          <hr className="border-neutral-200" />

          {/* Información de la cuenta */}
          <div className="space-y-4 text-xs">
            <div>
              <p className="text-neutral-500 uppercase font-bold tracking-wide">Correo Electrónico</p>
              <p className="text-antracita mt-1 font-semibold">{user.email}</p>
            </div>
            <div>
              <p className="text-neutral-500 uppercase font-bold tracking-wide">Tipo de Cuenta</p>
              <p className="text-antracita mt-1 font-semibold capitalize">{user.role}</p>
            </div>
          </div>
        </section>

        {/* Columna derecha: historial de pedidos */}
        {user.role !== 'admin' && (
          <section className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-bold text-antracita font-title">Historial de Pedidos</h2>

            {ordersError && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3.5 rounded-lg text-xs font-bold">
                {ordersError}
              </div>
            )}

            {ordersLoading ? (
              <p className="text-sm text-neutral-500">Cargando pedidos...</p>
            ) : userOrders.length === 0 ? (
              /* Estado vacío: el usuario no ha comprado nada todavía */
              <div className="text-center py-16 bg-white border border-neutral-200/80 rounded-2xl p-6 flex flex-col items-center justify-center space-y-4 shadow-sm">
                <div className="text-neutral-400">
                  <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-sm text-neutral-500">No has realizado ninguna compra todavía.</p>
                <Link
                  to="/catalog"
                  className="bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg transition-colors cursor-pointer"
                >
                  Hacer mi primera compra
                </Link>
              </div>
            ) : (
              /* Lista de pedidos del usuario */
              <div className="space-y-4">
                {userOrders.map((order) => (
                  <article
                    key={order.id}
                    className="bg-white border border-neutral-200/80 rounded-xl p-5 space-y-4 hover:border-neutral-300 transition-colors shadow-sm"
                  >
                    {/* Encabezado del pedido: ID, fecha y badge de estado */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex items-center space-x-3.5">
                        <span className="font-mono font-bold text-primary text-sm">{order.id}</span>
                        <span className="text-xs text-neutral-500">{order.date} a las {order.time}</span>
                      </div>
                      {/* Badge de color según el estado del pedido */}
                      <span className={`text-[10px] font-bold border px-2.5 py-0.5 rounded-full capitalize ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>

                    {/* Lista de artículos del pedido con nombre, talle y precio */}
                    <div className="border-t border-b border-neutral-100 py-3 text-xs space-y-1.5 text-neutral-500">
                      {order.items.map((item) => (
                        <div key={item.cartKey} className="flex justify-between">
                          <span>
                            {item.product.name} ({item.size}) <strong className="text-neutral-450">x{item.quantity}</strong>
                          </span>
                          <span className="text-antracita font-semibold">${item.subtotal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Pie del pedido: dirección de entrega y total */}
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-500">
                        {order.shippingInfo.address
                          ? <>Entrega: <strong className="text-antracita font-medium">{order.shippingInfo.address}, {order.shippingInfo.city}</strong></>
                          : 'Dirección no almacenada por el backend'}
                      </span>
                      <span className="font-bold text-antracita text-sm">
                        Total: ${order.total.toFixed(2)}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

export default Profile;
