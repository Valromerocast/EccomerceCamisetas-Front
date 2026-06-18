import { useEffect } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Layout from './components/layout/Layout';
import ScrollToTop from './components/ui/ScrollToTop';
import Home from './views/Home';
import Catalog from './views/Catalog';
import ProductDetail from './views/ProductDetail';
import Cart from './views/Cart';
import Checkout from './views/Checkout';
import OrderSuccess from './views/OrderSuccess';
import Login from './views/Login';
import Register from './views/Register';
import RegisterSuccess from './views/RegisterSuccess';
import Profile from './views/Profile';
import Contact from './views/Contact';
import TermsConditions from './views/TermsConditions';
import PrivacyPolicy from './views/PrivacyPolicy';
import NotFound from './views/NotFound';
import AdminLayout from './views/admin/AdminLayout';
import AdminInventory from './views/admin/AdminInventory';
import AdminProductEdit from './views/admin/AdminProductEdit';
import AdminSales from './views/admin/AdminSales';
import AdminUserAdd from './views/admin/AdminUserAdd';
import AdminOrderDetail from './views/admin/AdminOrderDetail';
import { restoreSession } from './store/slices/authSlice';
import { loadProducts } from './store/slices/productsSlice';
import { loadCart } from './store/slices/cartSlice';
import { loadFavorites } from './store/slices/favoritesSlice';
import { loadOrders } from './store/slices/ordersSlice';
import { selectAuthReady, selectUser } from './store/selectors';

function App() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const authReady = useSelector(selectAuthReady);

  useEffect(() => {
    dispatch(loadProducts());
    dispatch(restoreSession())
      .unwrap()
      .then((currentUser) => {
        if (!currentUser) return;
        dispatch(loadCart(currentUser));
        dispatch(loadFavorites(currentUser));
        dispatch(loadOrders());
      })
      .catch(() => {});
  }, [dispatch]);

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
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-success" element={<RegisterSuccess />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route
          path="/admin"
          element={user?.role === 'admin' ? <AdminLayout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Navigate to="/admin/sales" replace />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="products/new" element={<AdminProductEdit />} />
          <Route path="products/:id/edit" element={<AdminProductEdit />} />
          <Route path="sales" element={<AdminSales />} />
          <Route path="users/add" element={<AdminUserAdd />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
