const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const FALLBACK_HOME_IMAGE = 'https://cdn.shopify.com/s/files/1/0591/0478/8538/files/image_53104866-d11b-446b-842f-9e37e19d1c38.png?v=1774372574';
const FALLBACK_AWAY_IMAGE = 'https://cdn.shopify.com/s/files/1/0591/0478/8538/files/image_b6a5a8ac-8a79-460f-904c-9fc586a854f0.jpg?v=1775563942';

const FALLBACK_IMAGES = [
  FALLBACK_HOME_IMAGE,
  FALLBACK_AWAY_IMAGE,
  'https://cdn.shopify.com/s/files/1/0591/0478/8538/files/image_bb8e2e3e-8c87-4469-b928-0dffe04d9d6f.png?v=1774372426',
  'https://cdn.shopify.com/s/files/1/0591/0478/8538/files/image_8c109ac7-6e21-4d48-b300-b77698d533cd.jpg?v=1775564098'
];

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

function getImage(camiseta, index) {
  if (camiseta.imagen && camiseta.imagen.startsWith('kit:')) {
    return camiseta.imagen.toLowerCase().includes('alternativa') ? FALLBACK_AWAY_IMAGE : FALLBACK_HOME_IMAGE;
  }

  return camiseta.imagen || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
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
    }));
}

function mapStockBySize(variantes = []) {
  return variantes.reduce((stock, variante) => {
    stock[variante.talle] = variante.stock;
    return stock;
  }, {});
}

function mapProduct(camiseta, variantes, index) {
  const mappedVariants = mapVariants(variantes);
  const sizes = mappedVariants.map((variante) => variante.talle);
  const image = getImage(camiseta, index);
  const country = camiseta.pais || 'Seleccion';
  const kit = camiseta.tipoCamiseta || 'KIT';

  return {
    id: camiseta.id,
    name: camiseta.nombre || `Camiseta ${camiseta.id}`,
    subtitle: `${country} - ${kit}`,
    price: Number(camiseta.precio) || 0,
    description: camiseta.descripcion || 'Camiseta oficial de seleccion.',
    category: getCategory(camiseta),
    sizes: sizes.length > 0 ? sizes : ['S', 'M', 'L', 'XL'],
    image,
    fallbackImage: image,
    rating: 5,
    reviewsCount: 0,
    stock: sizes.length > 0 ? mapStockBySize(mappedVariants) : { S: 0, M: 0, L: 0, XL: 0 },
    featured: index < 4,
    active: camiseta.activo !== false,
    variants: mappedVariants
  };
}

export async function fetchProducts() {
  const camisetas = await request('/api/camisetas');

  const products = await Promise.all(
    camisetas.map(async (camiseta, index) => {
      let variantes = [];

      try {
        variantes = await request(`/api/camisetas/${camiseta.id}/variantes`);
      } catch {
        variantes = [];
      }

      return mapProduct(camiseta, variantes, index);
    })
  );

  return products.filter((product) => product.active);
}

export { API_BASE_URL };
