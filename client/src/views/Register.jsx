// Vista de registro de nuevo usuario
// Valida todos los campos antes de enviar: nombre, email, contraseñas coincidentes y aceptación de términos.
// Si el registro es exitoso, redirige a la página de confirmación.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Button } from '../components/ui/Form';

function Register({ registerUser }) {
  const navigate = useNavigate();

  // Estado del formulario: todos los campos que el usuario tiene que completar
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });

  // Mensaje de error para mostrar si algo falla en la validación
  const [error, setError] = useState('');

  // Handler genérico para actualizar cualquier campo del formulario (inputs y checkboxes)
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Valida los datos del formulario antes de registrar al usuario
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Verifico que todos los campos estén completados
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    // La contraseña debe tener al menos 4 caracteres (mínimo elegido para el proyecto)
    if (formData.password.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    // Las dos contraseñas ingresadas deben ser iguales
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    // El usuario debe aceptar los términos para poder registrarse
    if (!formData.acceptTerms) {
      setError('Debes aceptar los Términos de Servicio y la Política de Privacidad.');
      return;
    }

    // Llamo a la función de registro del App (que también controla si el email ya existe)
    const res = registerUser(formData.name, formData.email, formData.password);
    if (res.success) {
      navigate('/register-success');  // mando a la pantalla de éxito
    } else {
      setError(res.message);
    }
  };

  // Si la imagen de la izquierda no carga, muestro la imagen alternativa
  const handleImageError = (e) => {
    e.target.src = "/assets/shirt-black.svg";
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-neutral-200/80 flex flex-col md:flex-row min-h-[550px]">

        {/* Lado izquierdo: imagen de camiseta de Japón con overlay */}
        <div className="md:w-1/2 relative bg-neutral-900 overflow-hidden min-h-[350px] md:min-h-auto">
          <img
            src="/assets/shirt-blue.svg"
            alt="Camiseta de fútbol de Japón azul con diseño de llamas"
            className="absolute inset-0 w-full h-full object-cover opacity-75"
            onError={handleImageError}
          />
          {/* Overlay oscuro */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900/30 to-neutral-950/20" />

          {/* Tarjeta con glassmorphism y texto motivador */}
          <div className="absolute bottom-6 left-6 right-6 p-6 rounded-xl bg-neutral-950/50 backdrop-blur-md border border-white/10 text-white space-y-2">
            <h2 className="text-xl font-bold font-title leading-tight">Donde la pasión por el juego se une al arte artesanal.</h2>
            <p className="text-xs text-neutral-350 leading-relaxed">
              Únete a nuestra comunidad y lleva tu historia del fútbol a un nuevo nivel de sofisticación.
            </p>
          </div>
        </div>

        {/* Lado derecho: formulario de registro */}
        <div className="md:w-1/2 p-8 sm:p-12 flex flex-col justify-center space-y-5 bg-white">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-antracita font-title">Crea tu cuenta</h1>
            <p className="text-xs text-neutral-450">Empieza hoy tu viaje futbolístico con nosotros.</p>
          </div>

          {/* Mensaje de error de validación o del servidor */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-500 p-3.5 rounded-lg text-xs font-bold">
              {error}
            </div>
          )}

          {/* Formulario de registro */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nombre completo"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Juan Pérez"
              required
            />

            <Input
              label="Correo electrónico"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              required
            />

            {/* Los campos de contraseña van en dos columnas para que quepan juntos */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Contraseña"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 4 caract."
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

            {/* Checkbox de aceptación de términos — obligatorio para registrarse */}
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
              <Button type="submit" variant="primary">
                Crear mi cuenta
              </Button>
            </div>
          </form>



          {/* Link para ir al login si ya tiene cuenta */}
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
