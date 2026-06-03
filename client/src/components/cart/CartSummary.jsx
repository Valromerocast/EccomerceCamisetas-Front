// Resumen de compra lateral del carrito
// Calcula subtotal, costo de envío y total, y muestra el botón para ir al checkout.
// El envío es gratis si el subtotal supera los $60.
import React from 'react';
import { Link } from 'react-router-dom';

function CartSummary({ cart }) {
  // Sumo el precio × cantidad de todos los ítems del carrito
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Umbral para envío gratis
  const shippingThreshold = 60;

  // Si el subtotal supera el umbral (o el carrito está vacío) el envío es gratis
  const shippingCost = subtotal >= shippingThreshold || subtotal === 0 ? 0 : 5.00;

  // Total final = subtotal + envío (impuestos siempre en $0 en este proyecto)
  const total = subtotal + shippingCost;

  return (
    <section className="bg-white border border-neutral-200 rounded-xl p-6 space-y-6 shadow-sm text-antracita">
      <h2 className="text-xs font-bold tracking-wider uppercase text-antracita font-title">Resumen de compra</h2>

      {/* Desglose de costos */}
      <div className="space-y-3.5 text-sm text-neutral-500 font-semibold">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="text-antracita font-bold">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Envío</span>
          <span className="text-antracita font-bold">
            {shippingCost === 0 ? (
              <span className="text-emerald-600 font-bold">Gratis</span>
            ) : (
              `$${shippingCost.toFixed(2)}`
            )}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Impuestos</span>
          <span className="text-antracita font-bold">$0.00</span>
        </div>

        {/* Aviso de cuánto falta para llegar al envío gratis — solo cuando aplica costo */}
        {shippingCost > 0 && (
          <div className="text-[10px] text-neutral-500 font-semibold leading-normal bg-cream p-2.5 rounded-lg border border-neutral-200">
            ¡Agrega <strong className="text-primary font-bold">${(shippingThreshold - subtotal).toFixed(2)}</strong> más para obtener <strong>Envío Gratis</strong>!
          </div>
        )}
      </div>

      <hr className="border-neutral-100" />

      {/* Total en grande */}
      <div className="flex justify-between text-base font-bold text-antracita font-title">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>

      {/* Botones de acción */}
      <div className="space-y-3 pt-2">
        {/* Botón principal: lleva al checkout para completar la compra */}
        <Link
          to="/checkout"
          className="w-full flex items-center justify-center bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-lg shadow-sm hover:shadow-primary/20 transition-all cursor-pointer"
        >
          Finalizar Compra &rarr;
        </Link>

        {/* Botón secundario: volver al catálogo a seguir comprando */}
        <Link
          to="/catalog"
          className="w-full flex items-center justify-center bg-white border border-neutral-300 hover:bg-neutral-50 text-antracita font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-lg transition-colors shadow-sm cursor-pointer"
        >
          Continuar comprando
        </Link>
      </div>

      {/* Mensaje de seguridad de pago */}
      <div className="text-center text-[10px] text-neutral-500 font-semibold flex items-center justify-center space-x-1">
        <span>🔒</span>
        <span>Pago 100% seguro y encriptado.</span>
      </div>
    </section>
  );
}

export default CartSummary;
