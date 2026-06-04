# Circuitos de la Aplicación

Todos los flujos funcionales que puede recorrer un usuario dentro de Mundialista Store.

---

## Circuito de Inicio de Sesión (Login)

**Archivo principal:** `client/src/views/Login.jsx` + función `login()` en `App.jsx`

```
Usuario ingresa a /login
        │
        ▼
¿Ya tiene sesión activa?
   ├── SÍ → Redirige a /profile (user) o /admin/sales (admin)
   └── NO → Muestra el formulario de login
                │
                ▼
        Completa email + contraseña
                │
                ▼
        Presiona "Iniciar Sesión"
                │
                ▼
        handleSubmit() valida que
        los campos no estén vacíos
                │
        ┌───────┴───────┐
        │               │
      Vacíos          Completos
        │               │
     Muestra         Llama a login(email, password) en App.jsx
      error                   │
                              ▼
                   Busca en usersList[] si existe
                   un usuario con ese email y contraseña
                   (comparación case-insensitive de email)
                              │
                    ┌─────────┴─────────┐
                    │                   │
                 No existe           Existe
                    │                   │
                Muestra error      setUser({ name, email, role })
               "Credenciales          │
               incorrectas"      Se guarda en localStorage
                                 (camisetas_user)
                                       │
                                 Redirige según rol:
                                 ├── admin → /admin/sales
                                 └── user  → /profile
```

**Validaciones:**
- Campos obligatorios: email y contraseña
- Email se compara sin distinguir mayúsculas/minúsculas
- Contraseña se compara en texto plano (no hay hash en este proyecto)

---

## Circuito de Cierre de Sesión (Logout)

**Archivo principal:** función `logout()` en `App.jsx`, invocada desde `Navbar.jsx` y `Profile.jsx`

```
Usuario hace clic en "Cerrar Sesión"
        │
        ▼
Se llama a logout() en App.jsx
        │
        ▼
setUser(null)
        │
        ▼
useEffect detecta el cambio de user
        │
        ▼
localStorage.setItem('camisetas_user', JSON.stringify(null))
        │
        ▼
React re-renderiza el Navbar:
- Desaparece el menú de usuario
- Aparece el botón "Iniciar Sesión"
        │
        ▼
Si estaba en una ruta protegida (/admin):
la guarda de ruta redirige automáticamente a /login
```

**Nota:** El carrito y las órdenes **no** se borran al cerrar sesión. Solo se borra el estado del usuario activo.

---

## Circuito del Carrito — Recorrido Completo

**Archivos:** `ProductCard.jsx`, `ProductDetail.jsx`, `Cart.jsx`, `CartItem.jsx`, `CartSummary.jsx`, función `addToCart()` en `App.jsx`

```
Paso 1 — Agregar al carrito
═══════════════════════════
Usuario ve un producto (Home / Catalog / ProductDetail)
        │
        ▼
Selecciona talle y color
        │
        ▼
Hace clic en "Agregar al carrito"
        │
        ▼
Se llama a addToCart(product, quantity, size, color)
        │
        ▼
¿Hay sesión activa?
   ├── NO  → Redirige a /login
   └── SÍ  →
        ¿El usuario es admin?
        ├── SÍ → Muestra alerta "Administradores no pueden comprar"
        └── NO →
              Genera cartKey = `${product.id}-${size}-${color}`
                   │
              ¿El cartKey ya existe en el carrito?
              ├── SÍ → Suma la cantidad (respetando el stock disponible)
              └── NO → Agrega nuevo ítem al array cart[]
                   │
              setCart(nuevoCarrito)
                   │
              useEffect guarda en localStorage (camisetas_cart)


Paso 2 — Ver el carrito en /cart
══════════════════════════════════
El usuario navega a /cart (o hace clic en el ícono del navbar)
        │
        ▼
¿El carrito está vacío?
   ├── SÍ → Muestra estado vacío con botón "Explorar Tienda"
   └── NO → Renderiza:
              - Lista de CartItem (columna izquierda, 2/3 del ancho)
              - CartSummary con totales (columna derecha, 1/3 del ancho)


Paso 3 — Ajustar cantidades
════════════════════════════
Usuario toca el botón + o − en un CartItem
        │
        ▼
updateCartQuantity(cartKey, nuevaCantidad)
        │
        ▼
¿nuevaCantidad <= 0?
   ├── SÍ → removeFromCart(cartKey) — elimina el ítem
   └── NO → Actualiza el ítem con Math.min(nuevaCantidad, stock)


Paso 4 — Proceder al checkout
══════════════════════════════
Usuario hace clic en "Finalizar Compra" en CartSummary
        │
        ▼
Navega a /checkout
```

