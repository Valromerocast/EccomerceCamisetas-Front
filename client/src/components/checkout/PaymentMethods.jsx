// Selector de métodos de pago del checkout
// Muestra los métodos disponibles (Mercado Pago, tarjeta, PayPal, transferencia) como opciones seleccionables.
// El método activo queda resaltado con borde verde y fondo suave, y muestra su correspondiente formulario en caso de tarjeta.
import { Input } from '../ui/Form';

function PaymentMethods({ selectedMethod, setSelectedMethod, cardData, setCardData, cardErrors, setCardErrors }) {
  const methods = [
    {
      id: 'mercadopago',
      name: 'Mercado Pago',
      badge: 'RECOMENDADO',
      description: 'Hasta 12 cuotas sin interés',
      icon: (
        <span className="text-sm font-bold text-sky-600 font-mono">MP</span>
      )
    },
    {
      id: 'tarjeta',
      name: 'Tarjeta de Crédito / Débito',
      description: 'Visa, Mastercard, Amex',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      )
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Pago seguro internacional',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 'transferencia',
      name: 'Transferencia Bancaria',
      description: '5% de descuento adicional',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    }
  ];

  // Formateador dinámico para el número de tarjeta (agrega espacios cada 4 dígitos)
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Solo números
    if (value.length > 16) {
      value = value.slice(0, 16);
    }
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    setCardData((prev) => ({ ...prev, number: formatted }));
    if (cardErrors?.number) {
      setCardErrors((prev) => ({ ...prev, number: null }));
    }
  };

  // Formateador dinámico para la fecha de vencimiento (MM/YY)
  const handleCardExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Solo números
    if (value.length > 4) {
      value = value.slice(0, 4);
    }
    let formatted = value;
    if (value.length > 2) {
      formatted = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setCardData((prev) => ({ ...prev, expiry: formatted }));
    if (cardErrors?.expiry) {
      setCardErrors((prev) => ({ ...prev, expiry: null }));
    }
  };

  // Filtrado de letras y espacios para el nombre del titular
  const handleCardNameChange = (e) => {
    const value = e.target.value;
    if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/.test(value)) {
      setCardData((prev) => ({ ...prev, name: value }));
      if (cardErrors?.name) {
        setCardErrors((prev) => ({ ...prev, name: null }));
      }
    }
  };

  // Filtrado de números para el CVV
  const handleCardCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setCardData((prev) => ({ ...prev, cvv: value }));
      if (cardErrors?.cvv) {
        setCardErrors((prev) => ({ ...prev, cvv: null }));
      }
    }
  };

  return (
    <fieldset className="space-y-4 text-antracita">
      <legend className="text-xs font-bold text-neutral-500 tracking-wider uppercase font-title mb-4">
        Método de Pago
      </legend>
      {/* Lista de opciones de pago disponibles */}
      <ul className="space-y-3">
        {methods.map((method) => {
          const isSelected = selectedMethod === method.id;
          return (
            <li 
              key={method.id} 
              className={`border rounded-xl overflow-hidden shadow-sm transition-all duration-200 ${
                isSelected ? 'border-primary bg-primary/[0.02]' : 'border-neutral-200 bg-white'
              }`}
            >
              <label 
                className={`w-full p-4 cursor-pointer flex items-center justify-between select-none ${
                  isSelected ? 'bg-primary/5' : 'hover:bg-neutral-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={isSelected}
                  onChange={() => setSelectedMethod(method.id)}
                  className="sr-only"
                />
                <div className="flex items-center space-x-3.5">
                  <div className={`p-2 rounded-lg bg-neutral-100 ${isSelected ? 'text-primary' : 'text-neutral-500'}`}>
                    {method.icon}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-bold font-title">{method.name}</p>
                      {method.badge && (
                        <span className="bg-primary/10 text-primary text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wide border border-primary/20">
                          {method.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5 leading-normal">{method.description}</p>
                  </div>
                </div>

                {/* Indicador de Selección */}
                <div className="flex-shrink-0">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-primary' : 'border-neutral-300'
                  }`}>
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                </div>
              </label>

              {/* Formulario de tarjeta desplegado cuando está seleccionado */}
              {isSelected && method.id === 'tarjeta' && (
                <div className="p-5 border-t border-neutral-150 bg-white space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Input
                        label="Número de Tarjeta"
                        name="cardNumber"
                        value={cardData.number}
                        onChange={handleCardNumberChange}
                        placeholder="4517 5678 1234 5678"
                        error={cardErrors?.number}
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Input
                        label="Nombre del Titular"
                        name="cardName"
                        value={cardData.name}
                        onChange={handleCardNameChange}
                        placeholder="JUAN PEREZ"
                        error={cardErrors?.name}
                        required
                      />
                    </div>
                    <div>
                      <Input
                        label="Fecha de Vencimiento"
                        name="cardExpiry"
                        value={cardData.expiry}
                        onChange={handleCardExpiryChange}
                        placeholder="MM/YY"
                        error={cardErrors?.expiry}
                        required
                        maxLength="5"
                      />
                    </div>
                    <div>
                      <Input
                        label="Código de Seguridad (CVV)"
                        type="password"
                        name="cardCvv"
                        value={cardData.cvv}
                        onChange={handleCardCvvChange}
                        placeholder="123"
                        error={cardErrors?.cvv}
                        required
                        maxLength="4"
                      />
                    </div>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <p className="text-[10px] text-neutral-500 font-semibold leading-normal bg-cream p-3 rounded-lg border border-neutral-200 flex items-center space-x-1.5 mt-2">
        <span>🔒</span>
        <span>Tus datos están protegidos por encriptación SSL de 256 bits. Mundialista Store nunca almacena la información completa de tu tarjeta.</span>
      </p>
    </fieldset>
  );
}

export default PaymentMethods;
