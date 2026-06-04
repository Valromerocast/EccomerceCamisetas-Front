// Pie de página de la tienda
// Muestra el nombre de la marca, el año actual (dinámico) y links a páginas legales
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-neutral-200/50 text-antracita/70 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-antracita/70">

          {/* Bloque izquierdo: nombre de la tienda y copyright */}
          <div className="text-center md:text-left space-y-1">
            <h3 className="text-primary text-base font-bold tracking-tight font-title">
              Mundialista <span className="text-antracita">Store</span>
            </h3>
            {/* El año se genera automáticamente para no tener que actualizarlo a mano cada año */}
            <p className="text-[11px] text-antracita/60">
              &copy; {new Date().getFullYear()} Mundialista Store. Todos los derechos reservados.
            </p>
            <p className="text-[11px] text-antracita/60">
              Rooted in the game.
            </p>
          </div>

          {/* Bloque derecho: links a páginas de información */}
          <div className="mt-6 md:mt-0 flex flex-wrap justify-center gap-x-6 gap-y-2 font-semibold">
            <Link to="/contact" className="hover:text-primary transition-colors">Contacto</Link>
            <Link to="/terms-conditions" className="hover:text-primary transition-colors">Términos y condiciones</Link>
            <Link to="/privacy-policy" className="hover:text-primary transition-colors">Política de Privacidad</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
