// Vista del checkout (finalizar compra)
// Si el carrito está vacío, redirige de vuelta al carrito automáticamente.
// Muestra el formulario de envío, el selector de método de pago y el resumen del pedido.
import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Input } from '../components/ui/Form';
import PaymentMethods from '../components/checkout/PaymentMethods';
import CheckoutSummary from '../components/checkout/CheckoutSummary';

function Checkout({ cart = [], user, placeOrder }) {
  const navigate = useNavigate();

  // Si el carrito está vacío no tiene sentido estar en el checkout, lo mando de vuelta
  if (cart.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  // Estado del formulario de envío
  // Si el usuario está logueado, pre-relleno nombre y email para que no tenga que escribirlos
  const [formData, setFormData] = useState({
    fullName: user ? user.name : '',
    email: user ? user.email : '',
    address: '',
    city: '',
    zipCode: '',
    phone: ''
  });

  // Método de pago seleccionado — por defecto Mercado Pago
  const [paymentMethod, setPaymentMethod] = useState('mercadopago');

  // Mensaje de error de validación del formulario
  const [error, setError] = useState('');

  // Actualiza el estado cuando el usuario escribe en cualquier campo del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Valida y envía el formulario para crear la orden
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Todos los campos de envío son obligatorios
    if (!formData.fullName || !formData.email || !formData.address || !formData.city || !formData.zipCode || !formData.phone) {
      setError('Por favor, completa todos los campos del envío.');
      return;
    }

    // Llamo a la función del App que crea la orden, descuenta el stock y limpia el carrito
    const result = placeOrder(formData, paymentMethod);
    if (result.success) {
      navigate('/order-success');  // redirigir a la confirmación
    } else {
      setError(result.message || 'Ocurrió un error al procesar tu orden.');
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-cream text-antracita min-h-screen">

      {/* Encabezado de la página */}
      <header className="border-b border-neutral-350/40 pb-5">
        <h1 className="text-3xl font-extrabold text-antracita font-title">Finalizar Compra</h1>
        <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mt-1">Completa los detalles de entrega y pago para procesar tu pedido.</p>
      </header>

      {/* Mensaje de error si el formulario no pasa la validación */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-500 p-4 rounded-lg text-xs font-bold">
          {error}
        </div>
      )}

      {/* El formulario envuelve toda la página para poder hacer submit desde el botón de la derecha */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Columna izquierda (2/3): formulario de envío + método de pago */}
        <div className="lg:col-span-2 space-y-8">

          {/* Tarjeta del formulario de envío */}
          <section className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
            <h2 className="text-xs font-bold tracking-wider uppercase text-antracita font-title border-b border-neutral-100 pb-3">Detalles de Envío</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Nombre Completo"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Juan Pérez"
                required
              />
              {/* El email queda bloqueado si el usuario está logueado para no poder cambiarlo */}
              <Input
                label="Correo Electrónico"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="juan@ejemplo.com"
                required
                disabled={!!user}
              />
              <Input
                label="Dirección de Entrega"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Av. del Libertador 1450, Piso 4"
                required
              />
              <Input
                label="Ciudad / Localidad"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Buenos Aires"
                required
              />
              <Input
                label="Código Postal"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                placeholder="C1425"
                required
              />
              <Input
                label="Teléfono de Contacto"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+54 11 9876-5432"
                required
              />
            </div>
          </section>

          {/* Tarjeta del selector de método de pago */}
          <section className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <PaymentMethods selectedMethod={paymentMethod} setSelectedMethod={setPaymentMethod} />
          </section>
        </div>

        {/* Columna derecha (1/3): resumen del pedido y botón de confirmación */}
        <div className="lg:col-span-1 space-y-6">
          {/* Resumen con los artículos y subtotal */}
          <CheckoutSummary cart={cart} />

          {/* Botón de confirmación final — dispara el submit del formulario */}
          <button
            type="submit"
            className="w-full flex items-center justify-center bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-lg shadow-md hover:shadow-primary/20 transition-all duration-200 cursor-pointer"
          >
            Finalizar Compra &rarr;
          </button>

          {/* Nota legal debajo del botón */}
          <p className="text-[10px] text-neutral-500 text-center leading-relaxed font-semibold">
            Al confirmar la compra, aceptas nuestros términos de servicio y política de privacidad.
          </p>
        </div>
      </form>
    </main>
  );
}

export default Checkout;
