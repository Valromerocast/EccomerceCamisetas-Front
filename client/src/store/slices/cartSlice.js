import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  addCartItem,
  clearCartItems,
  deleteCartItem,
  fetchCart,
  mapCartResponse,
  updateCartItem
} from '../../services/api';
import { logout } from './authSlice';
import { placeOrder } from './ordersSlice';

const STOCK_ERROR_PATTERN = /requested quantity exceeds available stock/i;

function getStockErrorMessage(size) {
  return `No hay stock disponible para el talle ${size}.`;
}

function mapCartErrorMessage(error, size) {
  const message = String(error?.message || error || '').trim();
  if (STOCK_ERROR_PATTERN.test(message)) {
    return getStockErrorMessage(size);
  }
  return message || 'No se pudo completar la operación en el carrito.';
}

function getCartQuantityForVariant(cartItems, variantId) {
  return cartItems
    .filter((item) => item.variantId === variantId)
    .reduce((sum, item) => sum + item.quantity, 0);
}

function validateAvailableStock({ cartItems, variant, size, quantity }) {
  const requestedQty = Number.parseInt(quantity, 10) || 1;
  const inCartQty = getCartQuantityForVariant(cartItems, variant.id);
  const availableStock = Number(variant.stock) || 0;

  if (inCartQty + requestedQty > availableStock) {
    return getStockErrorMessage(size);
  }

  return null;
}

export const loadCart = createAsyncThunk('cart/load', async (user, { rejectWithValue }) => {
  if (!user || user.role !== 'user') return [];
  try {
    return mapCartResponse(await fetchCart());
  } catch (error) {
    return rejectWithValue(error?.message || 'No se pudo cargar el carrito.');
  }
});

export const addToCart = createAsyncThunk('cart/add', async (
  { product, quantity, size },
  { getState, rejectWithValue }
) => {
  const user = getState().auth.user;
  if (!user) return rejectWithValue('Debes iniciar sesión para agregar productos.');
  if (user.role !== 'user') return rejectWithValue('Esta cuenta no puede agregar productos al carrito.');
  const variant = product.variants?.find((item) => item.talle === size);
  if (!variant?.id) return rejectWithValue(`No se encontró la variante del talle ${size}.`);

  const stockError = validateAvailableStock({
    cartItems: getState().cart.items,
    variant,
    size,
    quantity
  });
  if (stockError) return rejectWithValue(stockError);

  try {
    return mapCartResponse(await addCartItem(variant.id, Number.parseInt(quantity, 10) || 1));
  } catch (error) {
    return rejectWithValue(mapCartErrorMessage(error, size));
  }
});

export const updateCartQuantity = createAsyncThunk('cart/updateQuantity', async (
  { cartKey, quantity },
  { dispatch, getState, rejectWithValue }
) => {
  const qty = Number.parseInt(quantity, 10) || 0;
  if (qty <= 0) return dispatch(removeFromCart(cartKey)).unwrap();
  const item = getState().cart.items.find((cartItem) => cartItem.cartKey === cartKey);
  if (!item) return rejectWithValue('Producto no encontrado en el carrito.');

  const product = getState().products.items.find((candidate) => candidate.id === item.productId);
  const variant = product?.variants?.find((candidate) => candidate.id === item.variantId);
  const stockError = validateAvailableStock({
    cartItems: getState().cart.items.filter((cartItem) => cartItem.cartKey !== cartKey),
    variant: { id: item.variantId, stock: variant?.stock ?? 0 },
    size: item.size,
    quantity: qty
  });
  if (stockError) return rejectWithValue(stockError);

  try {
    return mapCartResponse(await updateCartItem(item.itemId, qty));
  } catch (error) {
    return rejectWithValue(mapCartErrorMessage(error, item.size));
  }
});

export const removeFromCart = createAsyncThunk('cart/remove', async (cartKey, { getState, rejectWithValue }) => {
  const item = getState().cart.items.find((cartItem) => cartItem.cartKey === cartKey);
  if (!item) return rejectWithValue('Producto no encontrado en el carrito.');
  try {
    await deleteCartItem(item.itemId);
    return cartKey;
  } catch (error) {
    return rejectWithValue(error?.message || 'No se pudo eliminar el producto.');
  }
});

export const clearCart = createAsyncThunk('cart/clear', async (_, { getState, rejectWithValue }) => {
  const user = getState().auth.user;
  if (!user || user.role !== 'user') return;
  try {
    await clearCartItems();
  } catch (error) {
    return rejectWithValue(error?.message || 'No se pudo vaciar el carrito.');
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], loading: false, error: '' },
  reducers: {
    resetCart(state) {
      state.items = [];
      state.error = '';
      state.loading = false;
    }
  },
  extraReducers: (builder) => {
    const mutationRejected = (state, action) => {
      state.error = action.payload;
    };
    builder
      .addCase(loadCart.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(loadCart.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(loadCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addToCart.pending, (state) => {
        state.error = '';
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(addToCart.rejected, mutationRejected)
      .addCase(updateCartQuantity.pending, (state) => {
        state.error = '';
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        if (Array.isArray(action.payload)) state.items = action.payload;
      })
      .addCase(updateCartQuantity.rejected, mutationRejected)
      .addCase(removeFromCart.pending, (state) => {
        state.error = '';
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.cartKey !== action.payload);
      })
      .addCase(removeFromCart.rejected, mutationRejected)
      .addCase(clearCart.pending, (state) => {
        state.error = '';
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
      })
      .addCase(clearCart.rejected, mutationRejected);
    builder.addCase(placeOrder.fulfilled, (state) => {
      state.items = [];
      state.loading = false;
      state.error = '';
    });
    builder.addCase(logout, (state) => {
      state.items = [];
      state.loading = false;
      state.error = '';
    });
  }
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;
