# Stack Tecnológico

## ¿Con qué desarrollaron el frontend?

El frontend fue desarrollado con las siguientes tecnologías:

### Framework y librería de UI

| Tecnología | Versión | Rol |
|---|---|---|
| **React** | 19.2.6 | Librería principal para construir interfaces. Permite crear componentes reutilizables que reaccionan a cambios de estado. |
| **React DOM** | 19.2.6 | Renderiza los componentes React en el navegador (conecta React con el DOM real). |
| **React Router DOM** | 7.15.1 | Maneja la navegación entre páginas sin recargar el browser (SPA — Single Page Application). |

### Build tool

| Tecnología | Versión | Rol |
|---|---|---|
| **Vite** | 8.0.12 | Bundler y servidor de desarrollo ultrarrápido. Reemplaza a Create React App. Ofrece Hot Module Replacement (HMR), que actualiza el browser en tiempo real mientras se escribe código. |

### Estilos

| Tecnología | Versión | Rol |
|---|---|---|
| **Tailwind CSS** | 4.3.0 | Framework de CSS utilitario. En lugar de escribir CSS tradicional, se aplican clases directamente en el HTML/JSX (ej: `text-sm`, `bg-white`, `rounded-lg`). |

### Linting y calidad de código

| Tecnología | Versión | Rol |
|---|---|---|
| **ESLint** | 10.3.0 | Analiza el código en busca de errores y malas prácticas antes de que la app corra. |

---

## ¿Hay un backend?

**Sí.** El TPO tiene un backend completo desarrollado con **Spring Boot** (Java), con base de datos **H2** y autenticación mediante **JWT (JSON Web Token)**.

| Tecnología | Rol |
|---|---|
| **Spring Boot** | Framework del servidor REST |
| **H2 (file-based)** | Base de datos embebida (`jdbc:h2:file:./data/marketplace`) |
| **Spring Data JPA** | Acceso a datos y persistencia |
| **JWT** | Autenticación stateless con tokens |
| **Springdoc / Swagger** | Documentación interactiva de la API |

### Stack completo del proyecto

```
┌─────────────────────┐        HTTP/REST        ┌──────────────────────┐
│   Frontend          │ ──────────────────────► │   Backend            │
│   React + Vite      │ ◄────────────────────── │   Spring Boot (Java) │
│   Tailwind CSS      │      JSON responses      │   Puerto 8080        │
└─────────────────────┘                         └──────────┬───────────┘
                                                           │
                                                           ▼
                                                ┌──────────────────────┐
                                                │   Base de Datos      │
                                                │   H2 (archivo local) │
                                                └──────────────────────┘
```

### Estado actual del frontend

El frontend actualmente opera en **modo standalone**: usa `localStorage` del navegador como capa de datos temporal, sin conectarse al backend. Esto permite desarrollar y demostrar la interfaz de forma independiente mientras se define la integración.

Cuando se integren ambas capas, las funciones internas de `App.jsx` (`addToCart`, `login`, `placeOrder`, etc.) serán reemplazadas por llamadas HTTP a los endpoints reales del backend.

---

## ¿Qué es una API?

**API** significa **Application Programming Interface** (Interfaz de Programación de Aplicaciones).

Es un contrato que define cómo dos sistemas de software pueden comunicarse entre sí. Especifica:
- **Qué se puede pedir** (endpoints o funciones disponibles)
- **Cómo pedirlo** (formato de los parámetros)
- **Qué se va a recibir** como respuesta

### Los endpoints reales del backend (Spring Boot)

```
POST /api/auth/login                  → autentica un usuario, devuelve JWT
POST /api/auth/register               → registra un nuevo usuario
GET  /api/catalogo/paises             → lista de países disponibles
POST /api/camisetas                   → crea una camiseta (ADMIN)
POST /api/camisetas/{id}/variantes    → agrega variante de talle/color
POST /api/carrito/items               → agrega ítem al carrito
POST /api/pedidos                     → crea un pedido (checkout)
GET  /api/usuarios/me                 → datos del usuario autenticado
```

La documentación interactiva completa del backend está disponible en Swagger:
`http://localhost:8080/swagger-ui/index.html` (con el backend corriendo)

### La "API interna" del frontend actual

Mientras el frontend opera en modo standalone, se construyó una **"API interna"**: funciones JavaScript en `App.jsx` que cumplen el mismo rol que los endpoints del backend. Cada una tiene su equivalente real:

| Función interna | Equivalente en API REST |
|---|---|
| `addToCart(product, qty, size, color)` | `POST /api/cart/items` |
| `removeFromCart(cartKey)` | `DELETE /api/cart/items/:key` |
| `login(email, password)` | `POST /api/auth/login` |
| `registerUser(name, email, password)` | `POST /api/auth/register` |
| `placeOrder(shippingInfo, paymentMethod)` | `POST /api/orders` |
| `addProduct(productData)` | `POST /api/products` |
| `updateProduct(product)` | `PUT /api/products/:id` |
| `deleteProduct(id)` | `DELETE /api/products/:id` |

---

## Scripts disponibles

Ejecutar desde la carpeta `client/`:

```bash
npm run dev      # Inicia el servidor de desarrollo en http://localhost:5173
npm run build    # Genera la versión de producción optimizada en /dist
npm run lint     # Ejecuta ESLint para revisar errores de código
npm run preview  # Sirve el build de producción localmente para preview
```

---

## Estructura de carpetas del proyecto

```
Front/
├── docs/                          ← Esta documentación
├── client/
│   ├── index.html                 ← Punto de entrada HTML
│   ├── vite.config.js             ← Configuración de Vite + Tailwind
│   └── src/
│       ├── main.jsx               ← Monta el componente App en el DOM
│       ├── App.jsx                ← Estado global + rutas + lógica de negocio
│       ├── index.css              ← Tailwind + variables de diseño (colores, tipografías)
│       ├── data/
│       │   └── products.js        ← Catálogo inicial de productos (6 camisetas)
│       ├── components/
│       │   ├── layout/            ← Navbar, Footer, Layout wrapper
│       │   ├── product/           ← ProductCard, ProductGrid, ProductFilters
│       │   ├── cart/              ← CartItem, CartSummary
│       │   ├── checkout/          ← PaymentMethods, CheckoutSummary
│       │   ├── admin/             ← AdminSidebar
│       │   └── ui/                ← Form (Input, Select, Button reutilizables)
│       └── views/
│           ├── Home.jsx           ← Página de inicio con productos destacados
│           ├── Catalog.jsx        ← Catálogo filtrable
│           ├── ProductDetail.jsx  ← Detalle de un producto
│           ├── Cart.jsx           ← Carrito de compras
│           ├── Checkout.jsx       ← Formulario de envío + pago
│           ├── OrderSuccess.jsx   ← Confirmación de orden
│           ├── Login.jsx          ← Inicio de sesión
│           ├── Register.jsx       ← Registro de usuario
│           ├── Profile.jsx        ← Perfil del usuario + historial
│           └── admin/             ← Panel de administración
│               ├── AdminLayout.jsx
│               ├── AdminSales.jsx
│               ├── AdminInventory.jsx
│               ├── AdminProductEdit.jsx
│               ├── AdminUserAdd.jsx
│               └── AdminOrderDetail.jsx
```
