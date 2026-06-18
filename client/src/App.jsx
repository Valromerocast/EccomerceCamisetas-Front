// Componente raíz de la aplicación
// Acá vive todo el estado global de la tienda: productos, carrito, usuario, órdenes y lista de usuarios.
// También defino todas las funciones que modifican ese estado y las paso a cada vista como props.

import { useState, useEffect, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { INITIAL_PRODUCTS } from './data/products'
import {
  addFavorite,
  addCartItem,
  changeOrderStatus,
  clearAuthToken,
  clearCartItems,
  createOrder,
  createProduct as createProductRequest,
  createProductVariant,
  createUserAsAdmin as createUserAsAdminRequest,
  deleteCartItem,
  deleteFavorite,
  deleteProduct as deleteProductRequest,
  deleteProductVariant,
  fetchCart,
  fetchCurrentUser,
  fetchFavorites,
  fetchOrders,
  fetchProducts,
  getAuthToken,
  loginUser,
  mapCartResponse,
  registerUser as registerUserRequest,
  updateCartItem,
  updateProduct as updateProductRequest,
  updateProductVariant
} from './services/api'

// --- Componentes de layout ---
import Layout from './components/layout/Layout'

// --- Vistas públicas ---
import Home from './views/Home'
import Catalog from './views/Catalog'
import ProductDetail from './views/ProductDetail'
import Cart from './views/Cart'
import Checkout from './views/Checkout'
import OrderSuccess from './views/OrderSuccess'
import Login from './views/Login'
import Register from './views/Register'
import RegisterSuccess from './views/RegisterSuccess'
import Profile from './views/Profile'
import Contact from './views/Contact'
import TermsConditions from './views/TermsConditions'
import PrivacyPolicy from './views/PrivacyPolicy'
import NotFound from './views/NotFound'

// --- Vistas del panel de administrador ---
import AdminLayout from './views/admin/AdminLayout'
import AdminInventory from './views/admin/AdminInventory'
import AdminProductEdit from './views/admin/AdminProductEdit'
import AdminSales from './views/admin/AdminSales'
import AdminUserAdd from './views/admin/AdminUserAdd'
import AdminOrderDetail from './views/admin/AdminOrderDetail'
import { useNotification } from './components/ui/useNotification'
import ScrollToTop from './components/ui/ScrollToTop'

function App() {
  const { showNotification } = useNotification();
  const orderCreationInProgress = useRef(false);

  // ─── 1. Estado global ────────────────────────────────────────────────────

  // El catalogo se carga desde el backend para evitar productos locales desactualizados.
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState('');

  // Usuario logueado actualmente y estado de restauración de la sesión JWT.
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  // El carrito se persiste en el backend y conserva los IDs de ítem y variante.
  const [cart, setCart] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState('');

  const getUserCart = async (currentUser) => {
    if (currentUser.role !== 'user') {
      return [];
    }

    try {
      const response = await fetchCart();
      return mapCartResponse(response);
    } catch (error) {
      console.error('No se pudo cargar el carrito:', error);
      setCartError(error.message || 'No se pudo cargar el carrito.');
      return [];
    }
  };

  // El backend devuelve los pedidos del usuario o todos los pedidos para admin.
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  const getOrders = async () => {
    try {
      setOrdersLoading(true);
      setOrdersError('');
      return await fetchOrders();
    } catch (error) {
      console.error('No se pudieron cargar los pedidos:', error);
      setOrdersError(error.message || 'No se pudieron cargar los pedidos.');
      return [];
    } finally {
      setOrdersLoading(false);
    }
  };

  // Los favoritos pertenecen al usuario autenticado y se persisten en el backend.
  const [favorites, setFavorites] = useState([]);

  const getUserFavorites = async (currentUser) => {
    if (currentUser.role !== 'user') {
      return [];
    }

    try {
      return await fetchFavorites();
    } catch (error) {
      console.error('No se pudieron cargar los favoritos:', error);
      return [];
    }
  };


  // ─── 2. Sincronización con localStorage ──────────────────────────────────
  // Cada vez que cambia algún estado importante, lo guardo en localStorage
  // para que persista aunque el usuario recargue la página o cierre el tab

  useEffect(() => {
    localStorage.setItem('camisetas_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    let isMounted = true;

    async function loadProductsFromApi() {
      setProductsLoading(true);
      setProductsError('');

      try {
        const apiProducts = await fetchProducts();

        if (isMounted) {
          setProducts(apiProducts);
        }
      } catch (error) {
        console.error(error);

        if (isMounted) {
          setProducts([]);
          setProductsError('No se pudo cargar el catalogo desde el backend.');
        }
      } finally {
        if (isMounted) {
          setProductsLoading(false);
        }
      }
    }

    loadProductsFromApi();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      if (!getAuthToken()) {
        setAuthReady(true);
        return;
      }

      try {
        const currentUser = await fetchCurrentUser();
        const [restoredCart, restoredOrders, restoredFavorites] = await Promise.all([
          getUserCart(currentUser),
          getOrders(),
          getUserFavorites(currentUser)
        ]);

        if (isMounted) {
          setUser(currentUser);
          setCart(restoredCart);
          setOrders(restoredOrders);
          setFavorites(restoredFavorites);
        }
      } catch (error) {
        console.error('No se pudo restaurar la sesión:', error);
        clearAuthToken();

        if (isMounted) {
          setUser(null);
          setCart([]);
          setFavorites([]);
        }
      } finally {
        if (isMounted) {
          setAuthReady(true);
        }
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // Alterna el favorito en la base de datos y revierte el cambio visual si falla.
  const toggleFavorite = async (productId) => {
    if (!user) {
      window.location.href = '/login';
      return false;
    }

    if (user.role !== 'user') {
      showNotification({
        type: 'warning',
        message: 'Esta cuenta no puede guardar favoritos.'
      });
      return false;
    }

    const normalizedId = Number(productId);
    const wasFavorite = favorites.includes(normalizedId);

    setFavorites((currentFavorites) => (
      wasFavorite
        ? currentFavorites.filter((id) => id !== normalizedId)
        : [...currentFavorites, normalizedId]
    ));

    try {
      if (wasFavorite) {
        await deleteFavorite(normalizedId);
      } else {
        await addFavorite(normalizedId);
      }
      return true;
    } catch (error) {
      console.error('No se pudo actualizar el favorito:', error);
      setFavorites((currentFavorites) => (
        wasFavorite
          ? [...new Set([...currentFavorites, normalizedId])]
          : currentFavorites.filter((id) => id !== normalizedId)
      ));
      showNotification({
        type: 'error',
        message: error.message || 'No se pudo actualizar el favorito.'
      });
      return false;
    }
  };


  // ─── 3. Funciones del carrito ─────────────────────────────────────────────

  // Agrega una variante al carrito persistido por el backend.
  const addToCart = async (product, quantity, size) => {
    if (!user) {
      window.location.href = "/login";
      return false;
    }

    if (user.role !== 'user') {
      showNotification({
        type: 'warning',
        message: 'Esta cuenta no puede agregar productos al carrito.'
      });
      return false;
    }

    const qty = parseInt(quantity, 10) || 1;
    const variant = product.variants?.find((item) => item.talle === size);

    if (!variant?.id) {
      showNotification({
        type: 'error',
        message: `No se encontró la variante del talle ${size}.`
      });
      return false;
    }

    setCartError('');
    setCartLoading(true);

    try {
      const response = await addCartItem(variant.id, qty);
      setCart(mapCartResponse(response));
      return true;
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      setCartError(error.message);
      showNotification({
        type: 'error',
        message: error.message || 'No se pudo agregar el producto al carrito.'
      });
      return false;
    } finally {
      setCartLoading(false);
    }
  };

  // Actualiza la cantidad absoluta de un ítem del carrito.
  const updateCartQuantity = async (cartKey, quantity) => {
    const qty = parseInt(quantity, 10) || 0;

    if (qty <= 0) {
      return removeFromCart(cartKey);
    }

    const item = cart.find((cartItem) => cartItem.cartKey === cartKey);
    if (!item) return false;

    setCartError('');
    setCartLoading(true);

    try {
      const response = await updateCartItem(item.itemId, qty);
      setCart(mapCartResponse(response));
      return true;
    } catch (error) {
      console.error('Error al actualizar el carrito:', error);
      setCartError(error.message);
      showNotification({
        type: 'error',
        message: error.message || 'No se pudo actualizar la cantidad.'
      });
      return false;
    } finally {
      setCartLoading(false);
    }
  };

  // Elimina un ítem específico usando el ID asignado por el backend.
  const removeFromCart = async (cartKey) => {
    const item = cart.find((cartItem) => cartItem.cartKey === cartKey);
    if (!item) return false;

    setCartError('');
    setCartLoading(true);

    try {
      await deleteCartItem(item.itemId);
      setCart((currentCart) => currentCart.filter((cartItem) => cartItem.cartKey !== cartKey));
      return true;
    } catch (error) {
      console.error('Error al eliminar del carrito:', error);
      setCartError(error.message);
      showNotification({
        type: 'error',
        message: error.message || 'No se pudo eliminar el producto.'
      });
      return false;
    } finally {
      setCartLoading(false);
    }
  };

  // Vacía el carrito persistido.
  const clearCart = async () => {
    if (!user || user.role !== 'user') {
      setCart([]);
      return true;
    }

    setCartError('');
    setCartLoading(true);

    try {
      await clearCartItems();
      setCart([]);
      return true;
    } catch (error) {
      console.error('Error al vaciar el carrito:', error);
      setCartError(error.message);
      showNotification({
        type: 'error',
        message: error.message || 'No se pudo vaciar el carrito.'
      });
      return false;
    } finally {
      setCartLoading(false);
    }
  };


  // ─── 4. Funciones de autenticación ───────────────────────────────────────


  const login = async (email, password) => {
    try {
      const loggedUser = await loginUser(email, password);
      const [userCart, userOrders, userFavorites] = await Promise.all([
        getUserCart(loggedUser),
        getOrders(),
        getUserFavorites(loggedUser)
      ]);
      setUser(loggedUser);
      setCart(userCart);
      setOrders(userOrders);
      setFavorites(userFavorites);
      return { success: true, user: loggedUser };
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      return {
        success: false,
        message: error.status === 401 ? 'Credenciales incorrectas.' : error.message
      };
    }
  };

  // Cierra la sesión y también elimina el token JWT del navegador.
  const logout = () => {
    setUser(null);
    setCart([]);
    setCartError('');
    setOrders([]);
    setOrdersError('');
    setFavorites([]);
    clearAuthToken();
  };

  // Registra un nuevo usuario usando el backend.
  const registerUser = async (payload) => {
    try {
      const currentUser = await registerUserRequest({
        nombre: payload.nombre || payload.name || '',
        apellido: payload.apellido || payload.lastName || payload.surname || '',
        email: payload.email || '',
        password: payload.password || ''
      });

      const [userCart, userOrders, userFavorites] = await Promise.all([
        getUserCart(currentUser),
        getOrders(),
        getUserFavorites(currentUser)
      ]);
      setUser(currentUser);
      setCart(userCart);
      setOrders(userOrders);
      setFavorites(userFavorites);
      return { success: true, user: currentUser };
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      return { success: false, message: error.message || 'No se pudo registrar el usuario.' };
    }
  };

  // Crea un usuario desde el panel sin reemplazar la sesión ni el token del admin.
  const createUserAsAdmin = async (payload) => {
    try {
      const createdUser = await createUserAsAdminRequest({
        nombre: payload.nombre || payload.name || '',
        apellido: payload.apellido || payload.lastName || payload.surname || '',
        email: payload.email || '',
        password: payload.password || '',
        rol: 'USER'
      });

      return { success: true, user: createdUser };
    } catch (error) {
      console.error('Error al crear usuario desde admin:', error);
      return { success: false, message: error.message || 'No se pudo crear el usuario.' };
    }
  };


  // ─── 5. Funciones de órdenes ──────────────────────────────────────────────

  // El backend valida stock, crea el pedido, descuenta existencias y vacía el carrito.
  const placeOrder = async (shippingInfo, paymentMethod) => {
    if (orderCreationInProgress.current) {
      return { success: false, message: 'El pedido ya se está procesando.' };
    }

    if (enrichedCart.length === 0) {
      return { success: false, message: 'El carrito está vacío.' };
    }

    orderCreationInProgress.current = true;

    try {
      const newOrder = await createOrder({
        userName: user?.name || shippingInfo.fullName,
        shippingInfo,
        paymentMethod
      });

      setOrders((currentOrders) => [newOrder, ...currentOrders]);
      setCart([]);
      setProducts((currentProducts) => currentProducts.map((product) => {
        const purchasedItems = newOrder.items.filter((item) => item.productId === product.id);

        if (purchasedItems.length === 0) {
          return product;
        }

        const nextStock = { ...product.stock };
        const nextVariants = product.variants?.map((variant) => {
          const purchasedQuantity = purchasedItems
            .filter((item) => item.variantId === variant.id)
            .reduce((total, item) => total + item.quantity, 0);

          if (purchasedQuantity === 0) {
            return variant;
          }

          const stock = Math.max(0, variant.stock - purchasedQuantity);
          nextStock[variant.talle] = stock;
          return { ...variant, stock };
        });

        return {
          ...product,
          stock: nextStock,
          variants: nextVariants
        };
      }));

      try {
        const refreshedProducts = await fetchProducts();
        setProducts(refreshedProducts);
      } catch (refreshError) {
        console.error('El pedido se creó, pero no se pudo refrescar el catálogo:', refreshError);
      }

      return { success: true, orderId: newOrder.id };
    } catch (error) {
      console.error('Error al crear el pedido:', error);
      return {
        success: false,
        message: error.message || 'No se pudo crear el pedido.'
      };
    } finally {
      orderCreationInProgress.current = false;
    }
  };


  // ─── 6. Funciones de administración de productos ─────────────────────────

  const refreshProducts = async () => {
    const refreshedProducts = await fetchProducts();
    setProducts(refreshedProducts);
    return refreshedProducts;
  };

  const addProduct = async ({ product, variants }) => {
    try {
      const createdProduct = await createProductRequest(product);

      for (const variant of variants) {
        await createProductVariant(createdProduct.id, {
          talleId: variant.talleId,
          stock: variant.stock,
          sku: variant.sku,
          color: variant.color
        });
      }

      await refreshProducts();
      return { success: true, productId: createdProduct.id };
    } catch (error) {
      console.error('Error al crear el producto:', error);
      return { success: false, message: error.message || 'No se pudo crear el producto.' };
    }
  };

  const updateProduct = async (productId, { product, variants }) => {
    try {
      await updateProductRequest(productId, product);

      const currentProduct = products.find((item) => item.id === productId);
      const existingBySize = new Map(
        (currentProduct?.variants || []).map((variant) => [variant.talle, variant])
      );
      const requestedSizes = new Set(variants.map((variant) => variant.sizeName));

      for (const variant of variants) {
        const existing = existingBySize.get(variant.sizeName);
        const payload = {
          talleId: variant.talleId,
          stock: variant.stock,
          sku: variant.sku,
          color: variant.color
        };

        if (existing) {
          await updateProductVariant(existing.id, payload);
        } else {
          await createProductVariant(productId, payload);
        }
      }

      for (const existing of currentProduct?.variants || []) {
        if (!requestedSizes.has(existing.talle)) {
          await deleteProductVariant(existing.id);
        }
      }

      await refreshProducts();
      return { success: true };
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
      return { success: false, message: error.message || 'No se pudo actualizar el producto.' };
    }
  };

  const deleteProduct = async (id) => {
    try {
      await deleteProductRequest(id);
      setProducts((currentProducts) => currentProducts.filter((product) => product.id !== id));
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
      return { success: false, message: error.message || 'No se pudo eliminar el producto.' };
    }
  };

  // Cambia el estado de una orden (ej: de "Procesando" a "Enviado")
  const updateOrderStatus = async (orderId, newStatus) => {
    const order = orders.find((item) => item.id === orderId);
    if (!order) {
      return { success: false, message: 'Pedido no encontrado.' };
    }

    if (order.status === 'Cancelado') {
      return { success: false, message: 'Un pedido cancelado no puede cambiar de estado.' };
    }

    try {
      const updatedOrder = await changeOrderStatus(order.backendId, newStatus);
      setOrders((currentOrders) =>
        currentOrders.map((item) => (
          item.id === orderId
            ? {
                ...updatedOrder,
                userName: item.userName,
                shippingInfo: item.shippingInfo,
                paymentMethod: item.paymentMethod
              }
            : item
        ))
      );

      if (updatedOrder.status === 'Cancelado') {
        try {
          await refreshProducts();
        } catch (refreshError) {
          console.error('El pedido se canceló, pero no se pudo refrescar el stock:', refreshError);
          return {
            success: true,
            message: 'El pedido se canceló y el stock fue repuesto, pero no pudo refrescarse en pantalla.'
          };
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error al actualizar el pedido:', error);
      return { success: false, message: error.message || 'No se pudo actualizar el pedido.' };
    }
  };


  // ─── 7. Carrito enriquecido ───────────────────────────────────────────────
  // El carrito guardado puede tener precios/stock viejos si el admin editó un producto.
  // Por eso mezclo los datos del carrito con los datos actuales del producto en tiempo real.
  const enrichedCart = cart.map((item) => {
    const freshProduct = products.find((p) => p.id === item.product.id) || item.product;
    return {
      ...item,
      product: freshProduct
    };
  });

  const enrichedOrders = orders.map((order) => ({
    ...order,
    userName: order.userEmail === user?.email
      ? `${user.name} ${user.apellido || ''}`.trim()
      : order.userName,
    items: order.items.map((item) => ({
      ...item,
      product: products.find((product) => product.id === item.productId) || item.product
    }))
  }));


  // ─── 8. Árbol de rutas ────────────────────────────────────────────────────
  if (!authReady) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-neutral-50">
        <p className="text-sm font-semibold text-neutral-500">Restaurando sesión...</p>
      </main>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Rutas públicas: todas usan el Layout con Navbar y Footer */}
        <Route element={<Layout user={user} cartCount={enrichedCart.reduce((sum, item) => sum + item.quantity, 0)} favoriteCount={favorites.length} logout={logout} />}>
          <Route path="/" element={<Home user={user} products={products} productsLoading={productsLoading} productsError={productsError} addToCart={addToCart} favorites={favorites} toggleFavorite={toggleFavorite} />} />
          <Route path="/catalog" element={<Catalog user={user} products={products} productsLoading={productsLoading} productsError={productsError} addToCart={addToCart} favorites={favorites} toggleFavorite={toggleFavorite} />} />
          <Route path="/product/:id" element={<ProductDetail user={user} products={products} productsLoading={productsLoading} productsError={productsError} addToCart={addToCart} />} />
          <Route path="/cart" element={<Cart cart={enrichedCart} cartLoading={cartLoading} cartError={cartError} updateCartQuantity={updateCartQuantity} removeFromCart={removeFromCart} clearCart={clearCart} />} />
          <Route path="/checkout" element={<Checkout cart={enrichedCart} user={user} placeOrder={placeOrder} />} />
          <Route path="/order-success" element={<OrderSuccess orders={enrichedOrders} />} />
          <Route path="/login" element={<Login user={user} login={login} />} />
          <Route path="/register" element={<Register registerUser={registerUser} />} />
          <Route path="/register-success" element={<RegisterSuccess />} />
          <Route path="/profile" element={<Profile user={user} logout={logout} orders={enrichedOrders} ordersLoading={ordersLoading} ordersError={ordersError} products={products} favorites={favorites} toggleFavorite={toggleFavorite} />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Rutas del admin: solo accesibles si el usuario tiene rol 'admin'
            Si no, redirige automáticamente al login */}
        <Route
          path="/admin"
          element={
            user && user.role === 'admin' ? (
              <AdminLayout user={user} logout={logout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          {/* La ruta base /admin redirige directamente a ventas */}
          <Route index element={<Navigate to="/admin/sales" replace />} />
          <Route path="inventory" element={<AdminInventory products={products} deleteProduct={deleteProduct} />} />
          <Route path="products/new" element={<AdminProductEdit addProduct={addProduct} />} />
          <Route path="products/:id/edit" element={<AdminProductEdit products={products} updateProduct={updateProduct} />} />
          <Route path="sales" element={<AdminSales orders={enrichedOrders} ordersLoading={ordersLoading} ordersError={ordersError} />} />
          <Route path="users/add" element={<AdminUserAdd createUser={createUserAsAdmin} />} />
          <Route path="orders/:id" element={<AdminOrderDetail orders={enrichedOrders} updateOrderStatus={updateOrderStatus} />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
