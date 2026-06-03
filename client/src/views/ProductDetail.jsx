// Vista del detalle de un producto
// Muestra la imagen ampliada, descripción completa, selector de talle y color, y el botón de compra.
// Si el usuario es admin, solo muestra la info sin los controles de compra.
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

function ProductDetail({ products = [], addToCart }) {
  // Leo el usuario del localStorage para saber si es admin (igual que en ProductCard)
  const storedUser = localStorage.getItem('camisetas_user') ? JSON.parse(localStorage.getItem('camisetas_user')) : null;
  const isAdmin = storedUser && storedUser.role === 'admin';

  // Obtengo el id de la URL con useParams y busco el producto correspondiente
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === parseInt(id, 10));

  // Estado local de las selecciones del usuario: talle, color y cantidad
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Cuando se carga el producto (o cambia), inicializo las selecciones con los primeros valores
  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0] || '');
      setSelectedColor(product.colors[0] || '');
      setQuantity(1);
    }
  }, [product]);

  // Si el producto no existe (ID inválido o fue eliminado), muestro un mensaje de error
  if (!product) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4 text-antracita">
        <h2 className="text-xl font-bold font-title">Camiseta no encontrada</h2>
        <p className="text-sm text-neutral-500">El producto solicitado no existe o ha sido retirado de nuestra tienda.</p>
        <Link to="/catalog" className="inline-block bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-5 rounded-lg transition-colors cursor-pointer shadow-sm">
          Volver al catálogo
        </Link>
      </main>
    );
  }

  // Agrego el producto al carrito con la talla, color y cantidad seleccionados
  const handleAddToCart = () => {
    if (product.stock === 0) return;  // no hago nada si está agotado
    const success = addToCart(product, quantity, selectedSize, selectedColor);
    if (success) {
      alert(`¡"${product.name}" (${selectedSize} - ${selectedColor}) agregada al carrito!`);
    }
  };

  // Si la imagen del producto falla, muestro la imagen de fallback del producto o una genérica
  const handleImageError = (e) => {
    e.target.src = product.fallbackImage || "/assets/success.svg";
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-antracita bg-cream min-h-screen">

      {/* Breadcrumb: muestra la ruta de navegación para que el usuario sepa dónde está */}
      <nav className="text-xs text-neutral-500 mb-8" aria-label="Breadcrumb">
        <ul className="flex items-center space-x-2 font-semibold">
          <li>
            <Link to="/" className="hover:text-primary">Inicio</Link>
          </li>
          <li><span>/</span></li>
          <li>
            <Link to="/catalog" className="hover:text-primary">Catálogo</Link>
          </li>
          <li><span>/</span></li>
          {/* Nombre del producto actual (truncado si es muy largo) */}
          <li className="text-antracita font-bold truncate">{product.name}</li>
        </ul>
      </nav>

      {/* Contenido principal: imagen a la izquierda e información a la derecha */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-10 shadow-sm">

        {/* Columna izquierda: imagen del producto */}
        <div className="relative aspect-[4/5] bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200">
          <img
            src={product.image}
            alt={`Detalle de la camiseta ${product.name}`}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
          {/* Badge de agotado sobre la imagen */}
          {product.stock === 0 && (
            <span className="absolute top-4 left-4 bg-red-600 text-white text-xs uppercase font-bold tracking-wider px-3 py-1.5 rounded-lg shadow-md">
              Agotado
            </span>
          )}
          {/* Badge personalizado (ej: NUEVO, OFERTA) si el producto lo tiene */}
          {product.badge && (
            <span className="absolute top-4 left-4 bg-primary text-white text-xs uppercase font-bold tracking-wider px-3 py-1.5 rounded-lg shadow-md font-title">
              {product.badge}
            </span>
          )}
        </div>

        {/* Columna derecha: información y controles de compra */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Categoría del producto como badge */}
            <span className="bg-cream text-primary text-[10px] font-bold tracking-wider px-3 py-1 rounded-full border border-neutral-200 uppercase">
              {product.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-antracita leading-tight font-title">{product.name}</h1>

            {/* Precio en grande */}
            <p className="text-2xl font-black text-antracita font-title">${product.price.toFixed(2)}</p>

            <hr className="border-neutral-100" />

            {/* Descripción del producto */}
            <p className="text-sm text-neutral-500 leading-relaxed">{product.description}</p>
          </div>

          {/* Controles de configuración: talle, color y cantidad */}
          <div className="space-y-6 pt-4">

            {/* Selector de talle */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-neutral-500 tracking-wider uppercase block">Talles Disponibles</span>
              <div className="flex gap-2.5">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-10 h-10 flex items-center justify-center text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      selectedSize === size
                        ? 'bg-primary border-primary text-white shadow-sm'   // talle activo
                        : 'bg-cream border-neutral-200 text-antracita hover:border-neutral-350'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de color */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-neutral-500 tracking-wider uppercase block">Colores</span>
              <div className="flex gap-2.5">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`text-xs py-1.5 px-4 rounded-lg border transition-all cursor-pointer ${
                      selectedColor === color
                        ? 'bg-primary border-primary text-white shadow-sm'   // color activo
                        : 'bg-cream border-neutral-200 text-antracita hover:border-neutral-350'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de cantidad y botón de compra — solo para usuarios normales, no para el admin */}
            {!isAdmin ? (
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {/* Control de cantidad: − número + */}
                <div className="flex items-center space-x-3 bg-cream border border-neutral-200 px-3.5 py-2 rounded-lg self-start shadow-inner">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}  // no permite bajar de 1
                    className="text-neutral-500 hover:text-antracita text-lg font-bold w-6 text-center cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-antracita text-sm font-bold w-6 text-center">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}  // no permite superar el stock
                    disabled={quantity >= product.stock}
                    className={`text-neutral-500 hover:text-antracita text-lg font-bold w-6 text-center cursor-pointer ${
                      quantity >= product.stock ? 'opacity-50' : ''
                    }`}
                  >
                    +
                  </button>
                </div>

                {/* Botón principal de agregar al carrito */}
                <div className="flex-grow">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className={`w-full text-center font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-lg shadow-md transition-all duration-200 cursor-pointer ${
                      product.stock === 0
                        ? 'bg-neutral-100 border border-neutral-200 text-neutral-400 cursor-not-allowed shadow-none'
                        : 'bg-primary hover:bg-primary/95 text-white shadow-primary/10 hover:shadow-primary/20'
                    }`}
                  >
                    {product.stock === 0 ? 'Agotado Temporalmente' : 'Agregar al Carrito'}
                  </button>
                </div>
              </div>
            ) : (
              /* Mensaje para el admin indicando que no puede comprar */
              <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-lg text-xs text-neutral-500 font-semibold">
                Vista de administrador: Los administradores no tienen carrito de compras ni pueden realizar pedidos.
              </div>
            )}

          </div>
        </div>
      </section>
    </main>
  );
}

export default ProductDetail;
