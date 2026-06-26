import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { addFavorite, deleteFavorite, fetchFavorites } from '../../services/api';
import { logout } from './authSlice';

export const loadFavorites = createAsyncThunk('favorites/load', async (user, { rejectWithValue }) => {
  if (!user || user.role !== 'user') return [];
  try {
    return await fetchFavorites();
  } catch (error) {
    return rejectWithValue(error?.message || 'No se pudieron cargar los favoritos.');
  }
});

export const toggleFavorite = createAsyncThunk('favorites/toggle', async (productId, { getState, rejectWithValue }) => {
  const user = getState().auth.user;
  if (!user) return rejectWithValue('Debes iniciar sesión para guardar favoritos.');
  if (user.role !== 'user') return rejectWithValue('Esta cuenta no puede guardar favoritos.');
  const id = Number(productId);
  const shouldBeFavorite = getState().favorites.items.includes(id);
  try {
    if (shouldBeFavorite) await addFavorite(id);
    else await deleteFavorite(id);
    return { id, shouldBeFavorite };
  } catch (error) {
    return rejectWithValue(error?.message || 'No se pudo actualizar el favorito.');
  }
});

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: { items: [], loading: false, error: '' },
  reducers: {
    resetFavorites(state) {
      state.items = [];
      state.error = '';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadFavorites.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(loadFavorites.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(loadFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(toggleFavorite.pending, (state, action) => {
        const id = Number(action.meta.arg);
        state.items = state.items.includes(id)
          ? state.items.filter((item) => item !== id)
          : [...state.items, id];
        state.error = '';
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        const id = Number(action.meta.arg);
        state.items = state.items.includes(id)
          ? state.items.filter((item) => item !== id)
          : [...state.items, id];
        state.error = action.payload;
      })
      .addCase(logout, (state) => {
        state.items = [];
        state.loading = false;
        state.error = '';
      });
  }
});

export const { resetFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
