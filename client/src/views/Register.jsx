// Vista de registro de nuevo usuario
// Conectada al backend: POST /api/auth/register
// Body esperado por el backend: nombre, apellido, email, password
// confirmPassword y acceptTerms solo se usan para validación local
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Button } from '../components/ui/Form';
import { useScrollOnMessage } from '../components/ui/useScrollOnMessage';

function Register({ registerUser }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  useScrollOnMessage(error);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedName = formData.name.trim();
    const trimmedApellido = formData.apellido.trim();
    const trimmedEmail = formData.email.trim();

    // Validaciones locales primero — no hace falta llamar al backend si hay errores obvios
    if (!trimmedName || !trimmedApellido || !trimmedEmail || !formData.password || !formData.confirmPassword) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    if (trimmedName.length < 2) {
      setError('El nombre debe tener al menos 2 caracteres.');
      return;
    }

    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(trimmedName)) {
      setError('El nombre solo debe contener letras y espacios.');
      return;
    }

    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(trimmedApellido)) {
      setError('El apellido solo debe contener letras y espacios.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('El correo electrónico no tiene un formato válido.');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (!formData.acceptTerms) {
      setError('Debes aceptar los Términos de Servicio y la Política de Privacidad.');
      return;
    }

    setLoading(true);
    try {
      const registerResult = await registerUser({
        nombre: trimmedName,
        apellido: trimmedApellido,
        email: trimmedEmail,
        password: formData.password
      });

      if (registerResult.success) {
        navigate('/register-success');
      } else {
        setError(registerResult.message || 'Error al registrar. Intentá de nuevo.');
      }
    } catch {
      setError('No se pudo conectar con el servidor. Verificá que el backend esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (e) => {
    e.target.src = "/assets/shirt-black.svg";
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-neutral-200/80 flex flex-col md:flex-row min-h-[550px]">

        {/* Lado izquierdo: imagen con overlay */}
        <div className="md:w-1/2 relative bg-neutral-900 overflow-hidden min-h-[350px] md:min-h-auto">
          <img
            src="/assets/shirt-blue.svg"
            alt="Camiseta de fútbol de Japón azul con diseño de llamas"
            className="absolute inset-0 w-full h-full object-cover opacity-75"
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900/30 to-neutral-950/20" />
          <div className="absolute bottom-6 left-6 right-6 p-6 rounded-xl bg-neutral-950/50 backdrop-blur-md border border-white/10 text-white space-y-2">
            <h2 className="text-xl font-bold font-title leading-tight">Donde la pasión por el juego se une al arte artesanal.</h2>
            <p className="text-xs text-neutral-350 leading-relaxed">
              Únete a nuestra comunidad y lleva tu historia del fútbol a un nuevo nivel de sofisticación.
            </p>
          </div>
        </div>

        {/* Lado derecho: formulario */}
        <div className="md:w-1/2 p-8 sm:p-12 flex flex-col justify-center space-y-5 bg-white">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-antracita font-title">Crea tu cuenta</h1>
            <p className="text-xs text-neutral-450">Empieza hoy tu viaje futbolístico con nosotros.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-500 p-3.5 rounded-lg text-xs font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Nombre y apellido en dos columnas */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nombre"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Juan"
                required
              />
              <Input
                label="Apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                placeholder="Pérez"
                required
              />
            </div>

            <Input
              label="Correo electrónico"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Contraseña"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caract."
                required
              />
              <Input
                label="Confirmar"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repita contraseña"
                required
              />
            </div>

            <div className="flex items-start space-x-2.5 py-1">
              <input
                type="checkbox"
                id="acceptTerms"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="mt-0.5 rounded border-neutral-300 text-primary focus:ring-primary h-4 w-4"
              />
              <label htmlFor="acceptTerms" className="text-xs text-neutral-500 select-none cursor-pointer leading-tight">
                Acepto los Términos de Servicio y la Política de Privacidad de Mundialista Store.
              </label>
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Creando cuenta...' : 'Crear mi cuenta'}
              </Button>
            </div>
          </form>

          <div className="text-center text-xs text-neutral-500">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="text-primary hover:underline font-bold">
              Inicia sesión aquí
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Register;
