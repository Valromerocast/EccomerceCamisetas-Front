function ProductFilters({
  filters,
  onChange,
  onReset,
  countries = [],
  genders = [],
  sizes = [],
  disabled = false
}) {
  const update = (field, value) => {
    onChange({ [field]: value });
  };

  return (
    <aside className="bg-white border border-neutral-200 rounded-lg p-5 space-y-5 lg:sticky lg:top-20 shadow-sm text-antracita">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-bold tracking-wider uppercase font-title">Filtros</h2>
        <button
          type="button"
          onClick={onReset}
          disabled={disabled}
          className="text-xs text-primary hover:text-primary/80 font-bold disabled:opacity-50 cursor-pointer"
        >
          Limpiar
        </button>
      </div>

      <div className="space-y-2">
        <label htmlFor="catalogSearch" className="text-[10px] font-bold text-neutral-500 tracking-wider uppercase">
          Buscar
        </label>
        <input
          id="catalogSearch"
          type="search"
          value={filters.search}
          onChange={(event) => update('search', event.target.value)}
          placeholder="Pais o camiseta"
          disabled={disabled}
          className="w-full bg-cream border border-neutral-200 text-antracita text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary disabled:opacity-60"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="categoryFilter" className="text-[10px] font-bold text-neutral-500 tracking-wider uppercase">
          Tipo
        </label>
        <select
          id="categoryFilter"
          value={filters.category}
          onChange={(event) => update('category', event.target.value)}
          disabled={disabled}
          className="w-full bg-cream border border-neutral-200 text-antracita text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary cursor-pointer disabled:opacity-60"
        >
          <option value="">Todos</option>
          <option value="Titulares">Titulares</option>
          <option value="Suplentes">Alternativas</option>
          <option value="favoritos">Favoritos</option>
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="countryFilter" className="text-[10px] font-bold text-neutral-500 tracking-wider uppercase">
          Pais
        </label>
        <select
          id="countryFilter"
          value={filters.countryId}
          onChange={(event) => update('countryId', event.target.value)}
          disabled={disabled}
          className="w-full bg-cream border border-neutral-200 text-antracita text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary cursor-pointer disabled:opacity-60"
        >
          <option value="">Todos los paises</option>
          {countries.map((country) => (
            <option key={country.id} value={country.id}>
              {country.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="genderFilter" className="text-[10px] font-bold text-neutral-500 tracking-wider uppercase">
          Genero
        </label>
        <select
          id="genderFilter"
          value={filters.genderId}
          onChange={(event) => update('genderId', event.target.value)}
          disabled={disabled}
          className="w-full bg-cream border border-neutral-200 text-antracita text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary cursor-pointer disabled:opacity-60"
        >
          <option value="">Todos</option>
          {genders.map((gender) => (
            <option key={gender.id} value={gender.id}>
              {gender.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-bold text-neutral-500 tracking-wider uppercase block">
          Talle con stock
        </span>
        <div className="grid grid-cols-4 gap-2">
          {sizes.map((size) => (
            <button
              key={size.id}
              type="button"
              onClick={() => update('size', filters.size === size.nombre ? '' : size.nombre)}
              disabled={disabled}
              className={`h-9 text-xs font-bold rounded-lg border transition-colors cursor-pointer disabled:opacity-50 ${
                filters.size === size.nombre
                  ? 'bg-primary border-primary text-white'
                  : 'bg-cream border-neutral-200 text-antracita hover:border-primary'
              }`}
            >
              {size.nombre}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-bold text-neutral-500 tracking-wider uppercase block">
          Rango de precio
        </span>
        <div className="grid grid-cols-2 gap-2">
          <label className="space-y-1 text-[10px] text-neutral-500 font-semibold">
            <span>Minimo</span>
            <input
              type="number"
              min="0"
              step="5"
              value={filters.minPrice}
              onChange={(event) => update('minPrice', event.target.value)}
              disabled={disabled}
              className="w-full bg-cream border border-neutral-200 text-antracita text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
            />
          </label>
          <label className="space-y-1 text-[10px] text-neutral-500 font-semibold">
            <span>Maximo</span>
            <input
              type="number"
              min="0"
              step="5"
              value={filters.maxPrice}
              onChange={(event) => update('maxPrice', event.target.value)}
              disabled={disabled}
              className="w-full bg-cream border border-neutral-200 text-antracita text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
            />
          </label>
        </div>
      </div>
    </aside>
  );
}

export default ProductFilters;
