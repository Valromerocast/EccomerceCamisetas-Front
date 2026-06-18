// Layout del panel de administración
// Envuelve todas las rutas /admin/* con la estructura de sidebar + contenido principal.
// Tiene una guarda de ruta: si el usuario no existe o no es admin, redirige al login.
import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';

function AdminLayout({ user, logout }) {
  // Doble verificación de seguridad: el usuario debe existir Y tener rol 'admin'
  // Aunque App.jsx ya protege las rutas admin, esta guarda es una capa extra de seguridad
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen lg:overflow-hidden bg-cream text-antracita font-sans antialiased">
      {/* Barra lateral con navegación del admin */}
      <AdminSidebar user={user} logout={logout} />

      {/* Contenido principal del panel — renderiza la vista admin activa con Outlet */}
      <main className="flex-grow min-w-0 p-6 lg:p-10 w-full lg:h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
