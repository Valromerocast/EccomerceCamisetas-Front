// Tarjeta de producto individual
// Se usa tanto en el Home (productos destacados) como en el catálogo general.
// Muestra la imagen, nombre, precio, selector de talle y botón de agregar al carrito.
// Si el usuario logueado es admin, los controles de compra se ocultan porque no puede comprar.
import { useState } from 'react';
import { Link } from 'react-router-dom';

function ProductCard({ product, addToCart }) {
  // Leo el usuario directamente del localStorage para saber si es admin sin necesitar prop extra
  const storedUser = localStorage.getItem('camisetas_user') ? JSON.parse(localStorage.getItem('camisetas_user')) : null;
  const isAdmin = storedUser && storedUser.role === 'admin';

  // Color por defecto: tomo el primero de la lista (no se puede cambiar desde la card, solo desde el detalle)
  const defaultColor = product.colors[0] || 'Negro';

  // Talle seleccionado: el usuario puede elegir antes de agregar al carrito desde la card
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'M');

  // Agrega 1 unidad del producto con el talle seleccionado y el color por defecto
  const handleQuickAdd = (e) => {
    e.preventDefault();       // evito que el link padre navegue
    e.stopPropagation();      // evito que el evento suba al contenedor
    if (product.stock > 0) {
      const success = addToCart(product, 1, selectedSize, defaultColor);
      if (success) {
        alert(`¡"${product.name}" (${selectedSize} - ${defaultColor}) agregada al carrito!`);
      }
    }
  };

  // Si la imagen principal falla, muestro la imagen de fallback del producto o una genérica
  const handleImageError = (e) => {
    e.target.src = product.fallbackImage || "/assets/success.svg";
  };

  return (
    <article className="group bg-white border border-neutral-200/80 rounded-xl overflow-hidden shadow-sm hover:shadow-primary/5 hover:border-neutral-350 transition-all duration-350 flex flex-col h-full">

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
        {product.stock === 0 && (
          <span className="absolute top-3 left-3 bg-red-600 text-white text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">
            Agotado
          </span>
        )}

        {/* Badge de últimas unidades: aviso cuando quedan 10 o menos */}
        {product.stock > 0 && product.stock <= 10 && (
          <span className="absolute top-3 left-3 bg-amber-600 text-white text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">
            Últimas {product.stock}
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
                className={`w-9 h-9 flex items-center justify-center text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  selectedSize === size
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
            disabled={product.stock === 0}
            className={`w-full text-center font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-lg shadow-sm transition-all duration-200 mt-5 cursor-pointer ${
              product.stock === 0
                ? 'bg-neutral-100 border border-neutral-200 text-neutral-400 cursor-not-allowed shadow-none'
                : 'bg-[#325B42] hover:bg-[#284935] text-white hover:shadow-md'
            }`}
          >
            {product.stock === 0 ? 'Agotado' : 'AGREGAR AL CARRITO'}
          </button>
        )}
      </div>
    </article>
  );
}

export default ProductCard;
