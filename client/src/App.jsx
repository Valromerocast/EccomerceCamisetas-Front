// Componente raíz de la aplicación
// Acá vive todo el estado global de la tienda: productos, carrito, usuario, órdenes y lista de usuarios.
// También defino todas las funciones que modifican ese estado y las paso a cada vista como props.

import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { INITIAL_PRODUCTS } from './data/products'
import { fetchProducts, API_BASE_URL } from './services/api'

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

function App() {

  // ─── 1. Estado global ────────────────────────────────────────────────────

  // Lista de productos: primero trato de leerla del localStorage para no perder
  // los cambios del admin (stock editado, productos nuevos, etc.)
  // Si los datos guardados son de una versión vieja o no tienen el producto de control,
  // los descarto y vuelvo a los productos de fábrica.
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('camisetas_products');
    if (saved && saved !== 'null') {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed)) {
          // Descarto el localStorage si la estructura de stock es vieja (tipo número) para evitar fallos
          if (
            parsed.some(p => typeof p.stock === 'number')
          ) {
            localStorage.removeItem('camisetas_products');
            return INITIAL_PRODUCTS;
          }
          return parsed;
        }
      } catch {
        return INITIAL_PRODUCTS;
      }
    }
    return INITIAL_PRODUCTS;
  });
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState('');

  // Usuario logueado actualmente.
  // Ya no se carga desde localStorage para evitar depender de datos simulados del frontend.
  const [user, setUser] = useState(null);

  // Carrito de compras: persisto los artículos por usuario para que cada uno tenga el suyo independiente
  const [cart, setCart] = useState(() => {
    // Para el estado inicial de la recarga, intentamos obtener el usuario desde localStorage directamente
    const savedUser = localStorage.getItem('camisetas_user');
    let email = null;
    if (savedUser && savedUser !== 'null') {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.name !== 'Admin Valen') {
          email = parsed.email;
        }
      } catch { }
    }
    if (!email) return [];

    const saved = localStorage.getItem(`camisetas_cart_${email}`);
    if (saved && saved !== 'null') {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  // Historial de órdenes de compra de todos los usuarios
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('camisetas_orders');
    if (saved && saved !== 'null') {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  // Favoritos: guarda los IDs de los productos marcados como favoritos
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('camisetas_favorites');
    if (saved && saved !== 'null') {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  });


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
          setProductsError('No se pudo cargar el catalogo desde el backend. Se muestran datos locales.');
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
    if (user) {
      localStorage.setItem(`camisetas_cart_${user.email}`, JSON.stringify(cart));
    }
  }, [cart, user]);

  useEffect(() => {
    localStorage.setItem('camisetas_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('camisetas_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Sincroniza el carrito automáticamente cuando cambia el stock o la lista de productos
  useEffect(() => {
    let changed = false;
    const updatedCart = cart
      .map((item) => {
        const freshProduct = products.find((p) => p.id === item.product.id);
        if (!freshProduct) {
          changed = true;
          return null; // Si fue eliminado, lo quitamos
        }

        const size = item.size;
        const currentStock = typeof freshProduct.stock === 'object' && freshProduct.stock !== null
          ? (freshProduct.stock[size] || 0)
          : freshProduct.stock;

        if (item.quantity > currentStock) {
          changed = true;
          if (currentStock <= 0) {
            return null; // Si ya no hay stock en absoluto para ese talle, lo quitamos
          }
          // Si hay menos stock del solicitado, bajamos la cantidad
          return {
            ...item,
            quantity: currentStock
          };
        }

        return item;
      })
      .filter((item) => item !== null);

    if (changed) {
      setCart(updatedCart);
    }
  }, [products, cart]);


  // Alterna el estado de favorito de un producto
  const toggleFavorite = (productId) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };


  // ─── 3. Funciones del carrito ─────────────────────────────────────────────

  // Agrega un producto al carrito. Si el usuario no está logueado, redirige al login.
  // Si ya existe el mismo producto con la misma talla, suma la cantidad.
  // Nunca permite agregar más unidades de las que hay en stock.
  const addToCart = (product, quantity, size) => {
    if (!user) {
      // Sin sesión activa no se puede comprar
      window.location.href = "/login";
      return false;
    }
    if (user.role === 'admin') {
      // El admin no tiene carrito, solo gestiona la tienda
      alert("Los administradores no pueden agregar productos al carrito.");
      return false;
    }
    const qty = parseInt(quantity, 10) || 1;
    setCart((prevCart) => {
      // La clave única del ítem combina id + talla para distinguir variantes del mismo producto
      const cartKey = `${product.id}-${size}`;
      const existingItemIndex = prevCart.findIndex((item) => item.cartKey === cartKey);

      // Busco el producto actualizado para respetar el stock actual (puede haber cambiado)
      const freshProduct = products.find((p) => p.id === product.id) || product;
      const currentStock = typeof freshProduct.stock === 'object' && freshProduct.stock !== null
        ? (freshProduct.stock[size] || 0)
        : freshProduct.stock;

      if (existingItemIndex > -1) {
        // Si ya está en el carrito, sumo la cantidad pero sin pasarme del stock
        return prevCart.map((item, index) => {
          if (index === existingItemIndex) {
            const newQty = item.quantity + qty;
            return {
              ...item,
              quantity: Math.min(newQty, currentStock)
            };
          }
          return item;
        });
      } else {
        // Es un artículo nuevo en el carrito
        const finalQty = Math.min(qty, currentStock);
        return [...prevCart, { cartKey, product, quantity: finalQty, size }];
      }
    });
    return true;
  };

  // Actualiza la cantidad de un ítem ya existente en el carrito.
  // Si la cantidad llega a 0 o menos, directamente lo elimina.
  const updateCartQuantity = (cartKey, quantity) => {
    const qty = parseInt(quantity, 10) || 0;
    if (qty <= 0) {
      removeFromCart(cartKey);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.cartKey === cartKey) {
          const freshProduct = products.find((p) => p.id === item.product.id) || item.product;
          const currentStock = typeof freshProduct.stock === 'object' && freshProduct.stock !== null
            ? (freshProduct.stock[item.size] || 0)
            : freshProduct.stock;
          return { ...item, quantity: Math.min(qty, currentStock) };
        }
        return item;
      })
    );
  };

  // Elimina un ítem específico del carrito usando su clave única
  const removeFromCart = (cartKey) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartKey !== cartKey));
  };

  // Vacía el carrito completamente (se usa después de confirmar una compra)
  const clearCart = () => {
    setCart([]);
  };


  // ─── 4. Funciones de autenticación ───────────────────────────────────────


  const login = (email, password, backendData = null) => {
    const userData = backendData?.user || backendData?.usuario || backendData?.data?.user || backendData?.data?.usuario || backendData;
    const role = userData?.role || userData?.rol || backendData?.role || backendData?.rol || backendData?.data?.role || backendData?.data?.rol;
    const name = userData?.name || userData?.nombre || userData?.firstName || email.split('@')[0];
    const apellido = userData?.apellido || userData?.lastName || userData?.surname || '';
    const normalizedRole = String(role || '').toLowerCase();
    const finalRole = normalizedRole === 'admin' || normalizedRole === 'administrator' || normalizedRole === 'administrador'
      ? 'admin'
      : 'user';

    const loggedUser = {
      name,
      apellido,
      email: userData?.email || email,
      role: finalRole
    };

    setUser(loggedUser);

    // Recupero el carrito asociado al usuario solo si existe en el navegador.
    // No uso datos de usuarios almacenados localmente para decidir el login.
    const savedCart = localStorage.getItem(`camisetas_cart_${loggedUser.email}`);
    if (savedCart && savedCart !== 'null') {
      try {
        const parsed = JSON.parse(savedCart);
        setCart(Array.isArray(parsed) ? parsed : []);
      } catch {
        setCart([]);
      }
    } else {
      setCart([]);
    }

    return { success: true, user: loggedUser };
  };

  // Cierra la sesión y también elimina el token JWT del navegador.
  const logout = () => {
    setUser(null);
    setCart([]);
    localStorage.removeItem('camisetas_jwt');
  };

  // Registra un nuevo usuario usando el backend.
  // No se valida más contra una lista local del frontend.
  const registerUser = async (payloadOrName, maybeEmail, maybePassword, maybeRole = 'user') => {
    try {
      const isObjectPayload = payloadOrName && typeof payloadOrName === 'object' && !Array.isArray(payloadOrName);

      const payload = isObjectPayload
        ? payloadOrName
        : {
            nombre: payloadOrName || '',
            apellido: maybeEmail && typeof maybeEmail === 'string' && maybeEmail.includes('@') ? '' : '',
            email: maybeEmail || '',
            password: maybePassword || '',
            role: maybeRole || 'user'
          };

      const requestPayload = {
        nombre: payload.nombre || payload.name || '',
        apellido: payload.apellido || payload.lastName || payload.surname || '',
        email: payload.email || '',
        password: payload.password || ''
      };

      if (payload.role && payload.role !== 'user') {
        requestPayload.role = payload.role;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestPayload)
      });

      const responseText = await response.text();
      let data = null;
      try {
        data = responseText ? JSON.parse(responseText) : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        const message = data?.message || data?.error || data?.detail || responseText || 'No se pudo registrar el usuario.';
        return { success: false, message };
      }

      const token = data?.token || data?.accessToken || data?.jwt || data?.data?.token;
      if (token) {
        localStorage.setItem('camisetas_jwt', token);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      return { success: false, message: 'No se pudo conectar con el servidor.' };
    }
  };


  // ─── 5. Funciones de órdenes ──────────────────────────────────────────────

  // Crea una nueva orden a partir del carrito actual.
  // También descuenta el stock de cada producto comprado.
  const placeOrder = (shippingInfo, paymentMethod) => {
    if (enrichedCart.length === 0) return { success: false, message: 'El carrito está vacío' };

    // Validar stock y existencia antes de procesar el pedido para evitar compras inválidas
    for (const item of enrichedCart) {
      const freshProduct = products.find((p) => p.id === item.product.id);
      if (!freshProduct) {
        return {
          success: false,
          message: `El producto "${item.product.name}" ya no está disponible en la tienda.`
        };
      }

      const size = item.size;
      const currentStock = typeof freshProduct.stock === 'object' && freshProduct.stock !== null
        ? (freshProduct.stock[size] || 0)
        : freshProduct.stock;

      if (currentStock <= 0) {
        return {
          success: false,
          message: `El producto "${freshProduct.name}" en talle ${size} se ha quedado sin stock.`
        };
      }

      if (currentStock < item.quantity) {
        return {
          success: false,
          message: `Solo quedan ${currentStock} unidades disponibles de "${freshProduct.name}" en talle ${size}.`
        };
      }
    }


    const subtotal = enrichedCart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const taxes = subtotal * 0.08;
    const total = subtotal + taxes;
    const newOrder = {
      id: `ORD-${Date.now().toString().slice(-6)}`,   // ID único basado en timestamp
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      userEmail: user ? user.email : 'invitado@tshirt.com',
      userName: user ? user.name : shippingInfo.fullName,
      items: [...enrichedCart],
      total,
      shippingInfo,
      paymentMethod,
      status: 'Procesando' // Estados posibles: Procesando, Enviado, Entregado, Cancelado
    };

    // Descuento el stock de cada producto incluido en la orden
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const cartItemsForProduct = enrichedCart.filter((item) => item.product.id === p.id);
        if (cartItemsForProduct.length === 0) return p;

        if (typeof p.stock === 'object' && p.stock !== null) {
          const newStock = { ...p.stock };
          cartItemsForProduct.forEach((item) => {
            const size = item.size;
            if (newStock[size] !== undefined) {
              newStock[size] = Math.max(0, newStock[size] - item.quantity);
            }
          });
          return { ...p, stock: newStock };
        } else {
          const totalPurchased = cartItemsForProduct.reduce((sum, item) => sum + item.quantity, 0);
          return {
            ...p,
            stock: Math.max(0, p.stock - totalPurchased)  // nunca negativo
          };
        }
      })
    );

    setOrders((prevOrders) => [newOrder, ...prevOrders]);  // nueva orden va primero
    clearCart();
    return { success: true, orderId: newOrder.id };
  };


  // ─── 6. Funciones de administración de productos ─────────────────────────

  // Agrega un producto nuevo al catálogo. El ID lo calculo como el máximo actual + 1
  const addProduct = (newProductData) => {
    const newId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
    const newProduct = {
      id: newId,
      name: newProductData.name,
      subtitle: newProductData.subtitle || '', // guardo el equipo o la selección
      price: parseFloat(newProductData.price),
      description: newProductData.description,
      category: newProductData.category,
      sizes: newProductData.sizes,       // array de talles disponibles
      image: newProductData.image || '/assets/success.svg',
      rating: 5.0,
      reviewsCount: 0,
      stock: typeof newProductData.stock === 'object' ? newProductData.stock : {}, // guardo el objeto de stock por talle
      featured: newProductData.featured || false
    };
    setProducts((prev) => [...prev, newProduct]);
  };

  // Reemplaza un producto existente con los datos actualizados (edición desde el panel admin)
  const updateProduct = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  // Elimina un producto del catálogo por su ID
  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Cambia el estado de una orden (ej: de "Procesando" a "Enviado")
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
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


  // ─── 8. Árbol de rutas ────────────────────────────────────────────────────
  return (
    <Router>
      <Routes>
        {/* Rutas públicas: todas usan el Layout con Navbar y Footer */}
        <Route element={<Layout user={user} cartCount={enrichedCart.reduce((sum, item) => sum + item.quantity, 0)} logout={logout} />}>
          <Route path="/" element={<Home products={products} productsLoading={productsLoading} productsError={productsError} addToCart={addToCart} favorites={favorites} toggleFavorite={toggleFavorite} />} />
          <Route path="/catalog" element={<Catalog products={products} productsLoading={productsLoading} productsError={productsError} addToCart={addToCart} favorites={favorites} toggleFavorite={toggleFavorite} />} />
          <Route path="/product/:id" element={<ProductDetail products={products} productsLoading={productsLoading} productsError={productsError} addToCart={addToCart} />} />
          <Route path="/cart" element={<Cart cart={enrichedCart} updateCartQuantity={updateCartQuantity} removeFromCart={removeFromCart} clearCart={clearCart} />} />
          <Route path="/checkout" element={<Checkout cart={enrichedCart} user={user} placeOrder={placeOrder} />} />
          <Route path="/order-success" element={<OrderSuccess orders={orders} />} />
          <Route path="/login" element={<Login user={user} login={login} />} />
          <Route path="/register" element={<Register registerUser={registerUser} login={login} />} />
          <Route path="/register-success" element={<RegisterSuccess />} />
          <Route path="/profile" element={<Profile user={user} logout={logout} orders={orders} />} />
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
          <Route path="sales" element={<AdminSales orders={orders} />} />
          <Route path="users/add" element={<AdminUserAdd registerUser={registerUser} />} />
          <Route path="orders/:id" element={<AdminOrderDetail orders={orders} updateOrderStatus={updateOrderStatus} />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
