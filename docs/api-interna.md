# API Interna — Funciones, Conectores y Flujo de Datos

---

## ¿Por qué llamarla "API interna"?

El TPO tiene un backend real en Spring Boot que expone una API REST. Sin embargo, el frontend actualmente opera en **modo standalone** (sin conexión al backend), usando funciones JavaScript en `App.jsx` como capa de datos temporal.

Se las llama "API interna" porque cumplen exactamente el mismo rol que los endpoints del backend: definen qué operaciones están disponibles, qué parámetros reciben y qué devuelven. Cuando se realice la integración, estas funciones serán reemplazadas por llamadas HTTP reales.

---

## Seguridad en el backend — JWT (JSON Web Token)

El backend implementa autenticación con JWT. Es importante entender cómo funciona para la integración futura:

### ¿Qué es un JWT?

Es un token (cadena de texto codificada) que el backend genera al hacer login. Contiene información del usuario (email, rol) firmada digitalmente para que no pueda ser falsificada.

```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c3VhcmlvQGVtYWlsLmNvbSIsInJvbCI6IlVTRVIifQ.firma
     HEADER                          PAYLOAD                              SIGNATURE
```

### Flujo de autenticación con JWT (backend)

```
1. Frontend envía: POST /api/auth/login  { email, password }
        │
        ▼
2. Backend valida credenciales contra la base de datos H2
        │
        ▼
3. Backend genera y devuelve: { token: "eyJ..." }
        │
        ▼
4. Frontend guarda el token (localStorage o memoria)
        │
        ▼
5. En cada petición protegida, frontend envía el header:
   Authorization: Bearer eyJ...
        │
        ▼
6. JwtAuthenticationFilter del backend intercepta la petición,
   valida el token y carga el usuario en el contexto de seguridad
        │
        ▼
7. Si el token es válido → procesa la petición
   Si no → devuelve 401 Unauthorized
```

### Roles y permisos del backend

| Rol | Acceso |
|---|---|
| **PÚBLICO** | Login, registro, leer catálogo de camisetas |
| **USER** | Todo lo anterior + carrito y checkout |
| **ADMIN** | Todo lo anterior + gestión de camisetas, stock, descuentos y usuarios |

---

## Funciones del Carrito

### `addToCart(product, quantity, size, color)`

Agrega un producto al carrito o incrementa su cantidad si ya existe.

| Parámetro | Tipo | Descripción |
|---|---|---|
| `product` | Object | Objeto completo del producto |
| `quantity` | Number | Cantidad a agregar (se convierte a entero) |
| `size` | String | Talle seleccionado (ej: `"M"`) |
| `color` | String | Color seleccionado (ej: `"Celeste"`) |

**Retorna:** `true` si se agregó, `false` si fue bloqueado (sin sesión o usuario admin).

**Efectos secundarios:**
- Si no hay sesión activa: redirige a `/login`
- Si el usuario es admin: muestra alerta y retorna `false`
- Actualiza `cart[]` en el estado de App
- El `useEffect` persiste el nuevo carrito en `localStorage`

**Clave técnica — `cartKey`:**
Cada ítem se identifica con `${product.id}-${size}-${color}`. Esto permite que la misma camiseta en distinto talle o color sea un ítem independiente:
```
"4-M-Celeste"    ← Argentina Scaloneta, talle M, color Celeste
"4-L-Blanco"     ← Argentina Scaloneta, talle L, color Blanco  (ítem distinto)
"1-M-Amarillo"   ← Brazil Seleção, talle M, color Amarillo
```

**Restricción de stock:** nunca permite agregar más unidades de las que hay disponibles. Usa `Math.min(cantidad, stock)`.

---

### `updateCartQuantity(cartKey, quantity)`

Cambia la cantidad de un ítem ya existente en el carrito.

| Parámetro | Tipo | Descripción |
|---|---|---|
| `cartKey` | String | Clave única del ítem (ej: `"4-M-Celeste"`) |
| `quantity` | Number | Nueva cantidad deseada |

**Retorna:** nada (`void`).

