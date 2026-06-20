import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../components/ui/useNotification';
import {
  createAdminUser,
  login as loginThunk,
  logout as logoutAction,
  register as registerThunk
} from './slices/authSlice';
import {
  addProduct as addProductThunk,
  deleteProduct as deleteProductThunk,
  updateProduct as updateProductThunk
} from './slices/productsSlice';
import {
  addToCart as addToCartThunk,
  clearCart as clearCartThunk,
  loadCart,
  removeFromCart as removeFromCartThunk,
  resetCart,
  updateCartQuantity as updateCartQuantityThunk
} from './slices/cartSlice';
import {
  loadFavorites,
  resetFavorites,
  toggleFavorite as toggleFavoriteThunk
} from './slices/favoritesSlice';
import {
  loadOrders,
  placeOrder as placeOrderThunk,
  resetOrders,
  updateOrderStatus as updateOrderStatusThunk
} from './slices/ordersSlice';
import { selectEnrichedCart, selectUser } from './selectors';

export function useShopActions() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const user = useSelector(selectUser);
  const cart = useSelector(selectEnrichedCart);
  const loadUserData = (currentUser) => Promise.all([
    dispatch(loadCart(currentUser)),
    dispatch(loadFavorites(currentUser)),
    dispatch(loadOrders())
  ]);

  return {
    login: async (email, password, rememberMe = false) => {
      try {
        const loggedUser = await dispatch(loginThunk({ email, password, rememberMe })).unwrap();
        await loadUserData(loggedUser);
        return { success: true, user: loggedUser };
      } catch (message) {
        return { success: false, message };
      }
    },
    registerUser: async (payload) => {
      try {
        const registeredUser = await dispatch(registerThunk(payload)).unwrap();
        await loadUserData(registeredUser);
        return { success: true, user: registeredUser };
      } catch (message) {
        return { success: false, message };
      }
    },
    createUserAsAdmin: async (payload) => {
      try {
        const createdUser = await dispatch(createAdminUser(payload)).unwrap();
        return { success: true, user: createdUser };
      } catch (message) {
        return { success: false, message };
      }
    },
    logout: () => {
      dispatch(logoutAction());
      dispatch(resetCart());
      dispatch(resetFavorites());
      dispatch(resetOrders());
    },
    toggleFavorite: async (productId) => {
      if (!user) {
        navigate('/login');
        return false;
      }
      try {
        await dispatch(toggleFavoriteThunk(productId)).unwrap();
        return true;
      } catch (message) {
        showNotification({ type: user.role === 'user' ? 'error' : 'warning', message });
        return false;
      }
    },
    addToCart: async (product, quantity, size) => {
      if (!user) {
        navigate('/login');
        return false;
      }
      try {
        await dispatch(addToCartThunk({ product, quantity, size })).unwrap();
        return true;
      } catch (message) {
        showNotification({ type: user.role === 'user' ? 'error' : 'warning', message });
        return false;
      }
    },
    updateCartQuantity: async (cartKey, quantity) => {
      try {
        await dispatch(updateCartQuantityThunk({ cartKey, quantity })).unwrap();
        return true;
      } catch (message) {
        showNotification({ type: 'error', message });
        return false;
      }
    },
    removeFromCart: async (cartKey) => {
      try {
        await dispatch(removeFromCartThunk(cartKey)).unwrap();
        return true;
      } catch (message) {
        showNotification({ type: 'error', message });
        return false;
      }
    },
    clearCart: async () => {
      try {
        await dispatch(clearCartThunk()).unwrap();
        return true;
      } catch (message) {
        showNotification({ type: 'error', message });
        return false;
      }
    },
    placeOrder: async (shippingInfo, paymentMethod) => {
      if (cart.length === 0) return { success: false, message: 'El carrito está vacío.' };
      try {
        const newOrder = await dispatch(placeOrderThunk({
          userName: user?.name || shippingInfo.fullName,
          shippingInfo,
          paymentMethod
        })).unwrap();
        return { success: true, orderId: newOrder.id };
      } catch (message) {
        return { success: false, message };
      }
    },
    addProduct: async (data) => {
      try {
        const product = await dispatch(addProductThunk(data)).unwrap();
        return { success: true, productId: product.id };
      } catch (message) {
        return { success: false, message };
      }
    },
    updateProduct: async (productId, data) => {
      try {
        await dispatch(updateProductThunk({ productId, data })).unwrap();
        return { success: true };
      } catch (message) {
        return { success: false, message };
      }
    },
    deleteProduct: async (productId) => {
      try {
        await dispatch(deleteProductThunk(productId)).unwrap();
        return { success: true };
      } catch (message) {
        return { success: false, message };
      }
    },
    updateOrderStatus: async (orderId, newStatus) => {
      try {
        await dispatch(updateOrderStatusThunk({ orderId, newStatus })).unwrap();
        return { success: true };
      } catch (message) {
        return { success: false, message };
      }
    }
  };
}
