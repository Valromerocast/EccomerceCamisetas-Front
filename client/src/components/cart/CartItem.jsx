// Ítem individual del carrito de compras
// Muestra la imagen del producto, su nombre, talle, color elegido, controles de cantidad y precio.
// También permite eliminar el ítem del carrito.
import { Link } from 'react-router-dom';

function CartItem({ item, disabled = false, updateCartQuantity, removeFromCart }) {
  // Desestructuro el ítem para acceder a sus partes fácilmente
  const { cartKey, product, quantity, size } = item;

  const currentStock = typeof product.stock === 'object' && product.stock !== null
    ? (parseInt(product.stock[size], 10) || 0)
    : parseInt(product.stock, 10) || 0;

  // Si la imagen del producto no carga, muestro la imagen de fallback
  const handleImageError = (e) => {
    e.target.src = product.fallbackImage || "/assets/success.svg";
  };

  return (
    <li className="flex py-6 border-b border-neutral-200/70 last:border-0 items-center justify-between">
      <div className="flex items-center space-x-4">

        {/* Miniatura del producto con link al detalle */}
        <div className="flex-shrink-0 w-20 h-24 bg-neutral-100 rounded-lg overflow-hidden border border-neutral-200">
          <img
            src={product.image}
            alt={`Camiseta ${product.name} en talle ${size}`}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        </div>

        {/* Datos del producto: nombre, talle y controles de cantidad */}
        <div>
          <h3 className="text-sm font-bold text-antracita hover:text-primary transition-colors font-title">
            <Link to={`/product/${product.id}`}>{product.name}</Link>
          </h3>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-500 font-semibold">
            <span>Talle: <strong className="text-antracita uppercase">{size}</strong></span>
          </div>

          {/* Controles para aumentar o reducir la cantidad del ítem */}
          <div className="mt-2.5 flex items-center space-x-2">
            {/* Botón de restar — si llega a 0, la función de App elimina el ítem directamente */}
            <button
              onClick={() => updateCartQuantity(cartKey, quantity - 1)}
              disabled={disabled}
              className="w-7 h-7 flex items-center justify-center rounded-md bg-cream border border-neutral-200 text-neutral-500 hover:text-antracita hover:border-neutral-350 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-sm"
              aria-label={`Reducir cantidad de ${product.name}`}
            >
              -
            </button>
            {/* Cantidad actual */}
            <span className="text-sm text-antracita w-6 text-center font-bold">{quantity}</span>
            {/* Botón de sumar — se deshabilita cuando se alcanza el stock máximo */}
            <button
              onClick={() => updateCartQuantity(cartKey, quantity + 1)}
              disabled={disabled || quantity >= currentStock}
              className={`w-7 h-7 flex items-center justify-center rounded-md bg-cream border border-neutral-200 text-neutral-500 hover:text-antracita hover:border-neutral-350 transition-colors cursor-pointer font-bold shadow-sm ${quantity >= currentStock ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              aria-label={`Incrementar cantidad de ${product.name}`}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Precio total del ítem y botón para eliminarlo */}
      <div className="text-right flex flex-col justify-between h-20">
        {/* Precio = precio unitario × cantidad */}
        <span className="text-sm font-bold text-antracita">
          ${(product.price * quantity).toFixed(2)}
        </span>
        {/* Botón de eliminar ítem del carrito */}
        <button
          onClick={() => removeFromCart(cartKey)}
          disabled={disabled}
          className="text-xs text-red-500 hover:text-red-655 transition-colors flex items-center space-x-1 justify-end cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          aria-label={`Quitar ${product.name} del carrito`}
        >
          {/* Ícono de papelera */}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span className="hidden sm:inline">Eliminar</span>
        </button>
      </div>
    </li>
  );
}

export default CartItem;