**Efectos secundarios:**
- Si `quantity <= 0`: llama a `removeFromCart(cartKey)` internamente — elimina el ítem
- Si `quantity > stock`: aplica `Math.min(quantity, stock)` — no permite superar el stock
- Actualiza `cart[]` y persiste en `localStorage`

---

### `removeFromCart(cartKey)`

Elimina un ítem específico del carrito.

| Parámetro | Tipo | Descripción |
|---|---|---|
| `cartKey` | String | Clave única del ítem a eliminar |

**Retorna:** nada (`void`).

**Efectos secundarios:**
- Filtra el array `cart[]` descartando el ítem con ese `cartKey`
- Persiste el carrito actualizado en `localStorage`

---

### `clearCart()`

Vacía el carrito por completo.

**Parámetros:** ninguno.

**Retorna:** nada (`void`).

**Efectos secundarios:**
- Llama a `setCart([])` — reemplaza el carrito con un array vacío
- Persiste `[]` en `localStorage`
- Se llama automáticamente al finalizar una compra exitosa (`placeOrder`)

---

## Funciones de Autenticación

### `login(email, password)`

Verifica las credenciales contra la lista de usuarios registrados.

| Parámetro | Tipo | Descripción |
|---|---|---|
| `email` | String | Email del usuario (sin distinguir mayúsculas) |
| `password` | String | Contraseña en texto plano |

**Retorna:** objeto con resultado:
```javascript
// Éxito:
{ success: true, user: { name, email, role } }

// Fallo:
{ success: false, message: "Credenciales incorrectas" }
```

**Efectos secundarios (solo en éxito):**
- Llama a `setUser({ name, email, role })` — activa la sesión
- El `useEffect` guarda el usuario en `localStorage` (`camisetas_user`)
- La vista `Login.jsx` redirige según el rol: admin → `/admin/sales`, user → `/profile`

---

### `logout()`

Cierra la sesión del usuario activo.

**Parámetros:** ninguno.

**Retorna:** nada (`void`).

**Efectos secundarios:**
- Llama a `setUser(null)` — elimina la sesión
- El `useEffect` guarda `null` en `localStorage`
- React re-renderiza el Navbar: desaparece el menú de usuario
- Las rutas protegidas `/admin` redirigen automáticamente a `/login`
- El carrito y las órdenes **no se borran**

---

### `registerUser(name, email, password, role)`

Registra un nuevo usuario en el sistema.

| Parámetro | Tipo | Descripción |
|---|---|---|
| `name` | String | Nombre del usuario |
| `email` | String | Email (debe ser único) |
| `password` | String | Contraseña en texto plano |
| `role` | String | Rol del usuario — siempre `'user'` desde el registro público |

**Retorna:** objeto con resultado:
```javascript
// Éxito:
{ success: true }

// Fallo — rol admin:
{ success: false, message: "No se pueden registrar más administradores." }

// Fallo — email duplicado:
{ success: false, message: "El correo electrónico ya está registrado." }
```

**Efectos secundarios (solo en éxito):**
- Agrega el nuevo usuario a `usersList[]`
- El `useEffect` persiste la lista en `localStorage` (`camisetas_users_list`)

---

## Funciones de Órdenes

### `placeOrder(shippingInfo, paymentMethod)`

Crea una orden nueva a partir del carrito actual y descuenta el stock.

| Parámetro | Tipo | Descripción |
|---|---|---|
| `shippingInfo` | Object | `{ fullName, email, address, city, zipCode, phone }` |
| `paymentMethod` | String | Método seleccionado (ej: `"mercadopago"`, `"credit"`) |

**Retorna:**
```javascript
// Éxito:
{ success: true, orderId: "ORD-XXXXXX" }

// Fallo — carrito vacío:
{ success: false, message: "El carrito está vacío" }
```

**Efectos secundarios (solo en éxito):**
1. Calcula el total sumando `precio × cantidad` de cada ítem del `enrichedCart`
2. Genera un ID único: `"ORD-" + Date.now().toString().slice(-6)` (últimos 6 dígitos del timestamp)
3. Crea el objeto orden con status `"Procesando"`
4. Descuenta el stock de cada producto: `stock = Math.max(0, stock - cantidadComprada)`
5. Agrega la orden al inicio de `orders[]` (la más reciente aparece primero)
6. Llama a `clearCart()` — vacía el carrito
7. Persiste `orders[]` y `products[]` en `localStorage`

