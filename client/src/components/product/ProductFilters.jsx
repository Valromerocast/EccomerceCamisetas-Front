import React from 'react';

function ProductFilters({ filters, setFilters, categories = [], sizes = [], colors = [] }) {
  const handleCategoryChange = (category) => {
    setFilters((prev) => ({
      ...prev,
      category: prev.category === category ? '' : category
    }));
  };

  const handleSizeChange = (size) => {
    setFilters((prev) => ({
      ...prev,
      size: prev.size === size ? '' : size
    }));
  };

  const handleColorChange = (color) => {
    setFilters((prev) => ({
      ...prev,
      color: prev.color === color ? '' : color
    }));
  };

  const handlePriceChange = (e) => {
    const value = parseFloat(e.target.value);
    setFilters((prev) => ({
      ...prev,
      maxPrice: value
    }));
  };

  const handleSortChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: e.target.value
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      size: '',
      color: '',
      maxPrice: 150, // default max price
      sortBy: 'default'
    });
  };

  return (
    <aside className="bg-white border border-neutral-200/80 rounded-xl p-5 space-y-6 lg:sticky lg:top-20 shadow-sm text-antracita">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold tracking-wider uppercase text-antracita font-title">Filtros</h2>
        <button
          onClick={resetFilters}
          className="text-xs text-primary hover:text-primary/80 font-bold cursor-pointer"
        >
          Limpiar todos
        </button>
      </div>

      <hr className="border-neutral-100" />

      {/* Sorting */}
      <div className="space-y-2">
        <label htmlFor="sortBy" className="text-[10px] font-bold text-neutral-500 tracking-wider uppercase">
          Ordenar Por
        </label>
        <select
          id="sortBy"
          value={filters.sortBy}
          onChange={handleSortChange}
          className="w-full bg-cream border border-neutral-250 text-antracita text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary cursor-pointer shadow-inner"
        >
          <option value="default">Recomendados</option>
          <option value="price-asc">Precio: Menor a Mayor</option>
          <option value="price-desc">Precio: Mayor a Menor</option>
          <option value="rating">Calificación</option>
          <option value="name-asc">Nombre: A-Z</option>
        </select>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-neutral-500 tracking-wider uppercase block">Colecciones</span>
        <div className="flex flex-col space-y-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`text-left text-xs py-1.5 px-3 rounded-md transition-colors cursor-pointer border ${
                filters.category === cat
                  ? 'bg-primary text-white border-primary font-semibold shadow-sm'
                  : 'bg-cream hover:bg-neutral-200/70 border-neutral-200 text-antracita'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-neutral-500 tracking-wider uppercase block">Talles</span>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => handleSizeChange(size)}
              className={`w-9 h-9 flex items-center justify-center text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                filters.size === size
                  ? 'bg-primary border-primary text-white shadow-sm'
                  : 'bg-cream border-neutral-200 text-antracita hover:border-neutral-350'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-neutral-500 tracking-wider uppercase block">Colores</span>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => handleColorChange(color)}
              className={`text-xs py-1 px-3 rounded-full border transition-all cursor-pointer ${
                filters.color === color
                  ? 'bg-primary border-primary text-white shadow-sm'
                  : 'bg-cream border-neutral-200 text-antracita hover:border-neutral-350'
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-neutral-500 tracking-wider uppercase text-[10px]">Precio Máximo</span>
          <span className="text-primary font-bold">${filters.maxPrice}</span>
        </div>
        <input
          type="range"
          min="40"
          max="150"
          step="5"
          value={filters.maxPrice}
          onChange={handlePriceChange}
          className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
        />
        <div className="flex justify-between text-[10px] text-neutral-500 font-bold">
          <span>$40</span>
          <span>$150</span>
        </div>
      </div>
    </aside>
  );
}

export default ProductFilters;
