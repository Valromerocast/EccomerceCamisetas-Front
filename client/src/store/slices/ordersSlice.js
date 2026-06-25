import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { changeOrderStatus, createOrder, fetchOrders } from '../../services/api';
import { logout } from './authSlice';

export const loadOrders = createAsyncThunk('orders/load', async (_, { rejectWithValue }) => {
  try {
    return await fetchOrders();
  } catch (error) {
    return rejectWithValue(error?.message || 'No se pudieron cargar los pedidos.');
  }
});

export const placeOrder = createAsyncThunk('orders/place', async (extra, { rejectWithValue }) => {
  try {
    return await createOrder(extra);
  } catch (error) {
    return rejectWithValue(error?.message || 'No se pudo crear el pedido.');
  }
});

export const updateOrderStatus = createAsyncThunk('orders/updateStatus', async (
  { orderId, newStatus },
  { getState, rejectWithValue }
) => {
  const order = getState().orders.items.find((item) => item.id === orderId);
  if (!order) return rejectWithValue('Pedido no encontrado.');
  if (order.status === 'Cancelado') return rejectWithValue('Un pedido cancelado no puede cambiar de estado.');
  try {
    const updated = await changeOrderStatus(order.backendId, newStatus);
    return {
      ...updated,
      userName: order.userName,
      shippingInfo: order.shippingInfo,
      paymentMethod: order.paymentMethod
    };
  } catch (error) {
    return rejectWithValue(error?.message || 'No se pudo actualizar el pedido.');
  }
});

const ordersSlice = createSlice({
  name: 'orders',
  initialState: { items: [], loading: false, creating: false, error: '' },
  reducers: {
    resetOrders(state) {
      state.items = [];
      state.error = '';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadOrders.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(loadOrders.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(loadOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(placeOrder.pending, (state) => {
        state.creating = true;
        state.error = '';
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items];
        state.creating = false;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.items = state.items.map((item) => item.id === action.payload.id ? action.payload : item);
      })
      .addCase(logout, (state) => {
        state.items = [];
        state.loading = false;
        state.creating = false;
        state.error = '';
      });
  }
});

export const { resetOrders } = ordersSlice.actions;
export default ordersSlice.reducer;