---

### `updateOrderStatus(orderId, newStatus)`

Cambia el estado de una orden existente. Solo usada por el admin.

| Parámetro | Tipo | Descripción |
|---|---|---|
| `orderId` | String | ID de la orden (ej: `"ORD-123456"`) |
| `newStatus` | String | Nuevo estado: `"Procesando"`, `"Enviado"`, `"Entregado"`, `"Cancelado"` |

**Retorna:** nada (`void`).

**Efectos secundarios:**
- Reemplaza el estado de la orden en `orders[]`
- Persiste el cambio en `localStorage`

---

## Funciones de Administración de Productos

### `addProduct(newProductData)`

Crea un nuevo producto en el catálogo.

| Parámetro | Tipo | Descripción |
|---|---|---|
| `newProductData` | Object | `{ name, price, description, category, sizes[], colors[], image, stock, featured }` |

**Retorna:** nada (`void`).

**Efectos secundarios:**
- Calcula el nuevo ID: `Math.max(...products.map(p => p.id)) + 1`
- Asigna valores por defecto: `rating: 5.0`, `reviewsCount: 0`
- Si no hay imagen, usa `'/assets/hero-left.svg'` como placeholder
- Agrega el producto al final de `products[]`
- Persiste en `localStorage`

---

### `updateProduct(updatedProduct)`

Reemplaza los datos de un producto existente.

| Parámetro | Tipo | Descripción |
|---|---|---|
| `updatedProduct` | Object | Objeto completo del producto con los nuevos valores |

**Retorna:** nada (`void`).

**Efectos secundarios:**
- Busca el producto por `id` y lo reemplaza en `products[]`
- Persiste en `localStorage`
- Los ítems del carrito que tengan ese producto serán actualizados automáticamente en el próximo render por el mecanismo `enrichedCart`

---

### `deleteProduct(id)`

Elimina un producto del catálogo.

| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | Number | ID del producto a eliminar |

**Retorna:** nada (`void`).

**Efectos secundarios:**
- Filtra `products[]` descartando el producto con ese `id`
- Persiste en `localStorage`
- Si el producto estaba en el carrito, el ítem queda "huérfano" (el carrito lo tendrá con datos desactualizados)

---

## El Carrito Enriquecido (`enrichedCart`)

### El problema que resuelve

El carrito se guarda en `localStorage` con una copia del objeto producto en el momento de la compra. Si el admin edita un producto después (cambia el precio, actualiza el stock), el carrito tendría datos desactualizados.

### Cómo funciona

`enrichedCart` no es una función que se llama: es una **variable derivada** que se recalcula en cada render de `App.jsx`:

```javascript
const enrichedCart = cart.map((item) => {
  const freshProduct = products.find((p) => p.id === item.product.id) || item.product;
  return {
    ...item,
    product: freshProduct   // reemplaza la copia vieja por el producto actual
  };
});
```

### Flujo de datos del enrichedCart

```
localStorage
    │
    ▼
cart[] (datos del momento en que se agregó el ítem)
    │
    ├── item.product.id = 4
    ├── item.quantity = 2
    ├── item.size = "M"
    └── item.product.price = 120   ← puede estar desactualizado
    
products[] (datos actuales, con cambios del admin)
    │
    └── producto id=4, price = 135  ← admin actualizó el precio

         ↓ combinar en cada render

enrichedCart[] (lo que se pasa a Cart.jsx, Checkout.jsx, placeOrder)
    │
    ├── item.quantity = 2
    ├── item.size = "M"
    └── item.product.price = 135   ← precio actualizado
```

**Resultado:** el carrito siempre muestra y cobra el precio y stock más recientes, aunque el usuario lo haya agregado antes de que el admin editara el producto.

---

## Conectores de React Router

React Router DOM es la librería que permite navegar entre páginas sin recargar el browser. Estos son los "conectores" que se usan en el proyecto:

---

### `<BrowserRouter>` (aliasado como `<Router>`)

