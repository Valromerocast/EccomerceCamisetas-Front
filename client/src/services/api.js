const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const SIZE_ORDER = ['S', 'M', 'L', 'XL'];

async function request(path, options = {}) {
  const headers = {
    Accept: 'application/json',
    ...options.headers
  };

  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Error ${response.status} al llamar a ${path}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function getCategory(camiseta) {
  const tipo = (camiseta.tipoCamiseta || '').toLowerCase();

  if (tipo.includes('supl') || tipo.includes('altern')) {
    return 'Suplentes';
  }

  return 'Titulares';
}

function getImage(camiseta) {
  const image = camiseta.imagen?.trim();
  return image && /^https?:\/\//i.test(image) ? image : null;
}

function mapVariants(variantes = []) {
  return variantes
    .filter((variante) => variante && variante.talle)
    .map((variante) => ({
      id: variante.id,
      camisetaId: variante.camisetaId,
      talle: variante.talle,
      stock: Number(variante.stock) || 0,
      sku: variante.sku,
      color: variante.color
    }))
    .sort((a, b) => {
      const aIndex = SIZE_ORDER.indexOf(a.talle);
      const bIndex = SIZE_ORDER.indexOf(b.talle);
      const normalizedA = aIndex === -1 ? SIZE_ORDER.length : aIndex;
      const normalizedB = bIndex === -1 ? SIZE_ORDER.length : bIndex;

      return normalizedA - normalizedB || a.talle.localeCompare(b.talle);
    });
}

function mapStockBySize(variantes = []) {
  return variantes.reduce((stock, variante) => {
    stock[variante.talle] = variante.stock;
    return stock;
  }, {});
}

function mapProduct(camiseta, variantes, index) {
  const mappedVariants = mapVariants(variantes);
  const sizes = [...new Set(mappedVariants.map((variante) => variante.talle))];
  const image = getImage(camiseta);
  const country = camiseta.pais || 'Seleccion';
  const kit = camiseta.tipoCamiseta || 'KIT';

  return {
    id: camiseta.id,
    name: camiseta.nombre || `Camiseta ${camiseta.id}`,
    subtitle: `${country} - ${kit}`,
    price: Number(camiseta.precio) || 0,
    description: camiseta.descripcion || 'Camiseta oficial de seleccion.',
    category: getCategory(camiseta),
    country,
    gender: camiseta.genero || 'Unisex',
    kit,
    sizes: sizes.length > 0 ? sizes : ['S', 'M', 'L', 'XL'],
    image,
    fallbackImage: null,
    rating: 5,
    reviewsCount: 0,
    stock: sizes.length > 0 ? mapStockBySize(mappedVariants) : { S: 0, M: 0, L: 0, XL: 0 },
    featured: index < 4,
    active: camiseta.activo !== false,
    variants: mappedVariants
  };
}

function appendQueryParam(params, key, value) {
  if (value !== undefined && value !== null && value !== '') {
    params.set(key, value);
  }
}

function uniqueByName(items = []) {
  const seen = new Set();

  return items
    .filter((item) => item?.nombre)
    .filter((item) => {
      const key = item.nombre.trim().toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

function sortSizes(items = []) {
  return [...items].sort((a, b) => {
    const aIndex = SIZE_ORDER.indexOf(a.nombre);
    const bIndex = SIZE_ORDER.indexOf(b.nombre);
    const normalizedA = aIndex === -1 ? SIZE_ORDER.length : aIndex;
    const normalizedB = bIndex === -1 ? SIZE_ORDER.length : bIndex;

    return normalizedA - normalizedB || a.nombre.localeCompare(b.nombre);
  });
}

export async function fetchCatalogOptions(options = {}) {
  const [countries, types, genders, sizes] = await Promise.all([
    request('/api/catalogo/paises', options),
    request('/api/catalogo/tipos-camiseta', options),
    request('/api/catalogo/generos', options),
    request('/api/catalogo/talles', options)
  ]);

  return {
    countries: uniqueByName(countries),
    types: uniqueByName(types),
    genders: uniqueByName(genders),
    sizes: sortSizes(uniqueByName(sizes))
  };
}

export async function fetchProducts(filters = {}, options = {}) {
  const params = new URLSearchParams();
  appendQueryParam(params, 'paisId', filters.countryId);
  appendQueryParam(params, 'tipoCamisetaId', filters.typeId);
  appendQueryParam(params, 'generoId', filters.genderId);
  appendQueryParam(params, 'minPrecio', filters.minPrice);
  appendQueryParam(params, 'maxPrecio', filters.maxPrice);
  appendQueryParam(params, 'search', filters.search?.trim());
  appendQueryParam(params, 'talle', filters.size);
  appendQueryParam(params, 'sort', filters.sortBy);

  const query = params.toString();
  const camisetas = await request(`/api/camisetas${query ? `?${query}` : ''}`, options);

  const products = await Promise.all(
    camisetas.map(async (camiseta, index) => {
      const variantes = await request(`/api/camisetas/${camiseta.id}/variantes`, options)
        .catch(() => []);

      return mapProduct(camiseta, variantes, index);
    })
  );

  return products.filter((product) => product.active && product.image);
}

export { API_BASE_URL };
