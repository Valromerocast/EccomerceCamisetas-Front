// Vista del checkout (finalizar compra)
// Si el carrito está vacío, redirige de vuelta al carrito automáticamente.
// Muestra el formulario de envío, el selector de método de pago y el resumen del pedido.
import { useRef, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Input } from '../components/ui/Form';
import PaymentMethods from '../components/checkout/PaymentMethods';
import CheckoutSummary from '../components/checkout/CheckoutSummary';
import { useScrollOnMessage } from '../components/ui/useScrollOnMessage';

// Helper functions for card validation
const validateLuhn = (cardNumber) => {
  const digits = cardNumber.replace(/\D/g, '');
  if (!digits || digits.length < 13) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let val = parseInt(digits.charAt(i), 10);
    if (shouldDouble) {
      val *= 2;
      if (val > 9) val -= 9;
    }
    sum += val;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
};

const validateCardNumber = (number) => {
  const cleanNum = number.replace(/\s+/g, '');
  if (!/^\d{15,16}$/.test(cleanNum)) {
    return 'El número de tarjeta debe tener entre 15 y 16 dígitos.';
  }
  if (!validateLuhn(cleanNum)) {
    return 'El número de tarjeta ingresado no es válido. Por favor, verifícalo.';
  }
  return null;
};

const validateCardName = (name) => {
  const trimmed = name.trim();
  if (trimmed.length < 3) {
    return 'Mínimo 3 caracteres';
  }
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(trimmed)) {
    return 'Solo debe contener letras';
  }
  return null;
};

const validateExpiry = (expiry) => {
  const trimmed = expiry.trim();
  if (!/^\d{2}\/\d{2}$/.test(trimmed)) {
    return 'Formato inválido (MM/YY)';
  }
  const [mStr, yStr] = trimmed.split('/');
  const month = parseInt(mStr, 10);
  const year = parseInt(yStr, 10) + 2000;

  if (month < 1 || month > 12) {
    return 'Mes inválido (01-12)';
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-indexed

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return 'Tarjeta vencida';
  }
  if (year > currentYear + 15) {
    return 'Año inválido';
  }
  return null;
};

const validateCvv = (cvv) => {
  const trimmed = cvv.trim();
  if (!/^\d{3,4}$/.test(trimmed)) {
    return 'Debe tener 3 o 4 dígitos';
  }
  return null;
};

function Checkout({ cart = [], user, placeOrder }) {
  const navigate = useNavigate();

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

  // Estado de los datos de tarjeta
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  // Estado de errores de tarjeta
  const [cardErrors, setCardErrors] = useState({});

  // Mensaje de error de validación del formulario
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  useScrollOnMessage(error);

  // Los hooks deben ejecutarse siempre en el mismo orden.
  if (cart.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  // Actualiza el estado cuando el usuario escribe en cualquier campo del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Valida y envía el formulario para crear la orden
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submittingRef.current) {
      return;
    }

    setError('');
    setCardErrors({});

    const trimmedData = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      zipCode: formData.zipCode.trim(),
      phone: formData.phone.trim()
    };

    // Todos los campos de envío son obligatorios
    if (!trimmedData.fullName || !trimmedData.email || !trimmedData.address || !trimmedData.city || !trimmedData.zipCode || !trimmedData.phone) {
      setError('Por favor, completa todos los campos del envío.');
      return;
    }

    // Validación del nombre completo
    if (trimmedData.fullName.length < 3) {
      setError('El nombre completo del envío debe tener al menos 3 caracteres.');
      return;
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(trimmedData.fullName)) {
      setError('El nombre completo del envío solo debe contener letras y espacios.');
      return;
    }

    // Validación del correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedData.email)) {
      setError('El correo electrónico no tiene un formato válido (ej: usuario@correo.com).');
      return;
    }

    // Validación de la dirección
    if (trimmedData.address.length < 5) {
      setError('La dirección de entrega debe tener al menos 5 caracteres.');
      return;
    }

    // Validación de la ciudad
    if (trimmedData.city.length < 3) {
      setError('La ciudad o localidad debe tener al menos 3 caracteres.');
      return;
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(trimmedData.city)) {
      setError('La ciudad o localidad solo debe contener letras y espacios.');
      return;
    }

    // Validación del código postal
    if (trimmedData.zipCode.length < 4 || trimmedData.zipCode.length > 10) {
      setError('El código postal debe tener entre 4 y 10 caracteres.');
      return;
    }
    if (!/^[a-zA-Z0-9\s-]+$/.test(trimmedData.zipCode)) {
      setError('El código postal solo debe contener letras, números, espacios o guiones.');
      return;
    }

    // Validación del teléfono
    if (!/^[+0-9\s\-()]{7,20}$/.test(trimmedData.phone)) {
      setError('El teléfono de contacto no es válido. Debe tener entre 7 y 20 caracteres y contener solo números, espacios, +, - o ().');
      return;
    }

    // Si el método de pago es tarjeta, validamos los campos de la tarjeta
    if (paymentMethod === 'tarjeta') {
      const errors = {};
      
      const numError = validateCardNumber(cardData.number);
      if (numError) errors.number = numError;

      const nameError = validateCardName(cardData.name);
      if (nameError) errors.name = nameError;

      const expiryError = validateExpiry(cardData.expiry);
      if (expiryError) errors.expiry = expiryError;

      const cvvError = validateCvv(cardData.cvv);
      if (cvvError) errors.cvv = cvvError;

      if (Object.keys(errors).length > 0) {
        setCardErrors(errors);
        setError('Por favor, corrige los errores en los datos de la tarjeta.');
        return;
      }
    }

    submittingRef.current = true;
    setSubmitting(true);

    try {
      const result = await placeOrder(trimmedData, paymentMethod);
      if (result.success) {
        navigate('/order-success');
      } else {
        setError(result.message || 'Ocurrió un error al procesar tu orden.');
      }
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
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
            <PaymentMethods 
              selectedMethod={paymentMethod} 
              setSelectedMethod={setPaymentMethod} 
              cardData={cardData}
              setCardData={setCardData}
              cardErrors={cardErrors}
              setCardErrors={setCardErrors}
            />
          </section>
        </div>

        {/* Columna derecha (1/3): resumen del pedido y botón de confirmación */}
        <div className="lg:col-span-1 space-y-6">
          {/* Resumen con los artículos y subtotal */}
          <CheckoutSummary cart={cart} />

          {/* Botón de confirmación final — dispara el submit del formulario */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-lg shadow-md hover:shadow-primary/20 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Procesando pedido...' : 'Finalizar Compra →'}
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
