import { Link } from 'react-router-dom';

function RegisterSuccess() {
  const handleImageError = (e) => {
    e.target.src = "/assets/success.svg";
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-neutral-200/80 flex flex-col md:flex-row min-h-[420px]">
        {/* Left Side: Jersey & Plant Visual */}
        <div className="md:w-1/2 relative bg-neutral-900 overflow-hidden min-h-[250px] md:min-h-auto">
          {/* Argentina shirt image mockup */}
          <img
            src="/assets/success.svg"
            alt="Camiseta de Argentina albiceleste titular al lado de una maceta"
            className="absolute inset-0 w-full h-full object-cover opacity-80"
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900/10 to-transparent" />
          
          {/* Visual confirmation badge */}
          <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-white/90 backdrop-blur-sm border border-neutral-200 text-antracita flex items-center space-x-3.5 shadow-md">
            <img src="/assets/Background (1).svg" alt="Check" className="w-9 h-9 object-contain" />
            <div>
              <p className="text-sm font-bold font-title">¡Ya eres parte!</p>
              <p className="text-[10px] text-neutral-500">Tu pasaje al fútbol está listo.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Welcome Actions */}
        <div className="md:w-1/2 p-8 sm:p-12 flex flex-col justify-center space-y-6 bg-white">
          <div className="space-y-1.5">
            <span className="inline-block bg-emerald-100 text-emerald-700 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md">
              Bienvenido
            </span>
            <h1 className="text-2xl font-extrabold text-antracita font-title">Cuenta creada con éxito</h1>
            <p className="text-xs text-neutral-450 leading-relaxed">
              Tu historia en el campo comienza hoy. Explora nuestra selección exclusiva de camisetas y equipamiento oficial.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/catalog"
              className="flex-1 text-center bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-lg shadow-sm hover:shadow-primary/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Empezar a comprar</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              to="/profile"
              className="sm:w-36 text-center bg-neutral-100 border border-neutral-250 hover:bg-neutral-200 text-antracita font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Ver Perfil</span>
            </Link>
          </div>

          <div className="border-t border-neutral-100 pt-4 text-center">
            <p className="text-xs text-neutral-500 font-semibold flex items-center justify-center space-x-1.5">
              <img src="/assets/Icon (3).svg" alt="Envío" className="w-4 h-4 object-contain inline-block" />
              <span>Envío gratuito en tu primera compra premium.</span>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default RegisterSuccess;
