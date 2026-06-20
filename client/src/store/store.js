import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productsReducer from './slices/productsSlice';
import cartReducer from './slices/cartSlice';
import favoritesReducer from './slices/favoritesSlice';
import ordersReducer from './slices/ordersSlice';
import { cacheProducts } from './catalogCache';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    cart: cartReducer,
    favorites: favoritesReducer,
    orders: ordersReducer
  }
});

let previousProducts = store.getState().products.items;

store.subscribe(() => {
  const productsState = store.getState().products;
  if (productsState.cacheReady && productsState.items !== previousProducts) {
    previousProducts = productsState.items;
    cacheProducts(productsState.items);
  }
});
