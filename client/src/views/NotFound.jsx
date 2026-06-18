import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <main className="max-w-md mx-auto px-4 py-24 text-center space-y-6 flex flex-col items-center text-antracita bg-cream min-h-screen">
      <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-antracita tracking-widest font-mono select-none">
        404
      </div>

      <div className="space-y-2">
        <h1 className="text-xl font-bold font-title">Camiseta Agotada o Página No Encontrada</h1>
        <p className="text-xs text-neutral-500 leading-relaxed max-w-sm mx-auto font-semibold">
          El diseño o enlace que estás buscando no existe, ha cambiado de dirección o fue removido por fin de temporada de Mundialista Store.
        </p>
      </div>

      <div className="pt-2">
        <Link
          to="/"
          className="inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-6 rounded-lg shadow-md hover:shadow-primary/20 transition-all cursor-pointer"
        >
          Volver al Inicio
        </Link>
      </div>
    </main>
  );
}

export default NotFound;
