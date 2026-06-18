// Resumen del pedido dentro del checkout
// Muestra la lista de artículos del carrito con precios, y el desglose de subtotal, envío, impuestos y total.
// Se ubica en la columna derecha del formulario de checkout.
function CheckoutSummary({ cart }) {
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shippingCost = 0;
  const total = subtotal + shippingCost;

  const handleImageError = (e, item) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = item.product.fallbackImage;
  };

  return (
    <section className="bg-white border border-neutral-200 rounded-xl p-5 space-y-6 shadow-sm text-antracita">
      <h2 className="text-xs font-bold tracking-wider uppercase text-antracita font-title">Resumen del pedido</h2>

      {/* Items list */}
      <ul className="divide-y divide-neutral-200/60 max-h-80 overflow-y-auto pr-1">
        {cart.map((item) => (
          <li key={item.cartKey} className="py-3 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-3">
              <img
                src={item.product.image}
                alt={`Camiseta ${item.product.name}`}
                className="w-10 h-12 object-cover rounded bg-neutral-100 border border-neutral-200"
                onError={(e) => handleImageError(e, item)}
              />
              <div>
                <p className="font-bold text-antracita line-clamp-1 font-title">{item.product.name}</p>
                <p className="text-neutral-500 mt-0.5 uppercase text-[10px] font-semibold">
                  Talle: {item.size} | Cant: {item.quantity}
                </p>
              </div>
            </div>
            <span className="font-bold text-antracita">${(item.product.price * item.quantity).toFixed(2)}</span>
          </li>
        ))}
      </ul>

      <hr className="border-neutral-150" />

      {/* Pricing Details */}
      <div className="space-y-2.5 text-xs text-neutral-500 font-semibold">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="text-antracita font-bold">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Envío</span>
          <span className="text-emerald-600 font-bold">Gratis</span>
        </div>
      </div>

      <hr className="border-neutral-150" />

      <div className="flex justify-between text-sm font-bold text-antracita font-title">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </section>
  );
}

export default CheckoutSummary;
