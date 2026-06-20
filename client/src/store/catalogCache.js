const PRODUCTS_CACHE_KEY = 'mundialista_catalog_products_v2';
const OPTIONS_CACHE_KEY = 'mundialista_catalog_options_v1';
const PRODUCTS_MAX_AGE_MS = 30 * 60 * 1000;
const OPTIONS_MAX_AGE_MS = 24 * 60 * 60 * 1000;

function readCache(key, maxAgeMs, isValidValue) {
  try {
    const rawValue = localStorage.getItem(key);
    if (!rawValue) return null;

    const cached = JSON.parse(rawValue);
    const isValid = cached
      && Number.isFinite(cached.savedAt)
      && Date.now() - cached.savedAt < maxAgeMs
      && isValidValue(cached.value);

    if (!isValid) {
      localStorage.removeItem(key);
      return null;
    }

    return cached.value;
  } catch {
    try {
      localStorage.removeItem(key);
    } catch {
      // El navegador puede bloquear completamente el acceso al almacenamiento.
    }
    return null;
  }
}

function writeCache(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify({
      savedAt: Date.now(),
      value
    }));
  } catch {
    // Si localStorage no está disponible, Redux sigue funcionando en memoria.
  }
}

export function getCachedProducts() {
  return readCache(
    PRODUCTS_CACHE_KEY,
    PRODUCTS_MAX_AGE_MS,
    (products) => Array.isArray(products)
      && products.every((product) => (
        product
        && Array.isArray(product.variants)
        && product.stock
        && typeof product.stock === 'object'
      ))
  );
}

export function cacheProducts(products) {
  writeCache(PRODUCTS_CACHE_KEY, products);
}

export function getCachedCatalogOptions() {
  return readCache(
    OPTIONS_CACHE_KEY,
    OPTIONS_MAX_AGE_MS,
    (value) => value
      && Array.isArray(value.countries)
      && Array.isArray(value.types)
      && Array.isArray(value.genders)
      && Array.isArray(value.sizes)
  );
}

export function cacheCatalogOptions(options) {
  writeCache(OPTIONS_CACHE_KEY, options);
}
