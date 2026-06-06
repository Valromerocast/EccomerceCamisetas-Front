// Tarjeta de producto individual
// Se usa tanto en el Home (productos destacados) como en el catálogo general.
// Muestra la imagen, nombre, precio, selector de talle y botón de agregar al carrito.
// Si el usuario logueado es admin, los controles de compra se ocultan porque no puede comprar.
import { useState } from 'react';
import { Link } from 'react-router-dom';

function ProductCard({ product, addToCart, isFavorite = false, toggleFavorite }) {
  // Leo el usuario directamente del localStorage para saber si es admin sin necesitar prop extra
  const storedUser = localStorage.getItem('camisetas_user') ? JSON.parse(localStorage.getItem('camisetas_user')) : null;
  const isAdmin = storedUser && storedUser.role === 'admin';

  // Talle seleccionado: el usuario puede elegir antes de agregar al carrito desde la card
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'M');

  // Calcular stock total sumando todos los talles (si es objeto) o usando el valor directo
  const totalStock = typeof product.stock === 'object' && product.stock !== null
    ? Object.values(product.stock).reduce((sum, qty) => sum + (parseInt(qty, 10) || 0), 0)
    : parseInt(product.stock, 10) || 0;

  // Agrega 1 unidad del producto con el talle seleccionado
  const handleQuickAdd = (e) => {
    e.preventDefault();       // evito que el link padre navegue
    e.stopPropagation();      // evito que el evento suba al contenedor
    const sizeStock = typeof product.stock === 'object' && product.stock !== null
      ? (parseInt(product.stock[selectedSize], 10) || 0)
      : parseInt(product.stock, 10) || 0;

    if (sizeStock > 0) {
      const success = addToCart(product, 1, selectedSize);
      if (success) {
        alert(`¡"${product.name}" (${selectedSize}) agregada al carrito!`);
      }
    } else {
      alert(`No hay stock disponible para el talle ${selectedSize}.`);
    }
  };

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (toggleFavorite) {
      toggleFavorite(product.id);
    }
  };

  // Si la imagen principal falla, muestro la imagen de fallback del producto o una genérica
  const handleImageError = (e) => {
    e.target.src = product.fallbackImage || "/assets/success.svg";
  };

  return (
    <article className="group bg-white border border-neutral-200/80 rounded-xl overflow-hidden shadow-sm hover:shadow-primary/5 hover:border-neutral-350 transition-all duration-350 flex flex-col h-full relative">

      {/* Botón de favoritos (corazón) */}
      {toggleFavorite && (
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/85 hover:bg-white text-neutral-450 hover:text-red-500 transition-all duration-200 cursor-pointer shadow-sm hover:shadow focus:outline-none backdrop-blur-xs"
          aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill={isFavorite ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className={`w-4.5 h-4.5 transition-transform duration-200 hover:scale-110 ${
              isFavorite ? 'text-red-500 fill-red-500 stroke-red-500' : 'text-neutral-500 hover:text-red-500'
            }`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
        </button>
      )}

      {/* Imagen del producto — el link lleva al detalle completo */}
      <Link to={`/product/${product.id}`} className="block relative overflow-hidden aspect-[4/5] bg-neutral-100">
        <img
          src={product.image}
          alt={`Fotografía de la camiseta ${product.name}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"   // carga diferida para mejorar el rendimiento inicial
          onError={handleImageError}
        />

        {/* Badge de agotado: se muestra cuando el stock llega a 0 */}
        {totalStock === 0 && (
          <span className="absolute top-3 left-3 bg-red-600 text-white text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">
            Agotado
          </span>
        )}

        {/* Badge de últimas unidades: aviso cuando quedan 10 o menos */}
        {totalStock > 0 && totalStock <= 10 && (
          <span className="absolute top-3 left-3 bg-amber-600 text-white text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">
            Últimas {totalStock}
          </span>
        )}

        {/* Badge personalizado del producto (por ejemplo: "NUEVO", "OFERTA", etc.) */}
        {product.badge && (
          <span className="absolute top-3 left-3 bg-primary text-white text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded shadow-sm font-title">
            {product.badge}
          </span>
        )}
      </Link>

      {/* Información del producto */}
      <div className="p-5 flex flex-col flex-grow text-antracita">

        {/* Subtítulo/categoría en texto pequeño */}
        <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-450">
          {product.subtitle || `${product.category} — KIT`}
        </span>

        {/* Nombre del producto — también es un link al detalle */}
        <h3 className="text-xl font-extrabold text-[#325B42] hover:text-[#284935] transition-colors mt-1 font-title">
          <Link to={`/product/${product.id}`}>
            {product.name}
          </Link>
        </h3>

        {/* Precio */}
        <p className="text-base font-bold text-antracita mt-2">
          ${product.price.toFixed(2)}
        </p>

        {/* Selector de talle — solo para usuarios normales, no para el admin */}
        {!isAdmin && (
          <div className="flex gap-2 mt-4" aria-label="Selección de talle">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedSize(size);   // actualizo el talle seleccionado
                }}
                className={`w-9 h-9 flex items-center justify-center text-xs font-bold rounded-lg border transition-all cursor-pointer ${selectedSize === size
                    ? 'bg-[#325B42] border-[#325B42] text-white shadow-sm'   // talle activo
                    : 'bg-white border-neutral-200 text-antracita hover:border-neutral-350'
                  }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}

        {/* Botón de compra rápida — también oculto para el admin */}
        {!isAdmin && (
          <button
            onClick={handleQuickAdd}
            disabled={totalStock === 0}
            className={`w-full text-center font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-lg shadow-sm transition-all duration-200 mt-5 cursor-pointer ${totalStock === 0
                ? 'bg-neutral-100 border border-neutral-200 text-neutral-400 cursor-not-allowed shadow-none'
                : 'bg-[#325B42] hover:bg-[#284935] text-white hover:shadow-md'
              }`}
          >
            {totalStock === 0 ? 'Agotado' : 'AGREGAR AL CARRITO'}
          </button>
        )}
      </div>
    </article>
  );
}

export default ProductCard;
