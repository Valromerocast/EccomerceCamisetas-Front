// Componentes de formulario reutilizables
// Acá defino los bloques básicos para armar formularios en toda la app:
// Input de texto, Select desplegable y Button con variantes de estilo.
// Los uso en Login, Register, Checkout, AdminProductEdit y AdminUserAdd.

// ─── Input de texto ───────────────────────────────────────────────────────────
// Acepta label, tipo, nombre, valor, handler de cambio, placeholder, required y error.
// El campo queda marcado en rojo si se le pasa un mensaje de error.
export function Input({ label, type = 'text', name, value, onChange, placeholder, required = false, error, ...props }) {
  return (
    <div className="flex flex-col space-y-1.5 w-full">
      {/* Label — solo se renderiza si se pasa el prop label */}
      {label && (
        <label htmlFor={name} className="text-[10px] font-bold text-antracita/60 tracking-wider uppercase">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          // Si hay error, el borde se vuelve rojo; si no, verde al hacer foco
          className={`w-full bg-white border ${
            error ? 'border-red-550 focus:border-red-550' : 'border-neutral-300 focus:border-primary'
          } text-antracita text-xs rounded-lg px-4 py-2.5 focus:outline-none transition-all duration-200 shadow-sm`}
          {...props}
        />
      </div>
      {/* Mensaje de error debajo del campo */}
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </div>
  );
}

// ─── Select desplegable ───────────────────────────────────────────────────────
// Toma un array de opciones con forma { value, label } y renderiza el select.
// Soporta label, required y mensaje de error igual que el Input.
export function Select({ label, name, value, onChange, options = [], required = false, error, ...props }) {
  return (
    <div className="flex flex-col space-y-1.5 w-full">
      {label && (
        <label htmlFor={name} className="text-[10px] font-bold text-antracita/60 tracking-wider uppercase">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full bg-white border border-neutral-300 text-antracita text-xs rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary transition-all duration-200 shadow-sm"
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-white">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </div>
  );
}

// ─── Botón con variantes ──────────────────────────────────────────────────────
// Variantes disponibles: 'primary' (verde), 'secondary' (gris), 'danger' (rojo).
// Por defecto es 'primary'. Acepta cualquier prop de botón HTML.
export function Button({ children, type = 'button', variant = 'primary', className = '', ...props }) {
  const baseStyle = "w-full font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-lg shadow-sm transition-all duration-250 focus:outline-none cursor-pointer flex items-center justify-center space-x-2";

  // Estilos específicos por variante
  const variants = {
    primary: "bg-primary hover:bg-primary/90 text-white shadow-primary/10 hover:shadow-primary/20",
    secondary: "bg-neutral-100 border border-neutral-250 hover:bg-neutral-200 text-antracita",
    danger: "bg-red-650 hover:bg-red-550 text-white shadow-red-600/10 hover:shadow-red-550/20"
  };

  return (
    <button
      type={type}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
