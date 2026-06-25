import { getTeamCrest } from '../utils/teamCrest';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const AUTH_EXPIRED_EVENT = 'mundialista:auth-expired';
const SIZE_ORDER = ['S', 'M', 'L', 'XL'];
let authTokenProvider = () => null;

export function setAuthTokenProvider(provider) {
  authTokenProvider = typeof provider === 'function' ? provider : () => null;
}

async function request(path, options = {}) {
  const {
    auth = true,
    token: explicitToken,
    headers: optionHeaders = {},
    ...fetchOptions
  } = options;
  const headers = {
    Accept: 'application/json',
    ...optionHeaders
  };

  if (fetchOptions.body) {
    headers['Content-Type'] = 'application/json';
  }

  const token = explicitToken || authTokenProvider();
  if (auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers
  });

  if (!response.ok) {
    if (auth && response.status === 401) {
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }

    const responseText = await response.text();
    let responseData;

    try {
      responseData = responseText ? JSON.parse(responseText) : null;
    } catch {
      responseData = null;
    }

    const message = responseData?.message
      || responseData?.error
      || responseData?.detail
      || responseText
      || `Error ${response.status} al llamar a ${path}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = responseData;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function mapAuthenticatedUser(usuario) {
  const normalizedRole = String(usuario?.rol || usuario?.role || '').toLowerCase();
  const role = normalizedRole.includes('admin')
    ? 'admin'
    : normalizedRole.includes('seller') || normalizedRole.includes('vendedor')
      ? 'seller'
      : 'user';

  return {
    id: usuario?.id,
    name: usuario?.nombre || usuario?.name || '',
    apellido: usuario?.apellido || '',
    email: usuario?.email || '',
    direccion: usuario?.direccion || '',
    telefono: usuario?.telefono || '',
    active: usuario?.activo !== false,
    role
  };
}

export async function fetchCurrentUser(token) {
  const usuario = await request('/api/usuarios/me', { token });
  return mapAuthenticatedUser(usuario);
}

async function authenticate(path, payload) {
  const authResponse = await request(path, {
    method: 'POST',
    auth: false,
    body: JSON.stringify(payload)
  });
  const token = authResponse?.token;

  if (!token) {
    throw new Error('El backend no devolvió un token de autenticación.');
  }

  const user = await fetchCurrentUser(token);
  return { user, token };
}

export function loginUser(email, password) {
  return authenticate('/api/auth/login', { email, password });
}

export function registerUser(payload) {
  return authenticate('/api/auth/register', payload);
}

export function createUserAsAdmin(payload) {
  return request('/api/usuarios', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function mapCartResponse(carrito) {
  return (carrito?.items || []).map((item) => ({
    cartKey: String(item.id),
    itemId: Number(item.id),
    variantId: Number(item.varianteId),
    productId: Number(item.camisetaId),
    quantity: Number(item.cantidad) || 0,
    size: item.talle,
    color: item.color,
    sku: item.sku,
    unitPrice: Number(item.precioUnitario) || 0,
    subtotal: Number(item.subtotal) || 0,
    product: {
      id: Number(item.camisetaId),
      name: item.camiseta,
      price: Number(item.precioUnitario) || 0,
      image: getTeamCrest(item.pais || 'Seleccion'),
      fallbackImage: getTeamCrest(item.pais || 'Seleccion'),
      stock: { [item.talle]: Number(item.cantidad) || 0 }
    }
  }));
}

export function fetchCart() {
  return request('/api/carrito');
}

export function addCartItem(varianteId, cantidad) {
  return request('/api/carrito/items', {
    method: 'POST',
    body: JSON.stringify({ varianteId, cantidad })
  });
}

export function updateCartItem(itemId, cantidad) {
  return request(`/api/carrito/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ cantidad })
  });
}

export function deleteCartItem(itemId) {
  return request(`/api/carrito/items/${itemId}`, {
    method: 'DELETE'
  });
}

export function clearCartItems() {
  return request('/api/carrito', {
    method: 'DELETE'
  });
}

export async function fetchFavorites() {
  const favoritos = await request('/api/favoritos');
  return favoritos.map((favorito) => Number(favorito.camisetaId));
}

export function addFavorite(camisetaId) {
  return request(`/api/favoritos/${camisetaId}`, {
    method: 'POST'
  });
}

export function deleteFavorite(camisetaId) {
  return request(`/api/favoritos/${camisetaId}`, {
    method: 'DELETE'
  });
}

