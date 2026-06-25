import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchCatalogOptions } from '../../services/api';

const CATALOG_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export const loadCatalogOptions = createAsyncThunk(
  'catalog/loadOptions',
  async (_, { rejectWithValue }) => {
    try {
      return {
        options: await fetchCatalogOptions(),
        fetchedAt: Date.now()
      };
    } catch (error) {
      return rejectWithValue(error?.message || 'No se pudieron cargar las opciones del catálogo.');
    }
  },
  {
    condition: (options, { getState }) => (
      Boolean(options?.force)
      || getState().catalog.options.countries.length === 0
      || Date.now() - getState().catalog.lastFetched >= CATALOG_MAX_AGE_MS
    )
  }
);

const catalogSlice = createSlice({
  name: 'catalog',
  initialState: {
    options: {
      countries: [],
      types: [],
      genders: [],
      sizes: []
    },
    lastFetched: 0,
    loading: false,
    error: ''
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadCatalogOptions.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(loadCatalogOptions.fulfilled, (state, action) => {
        state.options = action.payload.options;
        state.lastFetched = action.payload.fetchedAt;
        state.loading = false;
      })
      .addCase(loadCatalogOptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default catalogSlice.reducer;
