// Grilla de productos
// Recibe el array de productos ya filtrados y los muestra en una cuadrícula responsive.
// Si no hay productos que mostrar, muestra un estado vacío en lugar de dejar la página en blanco.
import ProductCard from './ProductCard';

function ProductGrid({ products = [], addToCart }) {

  // Estado vacío: cuando no hay resultados que mostrar
  if (products.length === 0) {
    return (
      <section className="text-center py-16 bg-white border border-neutral-200/80 rounded-xl px-4 flex flex-col items-center justify-center space-y-4 shadow-sm text-antracita">
        {/* Ícono de cara triste para el estado vacío */}
        <svg className="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-base font-bold font-title">No se encontraron camisetas</h3>
        <p className="text-xs text-neutral-500 max-w-sm">
          Prueba a cambiar tus términos de búsqueda o a modificar los filtros de precio en la parte superior.
        </p>
      </section>
    );
  }

  // Grilla responsive: 1 columna en mobile, 2 en tablet, 3 en pantallas medianas, 4 en desktop
  return (
    <section>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            addToCart={addToCart}
          />
        ))}
      </div>
    </section>
  );
}

export default ProductGrid;
