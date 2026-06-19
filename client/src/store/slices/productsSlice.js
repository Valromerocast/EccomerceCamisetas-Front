import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  createProduct,
  createProductVariant,
  deleteProduct as deleteProductRequest,
  deleteProductVariant,
  fetchProducts,
  updateProduct as updateProductRequest,
  updateProductVariant
} from '../../services/api';
import { cacheProducts, getCachedProducts } from '../catalogCache';

const cachedProducts = getCachedProducts();

export const loadProducts = createAsyncThunk(
  'products/load',
  async (_, { rejectWithValue }) => {
    try {
      const products = await fetchProducts();
      cacheProducts(products);
      return products;
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
  { dispatch, rejectWithValue }
) => {
  try {
    const created = await createProduct({
      ...product,
      variantes: variants.map((variant) => ({
        talleId: variant.talleId,
        stock: variant.stock,
        sku: variant.sku,
        color: variant.color
      }))
    });
    await dispatch(loadProducts({ force: true })).unwrap();
    return created.id;
  } catch (error) {
    return rejectWithValue(error?.message || 'No se pudo crear el producto.');
  }
});

export const updateProduct = createAsyncThunk('products/update', async (
  { productId, data },
  { dispatch, getState, rejectWithValue }
) => {
  try {
    await updateProductRequest(productId, data.product);
    const currentProduct = getState().products.items.find((item) => item.id === productId);
    const existingBySize = new Map((currentProduct?.variants || []).map((variant) => [variant.talle, variant]));
    const requestedSizes = new Set(data.variants.map((variant) => variant.sizeName));

    for (const variant of data.variants) {
      const existing = existingBySize.get(variant.sizeName);
      const payload = {
        talleId: variant.talleId,
        stock: variant.stock,
        sku: variant.sku,
        color: variant.color
      };
      if (existing) await updateProductVariant(existing.id, payload);
      else await createProductVariant(productId, payload);
    }

    for (const existing of currentProduct?.variants || []) {
      if (!requestedSizes.has(existing.talle)) await deleteProductVariant(existing.id);
    }

    await dispatch(loadProducts({ force: true })).unwrap();
    return productId;
  } catch (error) {
    return rejectWithValue(error?.message || 'No se pudo actualizar el producto.');
  }
});

export const deleteProduct = createAsyncThunk('products/delete', async (
  productId,
  { getState, rejectWithValue }
) => {
  try {
    await deleteProductRequest(productId);
    cacheProducts(getState().products.items.filter((product) => product.id !== productId));
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
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((product) => product.id !== action.payload);
      });
  }
});

export default productsSlice.reducer;
