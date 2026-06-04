# Arquitectura y Datos

## Arquitectura sin backend

Este proyecto tiene una arquitectura **cliente únicamente** (client-only). No existe un servidor separado ni una API REST:

```
┌─────────────────────────────────────────────────────┐
│                   NAVEGADOR DEL USUARIO              │
│                                                     │
│   ┌──────────────────────────────────────────────┐  │
│   │              React App (App.jsx)              │  │
│   │                                              │  │
│   │  Estado Global (useState)                    │  │
│   │  ├── products[]                              │  │
│   │  ├── cart[]                                  │  │
│   │  ├── user {}                                 │  │
│   │  ├── orders[]                                │  │
│   │  └── usersList[]                             │  │
│   │                                              │  │
│   │  Funciones (props hacia abajo)               │  │
│   │  addToCart / removeFromCart / login / ...    │  │
│   └──────────────────┬───────────────────────────┘  │
│                      │ lee/escribe                   │
│   ┌──────────────────▼───────────────────────────┐  │
│   │              localStorage                     │  │
│   │  camisetas_products | camisetas_cart          │  │
│   │  camisetas_user     | camisetas_orders        │  │
│   │  camisetas_users_list                         │  │
│   └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**No hay petición de red.** Todo sucede dentro del mismo navegador.

---

## Persistencia de datos — ¿Cómo nos "conectamos" con la base de datos?

En lugar de una base de datos tradicional (MySQL, PostgreSQL, MongoDB), el proyecto usa el **`localStorage`** del navegador como capa de persistencia.

### ¿Qué es el localStorage?

Es un almacenamiento clave-valor que el navegador ofrece a cada sitio web. Los datos:
- Sobreviven a recargas y cierre de pestañas
- Se borran si el usuario limpia datos del navegador o usa modo incógnito
- Solo existen en ese dispositivo y ese navegador
- Guardan datos como texto (por eso se usa `JSON.stringify` al escribir y `JSON.parse` al leer)

### Claves utilizadas

| Clave localStorage | Contenido |
|---|---|
| `camisetas_products` | Array de todos los productos (con stock actualizado) |
| `camisetas_cart` | Array de ítems del carrito (id+talle+color+cantidad) |
| `camisetas_user` | Objeto del usuario logueado (o `null`) |
| `camisetas_orders` | Array de todas las órdenes generadas |
| `camisetas_users_list` | Array de todos los usuarios registrados |

### Sincronización automática

En `App.jsx`, cada estado tiene un `useEffect` que escucha cambios y guarda al `localStorage`:

```javascript
// Cada vez que "cart" cambia, se guarda automáticamente
useEffect(() => {
  localStorage.setItem('camisetas_cart', JSON.stringify(cart));
}, [cart]);
```

Al iniciar la app, cada estado se inicializa leyendo del `localStorage`:

```javascript
const [cart, setCart] = useState(() => {
  const saved = localStorage.getItem('camisetas_cart');
  return saved ? JSON.parse(saved) : [];
});
```

---

## ¿Cómo se conecta el back con el front?

**No hay conexión con un backend** porque el proyecto no tiene backend. Toda la lógica que normalmente viviría en un servidor (validar usuarios, gestionar stock, crear órdenes) está implementada en el frontend.

### ¿Cómo se comunican los componentes entre sí?

La comunicación interna sigue el patrón de React: **flujo unidireccional de datos** (props hacia abajo, eventos hacia arriba).

```
                         App.jsx
                    (Estado Global + Funciones)
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
           Cart.jsx    Checkout.jsx  Login.jsx
    (recibe cart,   (recibe cart,  (recibe user,
    updateQty,       placeOrder)    login fn)
    removeFromCart)
              │
              ▼
         CartItem.jsx
    (recibe item,
    updateQty,
    removeFromCart)
```

1. El estado global vive en `App.jsx`
2. `App.jsx` pasa datos y funciones a cada vista como `props`
3. Los componentes hijos llaman a esas funciones cuando el usuario interactúa
4. Eso actualiza el estado en `App.jsx`, que re-renderiza todo lo que corresponda

---

## Datos iniciales (seed)

El archivo `src/data/products.js` exporta `INITIAL_PRODUCTS`: un array con los 6 productos de camisetas que se cargan la primera vez que se ejecuta la app.

```
Brazil Seleção         — $115.00  — Titular  — stock: 22
Japan Samurai Spirit   — $98.00   — Suplente — stock: 6
England Three Lions    — $115.00  — Titular  — stock: 16
Argentina Scaloneta    — $120.00  — Titular  — stock: 12
France Allez les Bleus — $110.00  — Suplente — stock: 8
Germany Nationalelf    — $115.00  — Suplente — stock: 14
```

Si el localStorage ya tiene datos guardados de una sesión anterior, se usan esos (con el stock actualizado por compras previas). Si los datos guardados están desactualizados (por ejemplo, le falta el producto "Argentina Scaloneta"), se descartan y se vuelve a los datos de fábrica.

---

## Usuarios por defecto

Al inicializar la app por primera vez, se crean dos usuarios de prueba:

| Nombre | Email | Contraseña | Rol |
|---|---|---|---|
| Admin | admin@tshirt.com | admin | admin |
| Test User | test@tshirt.com | user | user |

Los administradores tienen acceso al panel `/admin` pero **no pueden agregar productos al carrito**.

---

## Rutas de la aplicación

### Rutas públicas (con Navbar y Footer)

| Ruta | Componente | Descripción |
|---|---|---|
| `/` | Home | Página de inicio con productos destacados |
| `/catalog` | Catalog | Catálogo completo con filtros |
| `/product/:id` | ProductDetail | Detalle de un producto específico |
| `/cart` | Cart | Carrito de compras |
| `/checkout` | Checkout | Formulario de envío y pago |
| `/order-success` | OrderSuccess | Confirmación de compra exitosa |
| `/login` | Login | Inicio de sesión |
| `/register` | Register | Registro de nuevo usuario |
| `/register-success` | RegisterSuccess | Confirmación de registro |
| `/profile` | Profile | Perfil y historial de compras |
| `/contact` | Contact | Formulario de contacto |
| `/terms-conditions` | TermsConditions | Términos y condiciones |
| `/privacy-policy` | PrivacyPolicy | Política de privacidad |
| `*` | NotFound | Página 404 |

### Rutas de administración (requieren rol `admin`)

| Ruta | Componente | Descripción |
|---|---|---|
| `/admin` | — | Redirige automáticamente a `/admin/sales` |
| `/admin/sales` | AdminSales | Dashboard de ventas y órdenes |
| `/admin/inventory` | AdminInventory | Tabla de productos con editar/eliminar |
| `/admin/products/new` | AdminProductEdit | Formulario para crear un producto |
| `/admin/products/:id/edit` | AdminProductEdit | Formulario para editar un producto |
| `/admin/users/add` | AdminUserAdd | Formulario para agregar un usuario |
| `/admin/orders/:id` | AdminOrderDetail | Detalle de una orden específica |

Si un usuario sin rol `admin` intenta acceder a `/admin`, es redirigido automáticamente a `/login`.
