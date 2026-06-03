// Sidebar del panel de administración
// Muestra los links de navegación del admin, el usuario activo y las opciones de sesión.
// En desktop se ve como una columna lateral; en mobile se convierte en una barra horizontal arriba.
import { NavLink, Link } from 'react-router-dom';

function AdminSidebar({ user, logout }) {
  return (
    <aside className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-neutral-200 flex flex-col flex-shrink-0 lg:min-h-screen text-antracita">

      {/* Encabezado del panel — nombre de la tienda y rol */}
      <div className="p-6 border-b border-neutral-200 flex flex-col space-y-1">
        <h2 className="text-base font-bold text-antracita uppercase tracking-wider font-title">Panel Mundialista</h2>
        <span className="text-[10px] text-neutral-450 font-bold uppercase tracking-wider">Administrador</span>
      </div>

      {/* Links de navegación del panel admin */}
      <nav className="flex-grow p-4 space-y-2" aria-label="Navegación del Administrador">

        {/* Link a Ventas — resaltado cuando es la ruta activa */}
        <NavLink
          to="/admin/sales"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-3.5 py-3 rounded-lg text-xs font-bold tracking-wide uppercase transition-all ${
              isActive
                ? 'bg-primary text-white shadow-sm'
                : 'text-neutral-500 hover:bg-neutral-100 hover:text-antracita'
            }`
          }
        >
          {/* Ícono de gráfico de barras */}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span>Ventas</span>
        </NavLink>

        {/* Link a Inventario */}
        <NavLink
          to="/admin/inventory"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-3.5 py-3 rounded-lg text-xs font-bold tracking-wide uppercase transition-all ${
              isActive
                ? 'bg-primary text-white shadow-sm'
                : 'text-neutral-500 hover:bg-neutral-100 hover:text-antracita'
            }`
          }
        >
          {/* Ícono de caja/paquete */}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span>Inventario</span>
        </NavLink>

        {/* Link a Clientes (agregar usuarios) */}
        <NavLink
          to="/admin/users/add"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-3.5 py-3 rounded-lg text-xs font-bold tracking-wide uppercase transition-all ${
              isActive
                ? 'bg-primary text-white shadow-sm'
                : 'text-neutral-500 hover:bg-neutral-100 hover:text-antracita'
            }`
          }
        >
          {/* Ícono de persona con signo + */}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Clientes</span>
        </NavLink>
      </nav>

      {/* Parte inferior del sidebar: info del usuario logueado y botones de sesión */}
      <div className="p-4 border-t border-neutral-200 space-y-3.5 bg-neutral-50">
        {/* Avatar (inicial del nombre) + nombre y email del admin */}
        <div className="flex items-center space-x-3 px-2">
          {/* Avatar generado con la primera letra del nombre */}
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs font-title">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-antracita truncate font-title">{user.name}</p>
            <p className="text-[10px] text-neutral-450 truncate font-semibold">{user.email}</p>
          </div>
        </div>

        {/* Botones de acción rápida */}
        <div className="flex flex-col space-y-2">
          {/* Volver a la tienda pública */}
          <Link
            to="/"
            className="w-full text-center text-[10px] font-bold uppercase tracking-wider py-2 px-3 bg-white border border-neutral-350/80 hover:bg-neutral-100 text-antracita rounded-lg transition-colors shadow-sm"
          >
            Volver a la Tienda
          </Link>
          {/* Cerrar sesión */}
          <button
            onClick={logout}
            className="w-full text-center text-[10px] font-bold uppercase tracking-wider py-2 px-3 text-red-650 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </aside>
  );
}

export default AdminSidebar;
