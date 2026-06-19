import { useEffect, useMemo, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import ProductFilters from '../components/product/ProductFilters';
import ProductGrid from '../components/product/ProductGrid';
import { fetchCatalogOptions } from '../services/api';
import { useScrollOnMessage } from '../components/ui/useScrollOnMessage';
import { useSelector } from 'react-redux';
import { selectFavorites, selectProducts, selectUser } from '../store/selectors';
import { useShopActions } from '../store/useShopActions';
import {
  cacheCatalogOptions,
  getCachedCatalogOptions
} from '../store/catalogCache';

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
const EMPTY_CATALOG_OPTIONS = {
  countries: [],
  types: [],
  genders: [],
  sizes: []
};
function Catalog() {
  const user = useSelector(selectUser);
  const products = useSelector(selectProducts);
  const productsLoading = useSelector((state) => state.products.loading);
  const productsError = useSelector((state) => state.products.error);
  const favorites = useSelector(selectFavorites);
  const { addToCart, toggleFavorite } = useShopActions();
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
  const [catalogError, setCatalogError] = useState('');
  const [catalogOptionsState, setCatalogOptionsState] = useState(() => {
    const cachedOptions = getCachedCatalogOptions();
    return {
      options: cachedOptions || EMPTY_CATALOG_OPTIONS,
      loading: !cachedOptions
    };
  });
  const { options, loading: optionsLoading } = catalogOptionsState;

  const minimum = filters.minPrice === '' ? null : Number(filters.minPrice);
  const maximum = filters.maxPrice === '' ? null : Number(filters.maxPrice);
  const priceError = minimum !== null && maximum !== null && minimum > maximum
    ? 'El precio minimo no puede ser mayor que el maximo.'
    : '';

  useEffect(() => {
    if (!optionsLoading) {
      return undefined;
    }

    const controller = new AbortController();

    async function loadOptions() {
      try {
        const result = await fetchCatalogOptions({ signal: controller.signal });
        cacheCatalogOptions(result);
        setCatalogOptionsState({ options: result, loading: false });
      } catch (error) {
        if (error.name !== 'AbortError') {
          setCatalogError('No se pudieron cargar las opciones de filtro.');
          setCatalogOptionsState((current) => ({ ...current, loading: false }));
        }
      }
    }

    loadOptions();
    return () => controller.abort();
  }, [optionsLoading]);

  const availableCountries = useMemo(() => {
    const countryNames = new Set(products.map((product) => product.country));
    return options.countries.filter((country) => countryNames.has(country.nombre));
  }, [options.countries, products]);

  const availableGenders = options.genders;

  const availableSizes = useMemo(() => {
    const sizeNames = new Set(products.flatMap((product) => product.sizes));
    return options.sizes.filter((size) => sizeNames.has(size.nombre));
  }, [options.sizes, products]);

  const selectedCountry = options.countries.find(
    (country) => String(country.id) === String(filters.countryId)
  )?.nombre;
  const selectedGender = options.genders.find(
    (gender) => String(gender.id) === String(filters.genderId)
  )?.nombre;
  const filteredCatalogProducts = useMemo(() => {
    if (priceError) return [];

    const search = filters.search.trim().toLowerCase();
    const normalizeGender = (value) => (
      String(value || '').trim().toLowerCase() === 'hombre'
        ? 'masculino'
        : String(value || '').trim().toLowerCase()
    );
    const filtered = products.filter((product) => {
      const matchesSearch = !search || [
        product.name,
        product.subtitle,
        product.country,
        product.description
      ].some((value) => String(value || '').toLowerCase().includes(search));
      const matchesCategory = !filters.category
        || filters.category === 'favoritos'
        || product.category === filters.category;
      const matchesCountry = !selectedCountry || product.country === selectedCountry;
      const matchesGender = !selectedGender
        || normalizeGender(product.gender) === normalizeGender(selectedGender);
      const matchesSize = !filters.size || Number(product.stock?.[filters.size]) > 0;
      const matchesMinimum = minimum === null || product.price >= minimum;
      const matchesMaximum = maximum === null || product.price <= maximum;

      return matchesSearch
        && matchesCategory
        && matchesCountry
        && matchesGender
        && matchesSize
        && matchesMinimum
        && matchesMaximum;
    });

    return [...filtered].sort((left, right) => {
      if (filters.sortBy === 'price-asc') return left.price - right.price;
      if (filters.sortBy === 'price-desc') return right.price - left.price;
      if (filters.sortBy === 'name-asc') return left.name.localeCompare(right.name);
      if (filters.sortBy === 'name-desc') return right.name.localeCompare(left.name);
      return 0;
    });
  }, [
    filters,
    maximum,
    minimum,
    priceError,
    products,
    selectedCountry,
    selectedGender
  ]);
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

  const loading = !priceError && productsLoading && products.length === 0;
  const error = priceError || catalogError || productsError;
  useScrollOnMessage(error);

  if (filters.category === 'favoritos' && user?.role !== 'user') {
    return <Navigate to={user ? '/catalog' : '/login'} replace />;
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-cream text-antracita min-h-screen">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold font-title">{title}</h1>
        <p className="text-sm text-neutral-500 max-w-2xl">
          Filtra por seleccion, tipo, genero, talle disponible y precio.
        </p>
      </header>

      <div className={`grid gap-8 items-start ${
        filters.category === 'favoritos'
          ? 'grid-cols-1'
          : 'grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)]'
        }`}>
        {filters.category !== 'favoritos' && (
        <ProductFilters
          filters={filters}
          onChange={handleFilterChange}
          onReset={resetFilters}
          countries={availableCountries}
          genders={availableGenders}
          sizes={availableSizes}
          disabled={optionsLoading}
        />
      )}

        <section className="min-w-0 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-300 pb-3">
            <span className="text-xs font-bold text-neutral-500 tracking-wider uppercase">
              {loading ? 'Actualizando...' : `${displayedProducts.length} articulos encontrados`}
            </span>

            {filters.category !== 'favoritos' && (
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
)}
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
              user={user}
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
