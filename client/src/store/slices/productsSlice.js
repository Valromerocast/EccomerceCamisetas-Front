import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  createProduct,
  deleteProduct as deleteProductRequest,
  fetchProducts,
  mapProductResponse,
  updateProduct as updateProductRequest,
} from '../../services/api';
import { getCachedProducts } from '../catalogCache';
import { placeOrder, updateOrderStatus } from './ordersSlice';

const cachedProducts = getCachedProducts();

export const loadProducts = createAsyncThunk(
  'products/load',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchProducts();
    } catch (error) {
      return rejectWithValue(error?.message || 'No se pudo cargar el catálogo desde el backend.');
    }
  },
  {
    condition: (options, { getState }) => (
      Boolean(options?.force) || !getState().products.cacheReady
    )
  }
);

export const addProduct = createAsyncThunk('products/add', async (
  { product, variants },
  { getState, rejectWithValue }
) => {
  try {
    const productIndex = getState().products.items.length;
    const created = await createProduct({
      ...product,
      variantes: variants.map((variant) => ({
        talleId: variant.talleId,
        stock: variant.stock,
        sku: variant.sku,
        color: variant.color
      }))
    });
    return mapProductResponse(created, productIndex);
  } catch (error) {
    return rejectWithValue(error?.message || 'No se pudo crear el producto.');
  }
});

export const updateProduct = createAsyncThunk('products/update', async (
  { productId, data },
  { getState, rejectWithValue }
) => {
  try {
    const currentProduct = getState().products.items.find((item) => item.id === productId);
    const productIndex = getState().products.items.findIndex((item) => item.id === productId);
    const updated = await updateProductRequest(productId, {
      ...data.product,
      variantes: data.variants.map((variant) => ({
        talleId: variant.talleId,
        stock: variant.stock,
        sku: variant.sku,
        color: variant.color
      }))
    });
    return {
      ...mapProductResponse(updated, productIndex),
      featured: currentProduct?.featured ?? productIndex < 4
    };
  } catch (error) {
    return rejectWithValue(error?.message || 'No se pudo actualizar el producto.');
  }
});

export const deleteProduct = createAsyncThunk('products/delete', async (
  productId,
  { rejectWithValue }
) => {
  try {
    await deleteProductRequest(productId);
    return productId;
  } catch (error) {
    return rejectWithValue(error?.message || 'No se pudo eliminar el producto.');
  }
});

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: cachedProducts || [],
    cacheReady: cachedProducts !== null,
    loading: false,
    error: ''
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadProducts.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(loadProducts.fulfilled, (state, action) => {
        state.items = action.payload;
        state.cacheReady = true;
        state.loading = false;
      })
      .addCase(loadProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addProduct.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.cacheReady = true;
        state.loading = false;
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex((product) => product.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
        state.cacheReady = true;
        state.loading = false;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((product) => product.id !== action.payload);
        state.cacheReady = true;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        updateStockFromOrder(state.items, action.payload, -1);
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        if (action.payload.status === 'Cancelado') {
          updateStockFromOrder(state.items, action.payload, 1);
        }
      });
  }
});

function updateStockFromOrder(products, order, direction) {
  for (const item of order.items) {
    const product = products.find((candidate) => candidate.id === item.productId);
    const variant = product?.variants.find((candidate) => candidate.id === item.variantId);
    if (!product || !variant) continue;

    variant.stock = Math.max(0, variant.stock + direction * item.quantity);
    product.stock[variant.talle] = variant.stock;
  }
}

export default productsSlice.reducer;
