const PRODUCTS_CACHE_KEY = 'mundialista_catalog_products_v1';
const OPTIONS_CACHE_KEY = 'mundialista_catalog_options_v1';
const PRODUCTS_MAX_AGE_MS = 30 * 60 * 1000;
const OPTIONS_MAX_AGE_MS = 24 * 60 * 60 * 1000;

function readCache(key, maxAgeMs) {
  try {
    const rawValue = localStorage.getItem(key);
    if (!rawValue) return null;

    const cached = JSON.parse(rawValue);
    const isValid = cached
      && Array.isArray(cached.value)
      && Number.isFinite(cached.savedAt)
      && Date.now() - cached.savedAt < maxAgeMs;

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
  return readCache(PRODUCTS_CACHE_KEY, PRODUCTS_MAX_AGE_MS);
}

export function cacheProducts(products) {
  writeCache(PRODUCTS_CACHE_KEY, products);
}

export function getCachedCatalogOptions() {
  const entries = readCache(OPTIONS_CACHE_KEY, OPTIONS_MAX_AGE_MS);
  return entries?.[0] || null;
}

export function cacheCatalogOptions(options) {
  writeCache(OPTIONS_CACHE_KEY, [options]);
}
