import React from 'react';

function PaymentMethods({ selectedMethod, setSelectedMethod }) {
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

  return (
    <div className="space-y-4 text-antracita">
      <h3 className="text-xs font-bold text-neutral-500 tracking-wider uppercase font-title">Método de Pago</h3>
      <div className="space-y-3">
        {methods.map((method) => {
          const isSelected = selectedMethod === method.id;
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => setSelectedMethod(method.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                isSelected
                  ? 'bg-primary/5 border-primary shadow-sm'
                  : 'bg-white border-neutral-200 hover:border-neutral-350'
              }`}
            >
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

              {/* Radio Indicator */}
              <div className="flex-shrink-0">
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  isSelected ? 'border-primary' : 'border-neutral-300'
                }`}>
                  {isSelected && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-neutral-500 font-semibold leading-normal bg-cream p-3 rounded-lg border border-neutral-200 flex items-center space-x-1.5 mt-2">
        <span>🔒</span>
        <span>Tus datos están protegidos por encriptación SSL de 256 bits. Mundialista Store nunca almacena la información completa de tu tarjeta.</span>
      </p>
    </div>
  );
}

export default PaymentMethods;