---

## Circuito de Eliminar un Producto del Carrito

**Archivos:** `CartItem.jsx` + función `removeFromCart()` en `App.jsx`

Hay tres formas de eliminar un producto del carrito:

```
FORMA 1: Botón "Eliminar" en CartItem
──────────────────────────────────────
Usuario hace clic en el ícono de papelera o "Eliminar"
        │
        ▼
removeFromCart(cartKey)
        │
        ▼
setCart(prevCart => prevCart.filter(item => item.cartKey !== cartKey))
        │
        ▼
El ítem desaparece de la lista
useEffect actualiza localStorage


FORMA 2: Bajar la cantidad a 0 con el botón −
───────────────────────────────────────────────
Usuario presiona − cuando la cantidad es 1
        │
        ▼
updateCartQuantity(cartKey, 0)   ← quantity - 1 = 0
        │
        ▼
Detecta qty <= 0
        │
        ▼
Llama a removeFromCart(cartKey)  → mismo resultado que FORMA 1


FORMA 3: Botón "Vaciar Carrito"
─────────────────────────────────
Usuario hace clic en "Vaciar Carrito" en la vista /cart
        │
        ▼
clearCart()
        │
        ▼
setCart([])   ← Array vacío
        │
        ▼
Todos los ítems desaparecen
La vista pasa al estado vacío
useEffect guarda [] en localStorage
```

**Clave técnica:** Cada ítem del carrito tiene un `cartKey` único con el formato `${productId}-${talle}-${color}`. Por ejemplo: `"4-M-Celeste"`. Esto permite que el mismo producto en distintos talles o colores exista como ítems separados.

---

## Circuito de Checkout — Fin de la Compra

**Archivos:** `Checkout.jsx`, `PaymentMethods.jsx`, `CheckoutSummary.jsx`, función `placeOrder()` en `App.jsx`

```
El usuario llega a /checkout
        │
        ▼
¿El carrito está vacío?
   ├── SÍ → Redirige automáticamente a /cart (Navigate)
   └── NO → Muestra el formulario

Muestra el formulario de envío:
- Nombre Completo (pre-completado si hay sesión)
- Email (pre-completado y bloqueado si hay sesión)
- Dirección de entrega
- Ciudad / Localidad
- Código Postal
- Teléfono de contacto

Muestra el selector de método de pago:
- Mercado Pago (seleccionado por defecto)
- Tarjeta de crédito/débito
- Transferencia bancaria
- Efectivo / Rapipago

Columna derecha: CheckoutSummary + botón "Finalizar Compra"

        │
        ▼
Usuario completa el formulario y hace clic en "Finalizar Compra"
        │
        ▼
handleSubmit() valida que todos los campos estén completos
        │
        ┌──────────────────┴──────────────────┐
        │                                     │
  Hay campos vacíos                     Todo completo
        │                                     │
  Muestra error                    Llama a placeOrder(formData, paymentMethod)
                                              │
                                              ▼
                                   Calcula el total
                                   (suma precio × cantidad de cada ítem)
                                              │
                                              ▼
                                   Crea el objeto orden:
                                   {
                                     id: "ORD-XXXXXX",  ← basado en timestamp
                                     date, time,
                                     userEmail, userName,
                                     items: [...enrichedCart],
                                     total,
                                     shippingInfo,
                                     paymentMethod,
                                     status: "Procesando"
                                   }
                                              │
                                              ▼
                                   Descuenta el stock de cada producto comprado:
                                   stock = Math.max(0, stock - cantidadComprada)
                                              │
                                              ▼
                                   setOrders([nuevaOrden, ...ordenesAnteriores])
                                   clearCart()  → setCart([])
                                              │
                                              ▼
                                   navigate('/order-success')
                                              │
                                              ▼
                                   Muestra la pantalla de confirmación
                                   con el número de orden (ej: ORD-123456)
```