**Archivo:** `App.jsx` (envuelve toda la aplicación)

Es el proveedor raíz. Habilita el sistema de rutas para todos los componentes hijos. Lee la URL del navegador y decide qué componente renderizar.

```jsx
<Router>
  <Routes>
    ...
  </Routes>
</Router>
```

Sin este componente, ningún otro conector de React Router funcionaría.

---

### `<Routes>` y `<Route>`

**Archivo:** `App.jsx`

`<Routes>` es el contenedor de todas las rutas. Evalúa la URL actual y renderiza solo la primera `<Route>` que coincida.

`<Route>` define la asociación entre una URL y un componente:

```jsx
<Route path="/cart" element={<Cart cart={enrichedCart} ... />} />
```

**Rutas anidadas:** cuando una `<Route>` tiene hijas, el componente padre debe tener un `<Outlet>` para indicar dónde renderizarlas. Por ejemplo, todas las rutas públicas están dentro de una `<Route>` que renderiza `<Layout>`, que incluye el Navbar y el Footer.

---

### `<Outlet>`

**Archivos:** `Layout.jsx`, `AdminLayout.jsx`

Marca el lugar dentro de un componente padre donde se va a renderizar la ruta hija activa.

```
Ruta padre: <Layout> (con Navbar y Footer)
    │
    └── <Outlet>  ← acá aparece Home, Catalog, Cart, etc. según la URL
```

Sin `<Outlet>`, el contenido de las rutas hijas nunca se mostraría.

---

### `<Navigate>`

**Archivos:** `App.jsx`, `Login.jsx`, `Checkout.jsx`

Componente declarativo para redirigir al usuario a otra ruta. Se renderiza en lugar de un componente cuando se cumple una condición.

```jsx
// En Checkout.jsx: si el carrito está vacío, redirigir al carrito
if (cart.length === 0) {
  return <Navigate to="/cart" replace />;
}

// En App.jsx: si el usuario no es admin, redirigir al login
element={user?.role === 'admin' ? <AdminLayout /> : <Navigate to="/login" replace />}
```

La prop `replace` evita que la redirección quede en el historial del navegador (no se puede volver atrás con el botón de back).

---

### `<Link>`

**Archivos:** Navbar, Footer, Cart, CartSummary, CartItem, y otros

Equivalente al `<a>` de HTML pero sin recargar la página. Intercepta el clic y actualiza la URL usando el historial del navegador.

```jsx
<Link to="/catalog">Ver catálogo</Link>
<Link to={`/product/${product.id}`}>Ver detalle</Link>
```

Si se usara `<a href="/catalog">` en su lugar, el browser recargaría la página completa y se perdería todo el estado (carrito, sesión, etc.).

---

### `useNavigate()`

**Archivos:** `Login.jsx`, `Register.jsx`, `Checkout.jsx`

Hook que devuelve una función para navegar programáticamente (desde código JavaScript, no desde JSX).

```jsx
const navigate = useNavigate();

// Después de un login exitoso:
navigate('/profile');

// Después de confirmar una compra:
navigate('/order-success');
```

Se usa cuando la navegación depende de una acción asíncrona o de una condición en el código (como el resultado de un `login()` o un `placeOrder()`).

---

### `useParams()`

**Archivos:** `ProductDetail.jsx`, `AdminProductEdit.jsx`, `AdminOrderDetail.jsx`

Hook que extrae los parámetros dinámicos de la URL.

```jsx
// Ruta definida como: /product/:id
const { id } = useParams();
// Si la URL es /product/4, id === "4"

// Se usa para buscar el producto correspondiente:
const product = products.find(p => p.id === parseInt(id));
```

---

### `useLocation()` y `useSearchParams()`

**Archivo:** `Catalog.jsx`

`useSearchParams()` lee y modifica los query parameters de la URL (`?clave=valor`).

```jsx
const [searchParams] = useSearchParams();
const query = searchParams.get('q');        // /catalog?q=argentina → "argentina"
const category = searchParams.get('category'); // /catalog?category=Titulares
```

Esto permite que el catálogo sea filtrable y que el estado del filtro sea compartible por URL (si se copia y pega el link, el filtro se mantiene).
