# Mundialista Store 🏆

E-commerce de camisetas de fútbol de selecciones nacionales. Proyecto frontend desarrollado con **React + Vite + Tailwind CSS**.

---

## ¿Cómo iniciar el proyecto?

### Requisitos previos
- Node.js instalado (versión 18 o superior)
- npm

### Pasos

Primero iniciar el backend desde la carpeta `marketplace`:

```powershell
.\scripts\start-backend.ps1
```

Luego, en otra terminal, iniciar el frontend desde
`EccomerceCamisetas-Front\client`:

```bash
# 1. Instalar las dependencias
npm install

# 2. Iniciar el servidor de desarrollo
npm run dev
```

La app queda disponible en `http://localhost:5173` (o el puerto que indique la terminal).

---

## Credenciales de prueba

| Rol | Email | Contraseña |
|---|---|---|
| Admin | admin@mail.com | Password123! |

---

## Estructura del proyecto

```
src/
├── data/
│   └── products.js       # Array con todos los productos del catálogo
├── components/           # Componentes reutilizables
│   ├── layout/           # Navbar, Footer, Layout principal
│   ├── product/          # ProductCard, ProductGrid
│   ├── cart/             # CartItem, CartSummary
│   ├── checkout/         # CheckoutSummary, PaymentMethods
│   ├── admin/            # AdminSidebar
│   └── ui/               # Form (Input, Select, Button)
├── views/                # Páginas de la aplicación
│   ├── Home.jsx
│   ├── Catalog.jsx
│   ├── ProductDetail.jsx
│   ├── Cart.jsx
│   ├── Checkout.jsx
│   ├── OrderSuccess.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Profile.jsx
│   ├── Contact.jsx
│   └── admin/
│       ├── AdminLayout.jsx
│       ├── AdminSales.jsx
│       ├── AdminInventory.jsx
│       ├── AdminProductEdit.jsx
│       ├── AdminOrderDetail.jsx
│       └── AdminUserAdd.jsx
├── App.jsx               # Estado global, rutas y lógica central
├── main.jsx              # Punto de entrada de React
└── index.css             # Estilos globales y tokens de Tailwind
```

---

## Componentes principales

### `App.jsx`
Es el corazón de la app. Maneja el estado global con `useState`:
- **products** → catálogo de camisetas
- **cart** → artículos en el carrito
- **user** → usuario logueado
- **orders** → historial de órdenes

Todo se persiste en `localStorage` con `useEffect` para que los datos no se pierdan al recargar.

### `Layout.jsx` / `AdminLayout.jsx`
Envuelven las vistas con `<Outlet>` de React Router. `Layout` agrega Navbar y Footer para las rutas públicas; `AdminLayout` pone el sidebar para las rutas `/admin/*`.

### `Navbar.jsx`
Barra de navegación fija. Incluye buscador (que filtra por URL), links a categorías, ícono de perfil y carrito con badge de cantidad. En mobile se colapsa en menú hamburguesa.

### `ProductCard.jsx`
Tarjeta de producto con selector de talle, botón de agregar al carrito y badges de stock. Los admins no ven los controles de compra.

### `AdminSidebar.jsx`
Panel lateral del administrador con navegación a Ventas, Inventario y Clientes.

---

## Rutas disponibles

| Ruta | Vista |
|---|---|
| `/` | Home con productos destacados |
| `/catalog` | Catálogo completo con filtros |
| `/product/:id` | Detalle de producto |
| `/cart` | Carrito de compras |
| `/checkout` | Finalizar compra |
| `/order-success` | Confirmación de compra |
| `/login` | Iniciar sesión |
| `/register` | Crear cuenta |
| `/profile` | Perfil y pedidos del usuario |
| `/contact` | Página de contacto |
| `/admin/sales` | Panel admin → Ventas |
| `/admin/inventory` | Panel admin → Inventario |
| `/admin/users/add` | Panel admin → Agregar usuario |

---

## Reglas de negocio

- Los **administradores no tienen carrito** y no pueden comprar.
- Solo puede existir **un único admin** (no se pueden registrar más desde el formulario).
- Si un usuario no está logueado e intenta agregar un producto al carrito, **se redirige al login**.
- El stock se descuenta automáticamente al confirmar una compra.
- Envío gratis.

---

## Tecnologías usadas

- [React 18](https://react.dev/) — librería de UI con componentes y hooks
- [Vite](https://vitejs.dev/) — bundler y servidor de desarrollo
- [React Router DOM](https://reactrouter.com/) — navegación entre vistas (SPA)
- [Tailwind CSS](https://tailwindcss.com/) — estilos utilitarios
