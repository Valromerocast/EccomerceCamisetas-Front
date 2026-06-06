// Componente raíz de la aplicación
// Acá vive todo el estado global de la tienda: productos, carrito, usuario, órdenes y lista de usuarios.
// También defino todas las funciones que modifican ese estado y las paso a cada vista como props.

import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { INITIAL_PRODUCTS } from './data/products'

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
            parsed.length !== INITIAL_PRODUCTS.length ||
            !parsed.some(p => p.name === "Argentina Scaloneta") ||
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

  // Usuario logueado actualmente. Limpio la sesión si el nombre era el del admin viejo
  // (antes se llamaba "Admin Valen", ahora es genérico "Admin")
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('camisetas_user');
    if (saved && saved !== 'null') {
      try {
        const parsed = JSON.parse(saved);
        // Si encuentra al admin viejo, lo borra para forzar un nuevo login
        if (parsed && parsed.name === 'Admin Valen') {
          localStorage.removeItem('camisetas_user');
          return null;
        }
        return parsed;
      } catch {
        return null;
      }
    }
    return null;
  });

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
      } catch {}
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

  // Lista de todos los usuarios registrados (simula una base de datos en el front)
  // Si existe el admin viejo "Admin Valen", lo reemplazo por el admin genérico
  const [usersList, setUsersList] = useState(() => {
    const saved = localStorage.getItem('camisetas_users_list');
    if (saved && saved !== 'null') {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed)) {
          const hasOldAdmin = parsed.some(u => u.name === 'Admin Valen');
          if (hasOldAdmin) {
            localStorage.removeItem('camisetas_users_list');
            return [
              { name: 'Admin', email: 'admin@tshirt.com', password: 'admin', role: 'admin' },
              { name: 'Test User', email: 'test@tshirt.com', password: 'user', role: 'user' }
            ];
          }
          return parsed;
        }
      } catch {
        // Fallback below
      }
    }
    // Datos por defecto la primera vez que se ejecuta la app
    return [
      { name: 'Admin', email: 'admin@tshirt.com', password: 'admin', role: 'admin' },
      { name: 'Test User', email: 'test@tshirt.com', password: 'user', role: 'user' }
    ];
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
    if (user) {
      localStorage.setItem(`camisetas_cart_${user.email}`, JSON.stringify(cart));
    }
  }, [cart, user]);

  useEffect(() => {
    localStorage.setItem('camisetas_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('camisetas_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('camisetas_users_list', JSON.stringify(usersList));
  }, [usersList]);

  useEffect(() => {
    localStorage.setItem('camisetas_favorites', JSON.stringify(favorites));
  }, [favorites]);

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

  // Verifica email y contraseña contra la lista de usuarios guardada
  // Devuelve un objeto con success: true/false para que el componente de login maneje la respuesta
  const login = (email, password) => {
    const foundUser = usersList.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (foundUser) {
      const loggedUser = { name: foundUser.name, email: foundUser.email, role: foundUser.role };
      setUser(loggedUser);
      // Cargar el carrito específico de este usuario si ya existe
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
      return { success: true, user: foundUser };
    }
    return { success: false, message: 'Credenciales incorrectas' };
  };

  // Cierra la sesión borrando el usuario del estado (también se borrará del localStorage por el useEffect)
  const logout = () => {
    setUser(null);
    setCart([]); // Vacía el carrito al cerrar sesión para no seguir viendo lo que se agregó
  };

  // Registra un nuevo usuario. Solo acepta el rol 'user', el admin es único y no se puede crear desde acá.
  const registerUser = (name, email, password, role = 'user') => {
    if (role === 'admin') {
      return { success: false, message: 'No se pueden registrar más administradores.' };
    }
    // Verifico que el email no esté ya registrado (sin distinguir mayúsculas)
    const exists = usersList.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return { success: false, message: 'El correo electrónico ya está registrado.' };
    }
    const newUser = { name, email, password, role };
    setUsersList((prev) => [...prev, newUser]);
    return { success: true };
  };


  // ─── 5. Funciones de órdenes ──────────────────────────────────────────────

  // Crea una nueva orden a partir del carrito actual.
  // También descuenta el stock de cada producto comprado.
  const placeOrder = (shippingInfo, paymentMethod) => {
    if (enrichedCart.length === 0) return { success: false, message: 'El carrito está vacío' };

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
          <Route path="/" element={<Home products={products} addToCart={addToCart} favorites={favorites} toggleFavorite={toggleFavorite} />} />
          <Route path="/catalog" element={<Catalog products={products} addToCart={addToCart} favorites={favorites} toggleFavorite={toggleFavorite} />} />
          <Route path="/product/:id" element={<ProductDetail products={products} addToCart={addToCart} />} />
          <Route path="/cart" element={<Cart cart={enrichedCart} updateCartQuantity={updateCartQuantity} removeFromCart={removeFromCart} clearCart={clearCart} />} />
          <Route path="/checkout" element={<Checkout cart={enrichedCart} user={user} placeOrder={placeOrder} />} />
          <Route path="/order-success" element={<OrderSuccess orders={orders} />} />
          <Route path="/login" element={<Login user={user} login={login} />} />
          <Route path="/register" element={<Register registerUser={registerUser} />} />
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
