// Vista principal (Home) de la tienda
// Tiene tres secciones: hero banner, beneficios y productos destacados.
// Los productos destacados son los que tienen featured: true en el array de productos.
import { Link } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';

function Home({ products = [], productsLoading = false, productsError = '', addToCart, favorites = [], toggleFavorite }) {
  // Tomo solo los primeros 3 productos marcados como "destacados" para la sección de la home
  const featuredProducts = products.filter((p) => p.featured).slice(0, 3);

  return (
    <div className="space-y-16 pb-20 bg-cream">
      {/* ── Hero Banner ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f0ece3]/80 to-cream py-20 border-b border-neutral-250/30">
        {/* Gradiente radial decorativo en la esquina superior derecha */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(74,116,89,0.06),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Columna izquierda: texto y botones de acción */}
            <div className="space-y-6 text-center lg:text-left">
              {/* Etiqueta de colección actual */}
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-inset ring-primary/20">
                Colección Selección Nacional 2026
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-antracita leading-tight font-title">
                Vive la pasión <br />
                <span className="text-primary">
                  del fútbol
                </span>
              </h1>
              <p className="text-sm sm:text-base text-antracita/75 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Descubre nuestra colección exclusiva de camisetas de fútbol titulares y suplentes de las principales selecciones mundiales. Calidad textil premium e hilos reforzados.
              </p>
              {/* Botones CTA: ir al catálogo o pedir ayuda */}
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <Link
                  to="/catalog"
                  className="bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider py-3 px-8 rounded-lg shadow-md hover:shadow-primary/20 transition-all duration-200 cursor-pointer"
                >
                  Explorar Catálogo
                </Link>
                <Link
                  to="/contact"
                  className="bg-white border border-neutral-300 hover:bg-neutral-50 text-antracita font-bold text-xs uppercase tracking-wider py-3 px-8 rounded-lg transition-all duration-200 cursor-pointer shadow-sm"
                >
                  Soporte & Ayuda
                </Link>
              </div>
            </div>

            {/* Columna derecha: imagen destacada del hero con overlay de texto */}
            <div className="relative mx-auto lg:ml-auto max-w-md w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-xl border border-neutral-250/70 group bg-neutral-100">
              <img
                src="/assets/hero-left.svg"
                alt="Banner publicitario que muestra una camiseta blanca de fútbol colgada sobre fondo minimalista"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              {/* Overlay con texto de marketing sobre la imagen */}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-neutral-950/20 to-transparent flex items-end p-6">
                <div className="text-white">
                  <p className="text-[10px] font-bold text-primary tracking-widest uppercase">Tejido Aeroready / Dri-Fit</p>
                  <p className="text-base font-bold font-title mt-1">Confeccionadas con tecnología de alto rendimiento.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Beneficios ────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* Beneficio 1: material técnico */}
          <article className="bg-white border border-neutral-200/80 p-6 rounded-xl flex items-start space-x-4 shadow-sm">
            <div className="bg-primary/10 p-2.5 rounded-lg text-primary">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-antracita font-title">Tejido de Alto Rendimiento</h3>
              <p className="text-xs text-antracita/65 mt-1.5 leading-relaxed">
                Nuestras prendas cuentan con tejidos micro-perforados ligeros y transpirables para brindar máximo confort.
              </p>
            </div>
          </article>

          {/* Beneficio 2: envío gratis */}
          <article className="bg-white border border-neutral-200/80 p-6 rounded-xl flex items-start space-x-4 shadow-sm">
            <div className="bg-primary/10 p-2.5 rounded-lg text-primary">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-antracita font-title">Envíos Gratis en todas tus compras</h3>
              <p className="text-xs text-antracita/65 mt-1.5 leading-relaxed">
                El envío es totalmente gratuito en todas tus compras, sin mínimo de compra.
              </p>
            </div>
          </article>

          {/* Beneficio 3: garantía de calidad */}
          <article className="bg-white border border-neutral-200/80 p-6 rounded-xl flex items-start space-x-4 shadow-sm">
            <div className="bg-primary/10 p-2.5 rounded-lg text-primary">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-antracita font-title">Garantía de Calidad Mundial</h3>
              <p className="text-xs text-antracita/65 mt-1.5 leading-relaxed">
                Escudos bordados y estampas de alta resistencia. Lavables en lavadoras comunes sin desgaste.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* ── Productos Destacados ──────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-antracita font-title">Camisetas Destacadas</h2>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
            Los mantos sagrados más aclamados por coleccionistas e hinchas.
          </p>
        </div>

        {(productsLoading || productsError) && (
          <div className={`border rounded-lg px-4 py-3 text-sm font-semibold ${
            productsError
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-white border-neutral-200 text-neutral-500'
          }`}>
            {productsError || 'Cargando catalogo desde el backend...'}
          </div>
        )}

        {/* Grilla de 3 productos featured */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              addToCart={addToCart}
              isFavorite={favorites.includes(p.id)}
              toggleFavorite={toggleFavorite}
            />
          ))}
        </div>

        {/* Link para ver el catálogo completo */}
        <div className="text-center pt-6">
          <Link
            to="/catalog"
            className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 font-bold text-sm transition-colors cursor-pointer"
          >
            <span>Ver toda la colección</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
