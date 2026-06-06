// Vista de inicio de sesión
// Si el usuario ya tiene sesión activa, lo redirige directamente a su perfil (o al panel admin).
// Si no, muestra el formulario de login con email y contraseña.
import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Input, Button } from '../components/ui/Form';

function Login({ user, login }) {
  const navigate = useNavigate();

  // Si ya está logueado, no tiene sentido que entre al login — lo mando directamente
  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin/sales' : '/profile'} replace />;
  }

  // Estado del formulario: email, contraseña y checkbox de "recordarme"
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  // Mensaje de error que se muestra si las credenciales son incorrectas
  const [error, setError] = useState('');

  // Actualiza el estado del formulario para cualquier campo (inputs y checkbox)
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Valida el formulario y llama a la función de login del App
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const emailTrimmed = formData.email.trim();

    // Validación básica de campos vacíos
    if (!emailTrimmed || !formData.password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    // Validación de formato de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      setError('El correo electrónico no tiene un formato válido (ej: usuario@correo.com).');
      return;
    }

    // Validación de longitud mínima de contraseña
    if (formData.password.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    const res = login(emailTrimmed, formData.password);
    if (res.success) {
      // Redirige según el rol: admin al panel, usuario normal a su perfil
      navigate(res.user.role === 'admin' ? '/admin/sales' : '/profile');
    } else {
      setError(res.message);
    }
  };

  // Si la imagen de la izquierda (jersey de Brasil) no carga, uso la misma URL como fallback
  const handleImageError = (e) => {
    e.target.src = "/assets/shirt-white.svg";
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-neutral-200/80 flex flex-col md:flex-row min-h-[500px]">

        {/* Lado izquierdo: imagen de camiseta con overlay de texto */}
        <div className="md:w-1/2 relative bg-neutral-900 overflow-hidden min-h-[350px] md:min-h-auto">
          <img
            src="/assets/shirt-white.svg"
            alt="Camiseta de fútbol de Brasil verde-amarilla en exhibidor"
            className="absolute inset-0 w-full h-full object-cover opacity-75"
            onError={handleImageError}
          />
          {/* Overlay oscuro para mejorar la legibilidad del texto */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900/30 to-neutral-950/20" />

          {/* Tarjeta de texto con efecto glassmorphism sobre la imagen */}
          <div className="absolute bottom-6 left-6 right-6 p-6 rounded-xl bg-neutral-950/50 backdrop-blur-md border border-white/10 text-white space-y-2">
            <h2 className="text-xl font-bold font-title leading-tight">La pasión se lleva en la piel.</h2>
            <p className="text-xs text-neutral-350 leading-relaxed">
              Bienvenido de nuevo a la casa del fútbol. Accede a tu cuenta para descubrir las últimas equipaciones y colecciones exclusivas.
            </p>
          </div>
        </div>

        {/* Lado derecho: formulario de inicio de sesión */}
        <div className="md:w-1/2 p-8 sm:p-12 flex flex-col justify-center space-y-6 bg-white">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-antracita font-title">Iniciar Sesión</h1>
            <p className="text-xs text-neutral-450">Ingresa tus credenciales para continuar.</p>
          </div>

          {/* Mensaje de error — solo aparece si login falla */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-500 p-3.5 rounded-lg text-xs font-bold">
              {error}
            </div>
          )}

          {/* Formulario principal de login */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Correo electrónico"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              required
            />

            <div>
              {/* Label de contraseña con link de "olvidé mi contraseña" a la derecha */}
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-antracita/60 tracking-wider uppercase">
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <a href="#" className="text-[10px] font-bold text-primary hover:underline">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full bg-white border border-neutral-300 text-antracita text-xs rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary transition-all duration-200 shadow-sm"
              />
            </div>

            {/* Checkbox "recordarme" — en este proyecto es decorativo, no implementa persistencia extendida */}
            <div className="flex items-center space-x-2.5 py-1">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="rounded border-neutral-300 text-primary focus:ring-primary h-4 w-4"
              />
              <label htmlFor="rememberMe" className="text-xs text-neutral-500 select-none cursor-pointer">
                Recordarme en este dispositivo
              </label>
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary">
                Iniciar Sesión &rarr;
              </Button>
            </div>
          </form>



          {/* Link para ir al registro si no tiene cuenta */}
          <div className="text-center text-xs text-neutral-500">
            ¿No tienes una cuenta?{' '}
            <Link to="/register" className="text-primary hover:underline font-bold">
              Regístrate ahora
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;
