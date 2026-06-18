// Barra de navegación fija (sticky) de la tienda
// Manejo el estado del menú mobile, el buscador y el logout desde acá
import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';

function Navbar({ user, cartCount, favoriteCount = 0, logout }) {
  // Control del menú hamburguesa en pantallas chicas
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // El texto que el usuario escribe en el campo de búsqueda
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const isBuyer = user?.role === 'user';
  const canUseShoppingFeatures = !user || isBuyer;
  const isFavoritesView = location.pathname === '/catalog'
    && new URLSearchParams(location.search).get('category') === 'favoritos';
  const isCatalogView = location.pathname === '/catalog' && !isFavoritesView;

  // Cuando el usuario aprieta Enter o el botón de búsqueda, lo mando al catálogo con el parámetro q=
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');          // limpio el campo tras buscar
      setMobileMenuOpen(false);    // cierro el menú mobile si estaba abierto
    }
  };

  // Llamo a la función de logout del App y redirijo al inicio
  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/90 border-b border-neutral-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-16" aria-label="Navegación Principal">

          {/* Logo de la tienda — siempre lleva al inicio */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-xl font-bold tracking-tight text-primary font-title">
              Mundialista <span className="text-antracita">Store</span>
            </Link>
          </div>

          {/* Links de navegación principal — solo visibles en desktop (md en adelante) */}
          <div className="hidden md:flex space-x-8 items-center">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-xs font-bold uppercase tracking-wider transition-colors duration-200 ${
                  isActive ? 'text-primary' : 'text-antracita/70 hover:text-primary'
                }`
              }
            >
              Inicio
            </NavLink>
            <Link
              to="/catalog"
              className={`text-xs font-bold uppercase tracking-wider transition-colors duration-200 ${
                isCatalogView ? 'text-primary' : 'text-antracita/70 hover:text-primary'
              }`}
            >
              Camisetas
            </Link>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `text-xs font-bold uppercase tracking-wider transition-colors duration-200 ${
                  isActive ? 'text-primary' : 'text-antracita/70 hover:text-primary'
                }`
              }
            >
              Ayuda
            </NavLink>
            {isBuyer && (
              <Link
                to="/catalog?category=favoritos"
                className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors duration-200 ${
                  isFavoritesView ? 'text-primary' : 'text-antracita/70 hover:text-primary'
                }`}
              >
                <span>Favoritos</span>
                {favoriteCount > 0 && (
                  <span className="rounded-full bg-primary px-1.5 py-0.5 text-[9px] leading-none text-white">
                    {favoriteCount}
                  </span>
                )}
              </Link>
            )}
          </div>

          {/* Buscador + íconos de perfil y carrito — solo en desktop */}
          <div className="hidden md:flex items-center space-x-6">

            {/* Buscador con animación de expansión al hacer foco */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="search"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-44 bg-neutral-100 text-antracita text-xs rounded-full py-1.5 pl-4 pr-8 border border-neutral-200/80 focus:outline-none focus:border-primary focus:w-56 transition-all duration-300"
              />
              <button
                type="submit"
                aria-label="Buscar"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-450 hover:text-primary"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>

            {/* Ícono de perfil: si hay sesión activa muestra el link al perfil;
                si no, lleva al login. El admin además ve un botón extra para ir al panel */}
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Botón de acceso rápido al panel admin — solo para administradores */}
                {user.role === 'admin' && (
                  <Link
                    to="/admin/sales"
                    className="bg-primary hover:bg-primary/90 text-white text-[11px] font-bold uppercase tracking-wider py-1.5 px-3.5 rounded-lg shadow-sm transition-all duration-200"
                  >
                    Panel Admin
                  </Link>
                )}
                <Link to="/profile" className="relative p-1.5 text-antracita/75 hover:text-primary transition-colors duration-200 flex items-center justify-center" aria-label="Mi Perfil">
                  <img src="/assets/user-icon.svg" alt="Mi Perfil" className="w-8 h-8 object-contain" />
                </Link>
              </div>
            ) : (
              <Link
                to="/login"
                className="relative p-1.5 text-antracita/75 hover:text-primary transition-colors duration-200 flex items-center justify-center"
                aria-label="Iniciar Sesión"
              >
                <img src="/assets/user-icon.svg" alt="Iniciar Sesión" className="w-8 h-8 object-contain" />
              </Link>
            )}

            {/* Ícono del carrito con badge de cantidad — se oculta para el admin porque no tiene carrito */}
            {canUseShoppingFeatures && (
              <Link to="/cart" className="relative p-1.5 text-antracita/75 hover:text-primary transition-colors duration-200 flex items-center justify-center" aria-label="Carrito de compras">
                <img src="/assets/cart.svg" alt="Carrito de compras" className="w-5 h-5 object-contain" />
                {/* Badge rojo con el número de artículos — solo aparece si hay algo en el carrito */}
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center shadow-sm">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
          </div>

          {/* Controles del menú mobile: carrito + botón hamburguesa */}
          <div className="md:hidden flex items-center space-x-4">
            {canUseShoppingFeatures && (
              <Link to="/cart" className="relative p-1.5 text-antracita/75 hover:text-primary transition-colors" aria-label="Carrito de compras">
                <img src="/assets/cart.svg" alt="Carrito de compras" className="w-6 h-6 object-contain inline-block" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Botón que alterna entre el ícono de menú (☰) y el de cerrar (✕) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-antracita/70 hover:text-primary focus:outline-none"
              aria-expanded={mobileMenuOpen}
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? (
                // Ícono X para cerrar el menú
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                // Ícono hamburguesa para abrir el menú
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </nav>
      </div>

      {/* Menú desplegable para mobile — solo se renderiza cuando mobileMenuOpen es true */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-neutral-200 px-4 pt-2 pb-6 space-y-4 shadow-inner">

          {/* Buscador mobile */}
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="search"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-100 text-antracita text-sm rounded-lg py-2 pl-4 pr-10 border border-neutral-200 focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-450 hover:text-primary"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          {/* Links de navegación mobile — al hacer click también cierran el menú */}
          <div className="flex flex-col space-y-3">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-antracita/80 hover:text-primary text-sm font-bold uppercase tracking-wider py-1.5 border-b border-neutral-100"
            >
              Inicio
            </Link>
            <Link
              to="/catalog"
              onClick={() => setMobileMenuOpen(false)}
              className="text-antracita/80 hover:text-primary text-sm font-bold uppercase tracking-wider py-1.5 border-b border-neutral-100"
            >
              Camisetas
            </Link>
            {isBuyer && (
              <Link
                to="/catalog?category=favoritos"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between py-1.5 text-sm font-bold uppercase tracking-wider border-b border-neutral-100 ${
                  isFavoritesView ? 'text-primary' : 'text-antracita/80 hover:text-primary'
                }`}
              >
                <span>Favoritos</span>
                {favoriteCount > 0 && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] text-white">
                    {favoriteCount}
                  </span>
                )}
              </Link>
            )}
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-antracita/80 hover:text-primary text-sm font-bold uppercase tracking-wider py-1.5 border-b border-neutral-100"
            >
              Ayuda
            </Link>
          </div>

          {/* Sección de sesión en mobile: muestra opciones según si el usuario está logueado o no */}
          <div className="pt-2 flex flex-col space-y-3">
            {user ? (
              <>
                {/* Botón al panel admin solo para administradores */}
                {user.role === 'admin' && (
                  <Link
                    to="/admin/sales"
                    onClick={() => setMobileMenuOpen(false)}
                    className="bg-primary text-white text-center text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg shadow-sm"
                  >
                    Panel Admin
                  </Link>
                )}
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-antracita/80 text-xs font-bold uppercase tracking-wider py-2.5 bg-neutral-100 rounded-lg border border-neutral-200"
                >
                  Mi Perfil
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-center text-red-500 hover:text-red-600 text-xs font-bold uppercase tracking-wider py-2.5"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="bg-primary text-white text-center text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
