// Layout principal de la tienda
// Este componente envuelve todas las páginas públicas: pone la Navbar arriba, el Footer abajo,
// y en el medio renderiza la vista que corresponda al URL actual (via Outlet de react-router)
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useDispatch, useSelector } from 'react-redux';
import { selectCartCount, selectFavorites, selectUser } from '../../store/selectors';
import { logout } from '../../store/slices/authSlice';

function Layout() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const cartCount = useSelector(selectCartCount);
  const favoriteCount = useSelector(selectFavorites).length;
  return (
    <div className="flex flex-col min-h-screen bg-cream text-antracita font-sans antialiased selection:bg-primary selection:text-white">
      {/* Barra de navegación fija arriba */}
      <Navbar
        user={user}
        cartCount={cartCount}
        favoriteCount={favoriteCount}
        logout={() => dispatch(logout())}
      />

      {/* Contenido de la página actual — el pt-16 compensa la altura de la Navbar fija */}
      <main className="flex-grow pt-16">
        <Outlet />
      </main>

      {/* Pie de página al final */}
      <Footer />
    </div>
  );
}

export default Layout;
