import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  addCartItem,
  clearCartItems,
  deleteCartItem,
  fetchCart,
  mapCartResponse,
  updateCartItem
} from '../../services/api';

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
  try {
    return mapCartResponse(await addCartItem(variant.id, Number.parseInt(quantity, 10) || 1));
  } catch (error) {
    return rejectWithValue(error?.message || 'No se pudo agregar el producto al carrito.');
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
  try {
    return mapCartResponse(await updateCartItem(item.itemId, qty));
  } catch (error) {
    return rejectWithValue(error?.message || 'No se pudo actualizar la cantidad.');
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
    const pending = (state) => {
      state.loading = true;
      state.error = '';
    };
    const rejected = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };
    builder
      .addCase(loadCart.pending, pending)
      .addCase(loadCart.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(loadCart.rejected, rejected)
      .addCase(addToCart.pending, pending)
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(addToCart.rejected, rejected)
      .addCase(updateCartQuantity.pending, pending)
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        if (Array.isArray(action.payload)) state.items = action.payload;
        state.loading = false;
      })
      .addCase(updateCartQuantity.rejected, rejected)
      .addCase(removeFromCart.pending, pending)
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.cartKey !== action.payload);
        state.loading = false;
      })
      .addCase(removeFromCart.rejected, rejected)
      .addCase(clearCart.pending, pending)
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.loading = false;
      })
      .addCase(clearCart.rejected, rejected);
  }
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;
