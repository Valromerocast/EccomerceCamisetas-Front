# División de slices Redux

Esta rama `redux-products` deja preparada la parte de Redux correspondiente al
catálogo de productos.

## Responsable de esta rama

- `productsSlice.js`: camisetas, carga del catálogo, alta, edición,
  eliminación, cache por tiempo y actualización local de stock.
- `catalogSlice.js`: opciones auxiliares del catálogo, como países, tipos,
  géneros y talles.

## Infraestructura común

- `store.js`: configuración general de Redux Toolkit y Redux Persist.
- `authSlice.js`: base de autenticación necesaria para que las llamadas
  protegidas a la API tengan token desde Redux Persist.

## Pendiente para otros integrantes

- `cartSlice.js`: carrito.
- `favoritesSlice.js`: favoritos.
- `ordersSlice.js`: pedidos y checkout.
- `notificationsSlice.js`: notificaciones globales.

La idea es que cada integrante pueda tomar su slice y defender el mismo flujo:

```text
Componente React
-> useDispatch()
-> createAsyncThunk / action
-> API o reducer
-> store global
-> useSelector()
-> render sin efectos secundarios
```
