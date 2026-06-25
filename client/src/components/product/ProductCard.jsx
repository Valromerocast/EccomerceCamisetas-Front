// Tarjeta de producto individual
// Se usa tanto en el Home (productos destacados) como en el catálogo general.
// Muestra la imagen, nombre, precio, selector de talle y botón de agregar al carrito.
// Si el usuario logueado es admin, los controles de compra se ocultan porque no puede comprar.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import LoadingIndicator from '../ui/LoadingIndicator';
import { applyTeamCrestFallback } from '../../utils/teamCrest';
import { addToCart } from '../../store/slices/cartSlice';
import { toggleFavorite } from '../../store/slices/favoritesSlice';
import { showNotification } from '../../store/slices/notificationsSlice';

function ProductCard({ user, product, isFavorite = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [addingToCart, setAddingToCart] = useState(false);
  const canUseShoppingFeatures = !user || user.role === 'user';

  const getSizeStock = (size) => (
    typeof product.stock === 'object' && product.stock !== null
      ? (parseInt(product.stock[size], 10) || 0)
      : parseInt(product.stock, 10) || 0
  );

  const firstAvailableSize = product.sizes.find((size) => getSizeStock(size) > 0)
    || product.sizes[0]
    || 'M';
  const [selectedSize, setSelectedSize] = useState(firstAvailableSize);

  // Calcular stock total sumando todos los talles (si es objeto) o usando el valor directo
  const totalStock = typeof product.stock === 'object' && product.stock !== null
    ? Object.values(product.stock).reduce((sum, qty) => sum + (parseInt(qty, 10) || 0), 0)
    : parseInt(product.stock, 10) || 0;
  const selectedSizeStock = getSizeStock(selectedSize);

  // Agrega 1 unidad del producto con el talle seleccionado
  const handleQuickAdd = async (e) => {
    e.preventDefault();       // evito que el link padre navegue
    e.stopPropagation();      // evito que el evento suba al contenedor
    if (!user) {
      navigate('/login');
      return;
    }
    if (selectedSizeStock > 0) {
      setAddingToCart(true);
      try {
        await dispatch(addToCart({ product, quantity: 1, size: selectedSize })).unwrap();
        dispatch(showNotification({
          type: 'success',
          message: `¡"${product.name}" (${selectedSize}) agregada al carrito!`
        }));
      } catch (message) {
        dispatch(showNotification({
          type: user.role === 'user' ? 'error' : 'warning',
          message
        }));
      } finally {
        setAddingToCart(false);
      }
    } else {
      dispatch(showNotification({
        type: 'warning',
        message: `No hay stock disponible para el talle ${selectedSize}.`
      }));
    }
  };

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await dispatch(toggleFavorite(product.id)).unwrap();
    } catch (message) {
      dispatch(showNotification({
        type: user.role === 'user' ? 'error' : 'warning',
        message
      }));
    }
  };

  // Si la URL no apunta a una imagen directa, mantengo el producto visible con fallback.
  const handleImageError = (e) => {
    applyTeamCrestFallback(e, product);
  };

  return (
    <article className="group bg-white border border-neutral-200/80 rounded-xl overflow-hidden shadow-sm hover:shadow-primary/5 hover:border-neutral-350 transition-all duration-350 flex flex-col h-full relative">

      {/* Botón de favoritos (corazón) */}
      {canUseShoppingFeatures && (
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
      <Link to={`/product/${product.id}`} className="block relative overflow-hidden aspect-[4/5] bg-white">
        <img
          src={product.image}
          alt={`Fotografía de la camiseta ${product.name}`}
          className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500"
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
        {canUseShoppingFeatures && (
          <div className="flex gap-2 mt-4" aria-label="Selección de talle">
            {product.sizes.map((size) => {
              const sizeStock = getSizeStock(size);

              return (
                <button
                  key={size}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedSize(size);
                  }}
                  disabled={sizeStock === 0}
                  aria-pressed={selectedSize === size}
                  title={sizeStock === 0 ? `Talle ${size} sin stock` : `${sizeStock} disponibles`}
                  className={`w-9 h-9 flex items-center justify-center text-xs font-bold rounded-lg border transition-all ${sizeStock === 0
                      ? 'bg-neutral-100 border-neutral-200 text-neutral-300 cursor-not-allowed line-through'
                      : selectedSize === size
                        ? 'bg-[#325B42] border-[#325B42] text-white shadow-sm'
                        : 'bg-white border-neutral-200 text-antracita hover:border-neutral-350 cursor-pointer'
                    }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        )}

        {canUseShoppingFeatures && totalStock > 0 && (
          <p className="text-[10px] text-neutral-500 mt-2 font-semibold">
            {selectedSizeStock} disponibles en talle {selectedSize}
          </p>
        )}

        {/* Botón de compra rápida — también oculto para el admin */}
        {canUseShoppingFeatures && (
          <button
            onClick={handleQuickAdd}
            disabled={selectedSizeStock === 0 || addingToCart}
            className={`w-full text-center font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-lg shadow-sm transition-all duration-200 mt-5 cursor-pointer ${selectedSizeStock === 0
                ? 'bg-neutral-100 border border-neutral-200 text-neutral-400 cursor-not-allowed shadow-none'
                : 'bg-[#325B42] hover:bg-[#284935] text-white hover:shadow-md'
              }`}
          >
            {selectedSizeStock === 0
              ? 'Sin stock'
              : addingToCart
                ? <LoadingIndicator label="Agregando..." compact />
                : 'Agregar al carrito'}
          </button>
        )}
      </div>
    </article>
  );
}

export default ProductCard;
