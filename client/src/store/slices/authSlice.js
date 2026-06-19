import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  clearAuthToken,
  createUserAsAdmin,
  fetchCurrentUser,
  getAuthToken,
  loginUser,
  registerUser
} from '../../services/api';

const errorMessage = (error, fallback) => error?.message || fallback;

export const restoreSession = createAsyncThunk('auth/restoreSession', async (_, { rejectWithValue }) => {
  if (!getAuthToken()) return null;
  try {
    return await fetchCurrentUser();
  } catch (error) {
    clearAuthToken();
    return rejectWithValue(errorMessage(error, 'No se pudo restaurar la sesión.'));
  }
});

export const login = createAsyncThunk('auth/login', async (
  { email, password, rememberMe },
  { rejectWithValue }
) => {
  try {
    return await loginUser(email, password, rememberMe);
  } catch (error) {
    return rejectWithValue(error?.status === 401 ? 'Credenciales incorrectas.' : errorMessage(error, 'No se pudo iniciar sesión.'));
  }
});

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    return await registerUser({
      nombre: payload.nombre || payload.name || '',
      apellido: payload.apellido || payload.lastName || payload.surname || '',
      email: payload.email || '',
      password: payload.password || ''
    });
  } catch (error) {
    return rejectWithValue(errorMessage(error, 'No se pudo registrar el usuario.'));
  }
});

export const createAdminUser = createAsyncThunk('auth/createAdminUser', async (payload, { rejectWithValue }) => {
  try {
    return await createUserAsAdmin({
      nombre: payload.nombre || payload.name || '',
      apellido: payload.apellido || payload.lastName || payload.surname || '',
      email: payload.email || '',
      password: payload.password || '',
      rol: 'USER'
    });
  } catch (error) {
    return rejectWithValue(errorMessage(error, 'No se pudo crear el usuario.'));
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    ready: false,
    loading: false,
    error: ''
  },
  reducers: {
    logout(state) {
      clearAuthToken();
      state.user = null;
      state.error = '';
      state.ready = true;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.pending, (state) => {
        state.ready = false;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.ready = true;
      })
      .addCase(restoreSession.rejected, (state, action) => {
        state.user = null;
        state.error = action.payload;
        state.ready = true;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
