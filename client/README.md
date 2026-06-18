# Mundialista Store

Frontend del e-commerce de camisetas de selecciones nacionales, desarrollado
con React, Redux Toolkit, Vite y Tailwind CSS. Consume la API REST del proyecto
`marketplace`.

## Requisitos

- Node.js 18 o superior.
- npm.
- Backend ejecutándose en http://localhost:8080.

## Levantar la aplicación

1. Desde `marketplace`, iniciar el backend:

```powershell
.\scripts\start-backend.ps1
```

2. En otra terminal, desde `EccomerceCamisetas-Front\client`:

```powershell
npm install
npm run dev
```

3. Abrir http://localhost:5173 o el puerto informado por Vite.

La primera ejecución puede demorar mientras se descargan las dependencias.

## Credenciales de administrador

| Rol | Email | Contraseña |
|---|---|---|
| Admin | `admin@uade.edu.ar` | `123456` |

También es posible registrar un usuario comprador desde la aplicación.

## Funcionalidades

- Registro, login y restauración de sesión mediante JWT.
- Catálogo conectado al backend con búsqueda, ordenamiento y filtros.
- Filtros por país, tipo, género, talle con stock y precio.
- Detalle de producto y selección de talle y cantidad.
- Favoritos persistidos por usuario.
- Carrito persistido en el backend.
- Checkout con validación y descuento de stock.
- Historial de pedidos para compradores.
- Panel administrativo de productos, usuarios, inventario y pedidos.
- Bloqueo de cambios de estado para pedidos cancelados.
- Indicadores visuales durante operaciones asíncronas.

## Persistencia

Los productos, usuarios, favoritos, carritos, pedidos y stocks se guardan en el
backend. El navegador conserva únicamente el token JWT necesario para restaurar
la sesión.

## Arquitectura Redux

El estado global está organizado en `src/store`:

```text
store/
├── store.js
├── selectors.js
├── useShopActions.js
└── slices/
    ├── authSlice.js
    ├── productsSlice.js
    ├── cartSlice.js
    ├── favoritesSlice.js
    └── ordersSlice.js
```

- `store.js` configura el store con Redux Toolkit.
- Los slices separan autenticación, catálogo, carrito, favoritos y pedidos.
- Las operaciones contra la API utilizan `createAsyncThunk`.
- Los selectores calculan el carrito y los pedidos enriquecidos con los datos
  actuales del catálogo.
- Las vistas leen el estado mediante `useSelector`.
- Las acciones se despachan desde `useShopActions`, que adapta los resultados
  de Redux a los flujos visuales de la aplicación.
- Los estados puramente visuales y formularios continúan usando `useState`.

## Rutas principales

| Ruta | Vista |
|---|---|
| `/` | Inicio |
| `/catalog` | Catálogo y filtros |
| `/product/:id` | Detalle de producto |
| `/cart` | Carrito |
| `/checkout` | Finalizar compra |
| `/login` | Inicio de sesión |
| `/register` | Registro |
| `/profile` | Perfil y pedidos |
| `/admin/sales` | Ventas y pedidos |
| `/admin/inventory` | Inventario |
| `/admin/products/new` | Alta de producto |
| `/admin/users/add` | Alta de usuario |

## Reglas principales

- Los administradores no pueden comprar ni utilizar el carrito.
- Un usuario no autenticado es enviado al login al intentar comprar.
- El backend valida el stock al confirmar el pedido.
- El stock se descuenta al comprar y se repone al cancelar.
- Un pedido cancelado no puede cambiar nuevamente de estado.

## Configuración de la API

Por defecto se utiliza `http://localhost:8080`. Puede cambiarse creando un
archivo `.env` en `client`:

```env
VITE_API_URL=http://localhost:8080
```

## Verificación

```powershell
npm run lint
npm run build
```

## Tecnologías

- React 19.
- Redux Toolkit 2.
- React Redux 9.
- React Router DOM 7.
- Vite 8.
- Tailwind CSS 4.