function mapOrderStatus(status) {
  const normalized = String(status || '').trim().toUpperCase();
  const labels = {
    PENDIENTE: 'Procesando',
    PROCESANDO: 'Procesando',
    ENVIADO: 'Enviado',
    ENTREGADO: 'Entregado',
    CANCELADO: 'Cancelado'
  };

  return labels[normalized] || status || 'Procesando';
}

function toBackendOrderStatus(status) {
  const normalized = String(status || '').trim().toLowerCase();
  const values = {
    procesando: 'PENDIENTE',
    enviado: 'ENVIADO',
    entregado: 'ENTREGADO',
    cancelado: 'CANCELADO'
  };

  return values[normalized] || String(status || '').trim().toUpperCase();
}

export function mapOrderResponse(pedido, extra = {}) {
  const fecha = pedido?.fecha ? new Date(pedido.fecha) : new Date();
  const items = (pedido?.detalles || []).map((detalle) => ({
    cartKey: `pedido-${pedido.id}-${detalle.id}`,
    detailId: Number(detalle.id),
    variantId: Number(detalle.varianteId),
    productId: Number(detalle.camisetaId),
    quantity: Number(detalle.cantidad) || 0,
    size: detalle.talle,
    color: detalle.color,
    sku: detalle.sku,
    subtotal: Number(detalle.subtotal) || 0,
    product: {
      id: Number(detalle.camisetaId),
      name: detalle.camisetaNombre,
      price: Number(detalle.precioUnitario) || 0,
      image: getTeamCrest(detalle.pais || 'Seleccion'),
      fallbackImage: getTeamCrest(detalle.pais || 'Seleccion')
    }
  }));

  return {
    id: `MS-${pedido.id}`,
    backendId: Number(pedido.id),
    userId: Number(pedido.usuarioId),
    userEmail: pedido.usuarioEmail,
    userName: extra.userName || pedido.usuarioEmail?.split('@')[0] || 'Cliente',
    date: fecha.toLocaleDateString('es-AR'),
    time: fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    timestamp: fecha.toISOString(),
    status: mapOrderStatus(pedido.estado),
    total: Number(pedido.total) || 0,
    items,
    shippingInfo: extra.shippingInfo || {
      address: '',
      city: '',
      zipCode: '',
      phone: '',
      country: 'Argentina'
    },
    paymentMethod: extra.paymentMethod || ''
  };
}

export async function fetchOrders() {
  const pedidos = await request('/api/pedidos');
  return pedidos.map((pedido) => mapOrderResponse(pedido));
}

export async function createOrder(extra = {}) {
  const pedido = await request('/api/pedidos', { method: 'POST' });
  return mapOrderResponse(pedido, extra);
}

export async function changeOrderStatus(orderId, status) {
  const pedido = await request(`/api/pedidos/${orderId}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado: toBackendOrderStatus(status) })
  });
  return mapOrderResponse(pedido);
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
  if (!image || !/^https?:\/\//i.test(image)) {
    return null;
  }

  // Una publicación o perfil web no puede usarse como src de una etiqueta img.
  if (/instagram\.com\/(p|reel|tv)\//i.test(image)) {
    return null;
  }

  return image;
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

export function mapProductResponse(camiseta, index = 0) {
  const variantes = camiseta?.variantes || [];
  const mappedVariants = mapVariants(variantes);
  const sizes = [...new Set(mappedVariants.map((variante) => variante.talle))];
  const image = getImage(camiseta);
  const country = camiseta.pais || 'Seleccion';
  const kit = camiseta.tipoCamiseta || 'KIT';
  const fallbackImage = getTeamCrest(country);

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
    image: image || fallbackImage,
    fallbackImage,
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
    genders: uniqueByName(
      [...genders]
        .sort((a, b) => {
          const aCanonical = a.nombre?.toLowerCase() === 'masculino' ? 0 : 1;
          const bCanonical = b.nombre?.toLowerCase() === 'masculino' ? 0 : 1;
          return aCanonical - bCanonical;
        })
        .map((gender) => ({
          ...gender,
          nombre: gender.nombre?.toLowerCase() === 'hombre' ? 'Masculino' : gender.nombre
        }))
    ),
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
  const products = camisetas.map((camiseta, index) => mapProductResponse(camiseta, index));

  return products.filter((product) => product.active);
}

export async function createProduct(payload) {
  return request('/api/camisetas', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateProduct(productId, payload) {
  return request(`/api/camisetas/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export function deleteProduct(productId) {
  return request(`/api/camisetas/${productId}`, {
    method: 'DELETE'
  });
}

export { API_BASE_URL, AUTH_EXPIRED_EVENT };
