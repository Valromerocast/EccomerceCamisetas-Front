// Vista para agregar nuevos usuarios desde el panel admin
// Se usa el mismo contrato de registro que el formulario público, pero con control adicional
// para evitar crear múltiples cuentas de administrador.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input, Button } from '../../components/ui/Form';

function AdminUserAdd({ registerUser }) {
  // Estado del formulario con los datos del nuevo usuario
  const [formData, setFormData] = useState({
    name: '',
    apellido: '',
    email: '',
    password: ''
  });

  // Mensaje de resultado: puede ser éxito o error
  const [message, setMessage] = useState({ type: '', text: '' });

  // Handler para actualizar cualquier campo del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Valida y envía el formulario para registrar el nuevo usuario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    const trimmedName = formData.name.trim();
    const trimmedApellido = formData.apellido.trim();
    const trimmedEmail = formData.email.trim();

    // Todos los campos son obligatorios
    if (!trimmedName || !trimmedApellido || !trimmedEmail || !formData.password) {
      setMessage({ type: 'error', text: 'Por favor, completa todos los campos.' });
      return;
    }

    // Validación del nombre y apellido
    if (trimmedName.length < 2 || trimmedApellido.length < 2) {
      setMessage({ type: 'error', text: 'El nombre y el apellido deben tener al menos 2 caracteres.' });
      return;
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(trimmedName) || !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(trimmedApellido)) {
      setMessage({ type: 'error', text: 'El nombre y el apellido solo deben contener letras y espacios.' });
      return;
    }

    // Validación del correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setMessage({ type: 'error', text: 'El correo electrónico no tiene un formato válido (ej: usuario@correo.com).' });
      return;
    }

    // Validación de contraseña
    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña temporal debe tener al menos 6 caracteres.' });
      return;
    }

    const res = await registerUser({
      nombre: trimmedName,
      apellido: trimmedApellido,
      email: trimmedEmail,
      password: formData.password,
      role: 'user'
    });

    if (res.success) {
      setMessage({
        type: 'success',
        text: '¡Cuenta de tipo cliente registrada con éxito! El usuario ya puede iniciar sesión.'
      });
      setFormData({ name: '', apellido: '', email: '', password: '' });
    } else {
      setMessage({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="space-y-6 text-antracita">

      {/* Encabezado del formulario */}
      <header className="border-b border-neutral-200 pb-5">
        <h1 className="text-2xl font-extrabold text-antracita font-title">Agregar Usuario</h1>
        <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mt-1">Registra nuevos perfiles en el sistema (solo con rol user)</p>
      </header>

      {/* Mensaje de resultado (éxito en verde, error en rojo) */}
      {message.text && (
        <div className={`p-4 rounded-lg text-xs font-bold max-w-2xl shadow-sm ${
          message.type === 'success'
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
            : 'bg-red-50 border border-red-200 text-red-500'
        }`}>
          {message.text}
        </div>
      )}

      {/* Tarjeta con el formulario */}
      <section className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 max-w-2xl shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            label="Correo Electrónico"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="juan@tshirt.com"
            required
          />

          {/* Contraseña temporal que el usuario debería cambiar al ingresar */}
          <Input
            label="Contraseña Temporal"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Min. 4 caracteres"
            required
          />

          <hr className="border-neutral-100 pt-2" />

          {/* Botones de acción */}
          <div className="flex space-x-4">
            <div className="w-1/3">
              {/* Cancelar vuelve al panel de ventas sin guardar */}
              <Link to="/admin/sales">
                <Button variant="secondary">Cancelar</Button>
              </Link>
            </div>
            <div className="w-2/3">
              <Button type="submit" variant="primary">
                Guardar Usuario
              </Button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}

export default AdminUserAdd;
