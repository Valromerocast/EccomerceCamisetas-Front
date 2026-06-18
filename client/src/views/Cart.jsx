// Vista del carrito de compras
// Muestra todos los artículos del carrito y el resumen de compra lateral.
// Si el carrito está vacío, muestra un estado vacío con invitación a explorar la tienda.
import { Link } from 'react-router-dom';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import { useScrollOnMessage } from '../components/ui/useScrollOnMessage';
import LoadingIndicator from '../components/ui/LoadingIndicator';

function Cart({
  cart = [],
  cartLoading = false,
  cartError = '',
  updateCartQuantity,
  removeFromCart,
  clearCart
}) {
  useScrollOnMessage(cartError);

  // Controlo si el carrito tiene artículos o está vacío para decidir qué renderizar
  const isCartEmpty = cart.length === 0;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-cream text-antracita min-h-screen">

      {/* Encabezado con conteo de artículos */}
      <header className="border-b border-neutral-350/40 pb-5">
        <h1 className="text-3xl font-extrabold text-antracita font-title">Tu Carrito</h1>
        <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mt-1">
          {/* Muestra cantidad total de unidades sumando todas las cantidades */}
          {isCartEmpty ? 'Tienes 0 artículos seleccionados.' : `Tienes ${cart.reduce((sum, i) => sum + i.quantity, 0)} artículos seleccionados para tu próxima victoria.`}
        </p>
      </header>

      {cartError && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3.5 rounded-lg text-xs font-bold">
          {cartError}
        </div>
      )}

      {cartLoading && (
        <p className="text-xs font-semibold text-neutral-500">
          <LoadingIndicator label="Actualizando carrito..." compact />
        </p>
      )}

      {isCartEmpty ? (
        /* Estado vacío: le doy una razón al usuario para ir al catálogo */
        <section className="text-center py-20 bg-white border border-neutral-200/85 rounded-2xl p-6 max-w-2xl mx-auto space-y-5 flex flex-col items-center shadow-sm">
          {/* Ícono de carrito vacío */}
          <div className="bg-cream p-4 rounded-full border border-neutral-200 text-neutral-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-base font-bold font-title">¿Aún no has elegido tu manto sagrado?</h2>
            <p className="text-xs text-neutral-500 max-w-sm">
              Explora nuestra tienda para descubrir increíbles camisetas estampadas de selecciones nacionales de la mejor calidad.
            </p>
          </div>
          <Link
            to="/catalog"
            className="bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-6 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Explorar Tienda
          </Link>
        </section>
      ) : (
        /* Carrito con artículos: grilla de 2/3 para ítems y 1/3 para el resumen */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Columna de ítems del carrito */}
          <section className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
              {/* Lista de artículos — cada uno es un CartItem */}
              <ul className="divide-y divide-neutral-200/70" aria-label="Lista de camisetas en tu carrito">
                {cart.map((item) => (
                  <CartItem
                    key={item.cartKey}
                    item={item}
                    disabled={cartLoading}
                    updateCartQuantity={updateCartQuantity}
                    removeFromCart={removeFromCart}
                  />
                ))}
              </ul>
            </div>

            {/* Acciones del carrito: vaciar todo o seguir comprando */}
            <div className="flex justify-between items-center px-2">
              {/* Botón para vaciar el carrito completamente */}
              <button
                onClick={clearCart}
                disabled={cartLoading}
                className="text-xs text-red-500 hover:text-red-600 font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Vaciar Carrito</span>
              </button>

              {/* Link para volver al catálogo sin perder el carrito */}
              <Link to="/catalog" className="text-xs text-primary hover:underline font-bold uppercase tracking-wider">
                &larr; Continuar Comprando
              </Link>
            </div>
          </section>

          {/* Columna del resumen de compra y botón de checkout */}
          <div className="lg:col-span-1">
            <CartSummary cart={cart} />
          </div>
        </div>
      )}
    </main>
  );
}

export default Cart;
