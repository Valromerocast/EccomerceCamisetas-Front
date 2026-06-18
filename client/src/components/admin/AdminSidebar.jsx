// Sidebar del panel de administración
// Muestra los links de navegación del admin, el usuario activo y las opciones de sesión.
// En desktop se ve como una columna lateral; en mobile se convierte en una barra horizontal arriba.
import { NavLink, Link } from 'react-router-dom';

function AdminSidebar({ user, logout }) {
  return (
    <aside className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-neutral-200 flex flex-col flex-shrink-0 text-antracita lg:h-screen lg:sticky lg:top-0 lg:overflow-hidden">

      {/* Encabezado del panel — nombre de la tienda y rol */}
      <header className="p-6 border-b border-neutral-200 flex flex-col space-y-1 shrink-0">
        <h2 className="text-base font-bold text-antracita uppercase tracking-wider font-title">Panel Mundialista</h2>
        <span className="text-[10px] text-neutral-450 font-bold uppercase tracking-wider">Administrador</span>
      </header>

      {/* Links de navegación del panel admin */}
      <nav className="flex-grow min-h-0 p-4 space-y-2 lg:overflow-y-auto" aria-label="Navegación del Administrador">

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
          {({ isActive }) => (
            <>
              <img
                src="/assets/Icon (1).svg"
                alt="Ventas"
                className="w-4 h-4 object-contain"
                style={{ filter: isActive ? 'brightness(0) invert(1)' : 'none' }}
              />
              <span>Ventas</span>
            </>
          )}
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
          {({ isActive }) => (
            <>
              <img
                src="/assets/Icon.svg"
                alt="Inventario"
                className="w-4 h-4 object-contain"
                style={{ filter: isActive ? 'brightness(0) invert(1)' : 'none' }}
              />
              <span>Inventario</span>
            </>
          )}
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
          {({ isActive }) => (
            <>
              <img
                src="/assets/Icon (2).svg"
                alt="Clientes"
                className="w-4 h-4 object-contain"
                style={{ filter: isActive ? 'brightness(0) invert(1)' : 'none' }}
              />
              <span>Clientes</span>
            </>
          )}
        </NavLink>
      </nav>

      {/* Parte inferior del sidebar: info del usuario logueado y botones de sesión */}
      <footer className="p-4 border-t border-neutral-200 space-y-3.5 bg-neutral-50 shrink-0">
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
      </footer>
    </aside>
  );
}

export default AdminSidebar;
