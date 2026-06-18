import { createSelector } from '@reduxjs/toolkit';

export const selectUser = (state) => state.auth.user;
export const selectAuthReady = (state) => state.auth.ready;
export const selectProducts = (state) => state.products.items;
export const selectCart = (state) => state.cart.items;
export const selectFavorites = (state) => state.favorites.items;
export const selectOrders = (state) => state.orders.items;

export const selectEnrichedCart = createSelector(
  [selectCart, selectProducts],
  (cart, products) => cart.map((item) => ({
    ...item,
    product: products.find((product) => product.id === item.product.id) || item.product
  }))
);

export const selectEnrichedOrders = createSelector(
  [selectOrders, selectProducts, selectUser],
  (orders, products, user) => orders.map((order) => ({
    ...order,
    userName: order.userEmail === user?.email
      ? `${user.name} ${user.apellido || ''}`.trim()
      : order.userName,
    items: order.items.map((item) => ({
      ...item,
      product: products.find((product) => product.id === item.productId) || item.product
    }))
  }))
);

export const selectCartCount = createSelector(
  [selectEnrichedCart],
  (cart) => cart.reduce((sum, item) => sum + item.quantity, 0)
);
