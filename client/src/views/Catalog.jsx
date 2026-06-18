import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductFilters from '../components/product/ProductFilters';
import ProductGrid from '../components/product/ProductGrid';
import { fetchCatalogOptions, fetchProducts } from '../services/api';

const DEFAULT_FILTERS = {
  search: '',
  category: '',
  countryId: '',
  genderId: '',
  size: '',
  minPrice: '',
  maxPrice: '',
  sortBy: 'default'
};

function Catalog({
  products = [],
  productsLoading = false,
  productsError = '',
  addToCart,
  favorites = [],
  toggleFavorite
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => ({
    ...DEFAULT_FILTERS,
    search: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    countryId: searchParams.get('country') || '',
    genderId: searchParams.get('gender') || '',
    size: searchParams.get('size') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sort') || 'default'
  }), [searchParams]);
  const [catalogProducts, setCatalogProducts] = useState(products);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState('');
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [options, setOptions] = useState({
    countries: [],
    types: [],
    genders: [],
    sizes: []
  });

  const minimum = filters.minPrice === '' ? null : Number(filters.minPrice);
  const maximum = filters.maxPrice === '' ? null : Number(filters.maxPrice);
  const priceError = minimum !== null && maximum !== null && minimum > maximum
    ? 'El precio minimo no puede ser mayor que el maximo.'
    : '';

  useEffect(() => {
    const controller = new AbortController();

    async function loadOptions() {
      try {
        const result = await fetchCatalogOptions({ signal: controller.signal });
        setOptions(result);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setCatalogError('No se pudieron cargar las opciones de filtro.');
        }
      } finally {
        setOptionsLoading(false);
      }
    }

    loadOptions();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (optionsLoading) {
      return undefined;
    }

    if (priceError) {
      return undefined;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setCatalogLoading(true);
      setCatalogError('');

      const typeName = filters.category === 'Titulares'
        ? 'Titular'
        : filters.category === 'Suplentes'
          ? 'Alternativa'
          : '';
      const type = options.types.find(
        (item) => item.nombre.toLowerCase() === typeName.toLowerCase()
      );

      try {
        const result = await fetchProducts({
          search: filters.search,
          countryId: filters.countryId,
          typeId: type?.id || '',
          genderId: filters.genderId,
          size: filters.size,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          sortBy: filters.sortBy
        }, { signal: controller.signal });

        if (!controller.signal.aborted) {
          setCatalogProducts(result);
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          setCatalogProducts([]);
          setCatalogError('No se pudo actualizar el catalogo.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setCatalogLoading(false);
        }
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [filters, options.types, optionsLoading, priceError]);

  const availableCountries = useMemo(() => {
    const countryNames = new Set(products.map((product) => product.country));
    return options.countries.filter((country) => countryNames.has(country.nombre));
  }, [options.countries, products]);

  const availableGenders = useMemo(() => {
    const genderNames = new Set(products.map((product) => product.gender));
    return options.genders.filter((gender) => genderNames.has(gender.nombre));
  }, [options.genders, products]);

  const availableSizes = useMemo(() => {
    const sizeNames = new Set(products.flatMap((product) => product.sizes));
    return options.sizes.filter((size) => sizeNames.has(size.nombre));
  }, [options.sizes, products]);

  const hasActiveFilters = Boolean(
    filters.search
    || filters.category
    || filters.countryId
    || filters.genderId
    || filters.size
    || filters.minPrice !== ''
    || filters.maxPrice !== ''
    || filters.sortBy !== 'default'
  );
  const currentCatalogProducts = hasActiveFilters ? catalogProducts : products;
  const filteredCatalogProducts = priceError ? [] : currentCatalogProducts;
  const displayedProducts = filters.category === 'favoritos'
    ? filteredCatalogProducts.filter((product) => favorites.includes(product.id))
    : filteredCatalogProducts;

  const syncUrl = (nextFilters) => {
    const params = new URLSearchParams();

    if (nextFilters.search.trim()) params.set('q', nextFilters.search.trim());
    if (nextFilters.category) params.set('category', nextFilters.category);
    if (nextFilters.countryId) params.set('country', nextFilters.countryId);
    if (nextFilters.genderId) params.set('gender', nextFilters.genderId);
    if (nextFilters.size) params.set('size', nextFilters.size);
    if (nextFilters.minPrice !== '') params.set('minPrice', nextFilters.minPrice);
    if (nextFilters.maxPrice !== '') params.set('maxPrice', nextFilters.maxPrice);
    if (nextFilters.sortBy !== 'default') params.set('sort', nextFilters.sortBy);

    setSearchParams(params, { replace: true });
  };

  const handleFilterChange = (patch) => {
    const nextFilters = { ...filters, ...patch };
    syncUrl(nextFilters);
  };

  const resetFilters = () => {
    setSearchParams({}, { replace: true });
  };

  const title = filters.category === 'Titulares'
    ? 'Camisetas Titulares'
    : filters.category === 'Suplentes'
      ? 'Camisetas Alternativas'
      : filters.category === 'favoritos'
        ? 'Mis Favoritas'
        : 'Catalogo de Camisetas';

  const loading = !priceError && (catalogLoading || (productsLoading && products.length === 0));
  const error = priceError || catalogError || productsError;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-cream text-antracita min-h-screen">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold font-title">{title}</h1>
        <p className="text-sm text-neutral-500 max-w-2xl">
          Filtra por seleccion, tipo, genero, talle disponible y precio.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-8 items-start">
        <ProductFilters
          filters={filters}
          onChange={handleFilterChange}
          onReset={resetFilters}
          countries={availableCountries}
          genders={availableGenders}
          sizes={availableSizes}
          disabled={optionsLoading}
        />

        <section className="min-w-0 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-300 pb-3">
            <span className="text-xs font-bold text-neutral-500 tracking-wider uppercase">
              {loading ? 'Actualizando...' : `${displayedProducts.length} articulos encontrados`}
            </span>

            <label className="flex items-center gap-2 text-xs text-neutral-500 font-semibold">
              <span>Ordenar por</span>
              <select
                value={filters.sortBy}
                onChange={(event) => handleFilterChange({ sortBy: event.target.value })}
                className="bg-white border border-neutral-200 rounded-lg px-3 py-2 text-antracita font-bold focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="default">Destacados</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
                <option value="name-asc">Nombre: A-Z</option>
                <option value="name-desc">Nombre: Z-A</option>
              </select>
            </label>
          </div>

          {error && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-3 text-sm font-semibold">
              {error}
            </div>
          )}

          {loading && displayedProducts.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded-lg px-4 py-16 text-center text-sm text-neutral-500">
              Cargando camisetas...
            </div>
          ) : (
            <ProductGrid
              products={displayedProducts}
              addToCart={addToCart}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              onClearFilters={resetFilters}
            />
          )}
        </section>
      </div>
    </main>
  );
}

export default Catalog;
