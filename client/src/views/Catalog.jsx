// Vista del catálogo de productos
// Maneja el filtrado por búsqueda, categoría, talle y color, y el ordenamiento.
// Los filtros se sincronizan con los parámetros de la URL para que se pueda compartir el link filtrado.
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductGrid from '../components/product/ProductGrid';

function Catalog({ products = [], addToCart }) {
  const [searchParams] = useSearchParams();

  // Leo los parámetros de búsqueda y categoría desde la URL
  const urlQuery = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';

  // Estado local con todos los filtros activos
  const [filters, setFilters] = useState({
    search: urlQuery,
    category: categoryParam,
    size: '',
    color: '',
    sortBy: 'default'
  });

  // Cada vez que cambia la URL (ej: usuario hace una nueva búsqueda desde la Navbar),
  // actualizo los filtros de búsqueda y categoría para reflejar el nuevo estado
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      search: urlQuery,
      category: categoryParam
    }));
  }, [urlQuery, categoryParam]);

  // Extraigo los valores únicos de categoría, talles y colores de todos los productos
  // para armar los selectores dinámicamente (sin hardcodear las opciones)
  const categories = [...new Set(products.map((p) => p.category))];
  const sizes = [...new Set(products.flatMap((p) => p.sizes))];
  const colors = [...new Set(products.flatMap((p) => p.colors))];

  // Aplico todos los filtros activos al array de productos
  const filteredProducts = products.filter((product) => {
    // Coincidencia por texto de búsqueda (nombre o descripción, sin importar mayúsculas)
    const matchesSearch =
      !filters.search ||
      product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      product.description.toLowerCase().includes(filters.search.toLowerCase());

    // Coincidencia por categoría (Titulares o Suplentes)
    const matchesCategory = !filters.category || product.category === filters.category;

    // Coincidencia por talle seleccionado
    const matchesSize = !filters.size || product.sizes.includes(filters.size);

    // Coincidencia por color seleccionado
    const matchesColor = !filters.color || product.colors.includes(filters.color);

    return matchesSearch && matchesCategory && matchesSize && matchesColor;
  });

  // Ordeno los productos filtrados según la opción seleccionada en el selector
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (filters.sortBy) {
      case 'price-asc':
        return a.price - b.price;    // precio de menor a mayor
      case 'price-desc':
        return b.price - a.price;    // precio de mayor a menor
      case 'rating':
        return b.rating - a.rating;  // mejor puntuación primero
      case 'name-asc':
        return a.name.localeCompare(b.name);  // orden alfabético
      default:
        return 0;  // sin ordenamiento extra, mantiene el orden original
    }
  });

  // Título dinámico de la página según la categoría filtrada
  const getCategoryTitle = () => {
    if (filters.category === 'Titulares') return 'Camisetas Principales';
    if (filters.category === 'Suplentes') return 'Camisetas Suplentes';
    return 'Catálogo General';
  };

  // Descripción dinámica de la página según la categoría filtrada
  const getCategoryDescription = () => {
    if (filters.category === 'Suplentes') {
      return 'Descubre la elegancia de los colores alternativos. Diseños que desafían la tradición y capturan la esencia de cada nación fuera de casa.';
    }
    if (filters.category === 'Titulares') {
      return 'Viste la gloria local. Diseños clásicos inspirados en la historia, la pasión y los colores tradicionales que definen a cada selección en casa.';
    }
    return 'Explora la colección oficial de camisetas de las selecciones nacionales para el Mundial 2026. Diseños exclusivos confeccionados con tejido transpirable premium.';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 bg-cream text-antracita min-h-screen">

      {/* Encabezado de la sección: título y descripción según categoría */}
      <header className="space-y-3.5">
        <h1 className="text-4xl font-bold text-antracita font-title tracking-tight">
          {getCategoryTitle()}
        </h1>
        <p className="text-sm text-neutral-500 max-w-2xl leading-relaxed">
          {getCategoryDescription()}
        </p>
      </header>

      {/* Barra de herramientas: contador de artículos y selector de ordenamiento */}
      <div className="flex items-center justify-between border-b border-neutral-300 pb-3 text-[10px] sm:text-xs font-bold text-neutral-500 tracking-wider uppercase">
        {/* Muestra cuántos productos coinciden con los filtros activos */}
        <span>{sortedProducts.length} ARTÍCULOS ENCONTRADOS</span>

        {/* Selector de ordenamiento */}
        <div className="flex items-center space-x-1.5 text-neutral-500 font-semibold normal-case">
          <span>Ordenar por:</span>
          <div className="relative inline-block">
            <select
              id="sortBy"
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="appearance-none bg-transparent pr-5 py-0.5 font-bold text-antracita focus:outline-none cursor-pointer text-xs"
            >
              <option value="default">Destacados</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
              <option value="name-asc">Nombre: A-Z</option>
            </select>
            {/* Flechita decorativa del select */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-antracita">
              <svg className="w-3 h-3 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Área principal: chip de búsqueda activa + grilla de productos */}
      <div className="space-y-6">
        {/* Si hay una búsqueda activa, la muestro como un chip con botón para quitarla */}
        {filters.search && (
          <div className="flex items-center space-x-2 text-xs text-antracita/80 bg-white py-2.5 px-4 border border-neutral-200 rounded-lg shadow-sm">
            <span>Resultado de búsqueda para: </span>
            <strong className="text-primary font-bold">"{filters.search}"</strong>
            <button
              onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
              className="ml-auto text-[9px] font-bold bg-cream hover:bg-neutral-200 text-antracita uppercase px-2 py-0.5 rounded cursor-pointer border border-neutral-250"
            >
              Quitar
            </button>
          </div>
        )}
        {/* Grilla con los productos ya filtrados y ordenados */}
        <ProductGrid products={sortedProducts} addToCart={addToCart} />
      </div>
    </div>
  );
}

export default Catalog;