**Estados posibles de una orden:**
`Procesando` → `Enviado` → `Entregado` (o `Cancelado`)

El admin puede cambiar el estado desde `/admin/orders/:id`.

---

## Circuito de Alta de Producto (Admin)

**Archivos:** `AdminInventory.jsx`, `AdminProductEdit.jsx`, función `addProduct()` en `App.jsx`

```
Admin accede a /admin/inventory
        │
        ▼
Hace clic en "Nuevo Producto"
        │
        ▼
Navega a /admin/products/new
        │
        ▼
Completa el formulario:
- Nombre del producto
- Precio
- Descripción
- Categoría (Titulares / Suplentes)
- Talles disponibles (S, M, L, XL — checkboxes)
- Colores disponibles (texto libre)
- URL de imagen
- Stock inicial
- ¿Es destacado? (toggle)
        │
        ▼
Hace clic en "Guardar Producto"
        │
        ▼
addProduct(newProductData) en App.jsx:
        │
        ▼
Calcula nuevo ID = Math.max(...products.map(p => p.id)) + 1
        │
        ▼
Construye el objeto del nuevo producto con:
- rating: 5.0 y reviewsCount: 0 (por defecto, producto nuevo)
- imagen de placeholder si no se proveyó URL
        │
        ▼
setProducts([...productosPrevios, nuevoProducto])
        │
        ▼
useEffect guarda en localStorage (camisetas_products)
        │
        ▼
El producto aparece en el catálogo público (/catalog)
y en la tabla de inventario (/admin/inventory)
```

**Para editar un producto existente:**
La ruta es `/admin/products/:id/edit`. El formulario se pre-carga con los datos actuales del producto. Al guardar, se llama a `updateProduct(productoActualizado)` que reemplaza el objeto en el array `products[]`.

---

## Circuito del Descuento de Envío

**Archivo:** `client/src/components/cart/CartSummary.jsx`

El proyecto no tiene un sistema de cupones o descuentos de precio. El único "descuento" disponible es el **envío gratis por superar un umbral de compra**.

```
CartSummary recibe el carrito como prop
        │
        ▼
Calcula el subtotal:
subtotal = suma de (precio × cantidad) de todos los ítems
        │
        ▼
Compara el subtotal contra el umbral de envío gratis ($60)
        │
        ┌────────────────────────┴────────────────────────┐
        │                                                  │
  subtotal >= $60                                  subtotal < $60
  (o carrito vacío)                                        │
        │                                         shippingCost = $5.00
  shippingCost = $0                               Muestra aviso:
  Muestra "Gratis"                                "Agrega $X.XX más para
        │                                          obtener Envío Gratis"
        └──────────────────────┬──────────────────────────┘
                               │
                               ▼
                    total = subtotal + shippingCost
                    (impuestos siempre $0.00)
                               │
                               ▼
                    Muestra el desglose:
                    Subtotal: $XXX.XX
                    Envío:    Gratis / $5.00
                    Impuestos: $0.00
                    ─────────────────
                    Total:    $XXX.XX
```

**Regla:** Si el subtotal es $60 o más, el costo de envío es $0 (gratis). Si es menor, el envío cuesta $5.00.

---

## Circuito de Registro de Usuario

**Archivos:** `Register.jsx`, función `registerUser()` en `App.jsx`

```
Usuario accede a /register
        │
        ▼
Completa: nombre, email, contraseña, confirmar contraseña
        │
        ▼
handleSubmit() valida:
- Todos los campos completos
- La contraseña tiene al menos 6 caracteres
- Las contraseñas coinciden
        │
        ▼
registerUser(name, email, password) en App.jsx:
        │
        ▼
¿El email ya existe en usersList[]?
   ├── SÍ → Retorna { success: false, message: "El correo ya está registrado" }
   └── NO → Crea { name, email, password, role: 'user' }
              │
              ▼
           setUsersList([...usuariosPrevios, nuevoUsuario])
           useEffect guarda en localStorage (camisetas_users_list)
              │
              ▼
           navigate('/register-success')
           Muestra pantalla de confirmación con enlace a /login
```

**Restricción:** No se pueden crear usuarios con rol `admin`. El admin es único y predefinido.
