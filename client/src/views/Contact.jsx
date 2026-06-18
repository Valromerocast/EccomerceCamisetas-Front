import { useState } from 'react';
import { Input, Select, Button } from '../components/ui/Form';
import { useScrollOnMessage } from '../components/ui/useScrollOnMessage';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  useScrollOnMessage(error || (submitted ? 'success' : ''));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSubmitted(false);

    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedMessage = formData.message.trim();

    // Verificación de campos vacíos
    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    // Validación del nombre completo
    if (trimmedName.length < 3) {
      setError('El nombre completo debe tener al menos 3 caracteres.');
      return;
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(trimmedName)) {
      setError('El nombre completo solo debe contener letras y espacios.');
      return;
    }

    // Validación de formato de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('El correo electrónico no tiene un formato válido (ej: usuario@correo.com).');
      return;
    }

    // Validación de longitud del mensaje
    if (trimmedMessage.length < 10) {
      setError('El mensaje debe tener al menos 10 caracteres.');
      return;
    }

    setSubmitted(true);
    setFormData({ name: '', email: '', subject: 'general', message: '' });
  };

  const subjectOptions = [
    { value: 'general', label: 'Consulta General' },
    { value: 'envio', label: 'Seguimiento de Envío' },
    { value: 'talle', label: 'Consultas de Talle y Stock' },
    { value: 'devolucion', label: 'Devoluciones y Cambios' }
  ];

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-cream text-antracita min-h-screen">
      {/* Header section */}
      <header className="space-y-2 border-b border-neutral-350/40 pb-5">
        <h1 className="text-3xl font-extrabold text-antracita font-title">Hablemos de historia</h1>
        <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">
          Cada prenda en nuestra colección cuenta un relato de gloria y pasión. Si tienes dudas sobre nuestras piezas de herencia o necesitas asistencia personalizada, nuestro equipo está aquí para acompañarte.
        </p>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-500 p-4 rounded-xl text-xs font-bold max-w-2xl mx-auto text-center shadow-sm">
          {error}
        </div>
      )}

      {submitted && (
        <div className="bg-emerald-100 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-bold max-w-2xl mx-auto text-center shadow-sm">
          ¡Mensaje enviado con éxito! Nos pondremos en contacto contigo a la brevedad.
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
        {/* Form Column (Left) */}
        <section className="md:col-span-7 bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 font-title">Envíanos un mensaje</h2>

            <Input
              label="Nombre Completo"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Juan Pérez"
              required
            />

            <Input
              label="Correo Electrónico"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="juan@ejemplo.com"
              required
            />

            <Select
              label="Asunto"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              options={subjectOptions}
              required
            />

            <div className="flex flex-col space-y-1.5 w-full">
              <label htmlFor="message" className="text-[10px] font-bold text-neutral-500 tracking-wider uppercase">
                Mensaje <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="¿Cómo podemos ayudarte hoy?"
                required
                rows={4}
                className="w-full bg-white border border-neutral-300 text-antracita text-xs rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary transition-all shadow-sm resize-y"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary">
                Enviar mensaje &rarr;
              </Button>
            </div>
          </form>
        </section>

        {/* Info Column (Right) */}
        <section className="md:col-span-5 space-y-6">
          {/* Football graphic placeholder card */}
          <div className="aspect-[16/10] bg-neutral-900 rounded-xl overflow-hidden shadow-md border border-neutral-200 relative">
            <img
              src="/assets/contact-image.svg"
              alt="Fotografía de ambientación de fútbol"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent flex items-end p-4">
              <span className="text-white text-[10px] uppercase font-bold tracking-widest bg-primary/80 backdrop-blur-sm px-2 py-0.5 rounded">
                Mundialista Store
              </span>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm space-y-4 text-xs font-semibold text-neutral-500">
            <div className="flex items-start space-x-3">
              <img src="/assets/location-icon.svg" alt="Ubicación" className="w-5 h-5 mt-0.5 object-contain" />
              <div>
                <h3 className="text-antracita font-bold font-title text-sm">Nuestras Oficinas</h3>
                <p className="mt-1 leading-relaxed text-neutral-450">
                  Av. del Libertador 1450, Recoleta<br />
                  C1425, Buenos Aires, Argentina
                </p>
              </div>
            </div>

            <hr className="border-neutral-100" />

            <div className="flex items-start space-x-3">
              <img src="/assets/email-icon.svg" alt="Email" className="w-5 h-5 mt-0.5 object-contain" />
              <div>
                <h3 className="text-antracita font-bold font-title text-sm">Correo Electrónico</h3>
                <p className="mt-1 text-primary hover:underline">
                  <a href="mailto:soporte@mundialista.com">soporte@mundialista.com</a>
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Contact;
