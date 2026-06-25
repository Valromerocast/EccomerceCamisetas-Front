import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore
} from 'redux-persist';
import storageModule from 'redux-persist/lib/storage/index.js';
import { setAuthTokenProvider } from '../services/api';
import authReducer from './slices/authSlice';
import productsReducer from './slices/productsSlice';
import cartReducer from './slices/cartSlice';
import favoritesReducer from './slices/favoritesSlice';
import ordersReducer from './slices/ordersSlice';
import catalogReducer from './slices/catalogSlice';
import notificationsReducer from './slices/notificationsSlice';

const storage = storageModule.default || storageModule;

const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'token']
};

const productsPersistConfig = {
  key: 'products',
  storage,
  whitelist: ['items', 'lastFetched']
};

const catalogPersistConfig = {
  key: 'catalog',
  storage,
  whitelist: ['options', 'lastFetched']
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  products: persistReducer(productsPersistConfig, productsReducer),
  cart: cartReducer,
  favorites: favoritesReducer,
  orders: ordersReducer,
  catalog: persistReducer(catalogPersistConfig, catalogReducer),
  notifications: notificationsReducer
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
    }
  })
});

setAuthTokenProvider(() => store.getState().auth.token);

export const persistor = persistStore(store);
