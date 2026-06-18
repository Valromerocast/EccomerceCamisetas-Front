// Vista del detalle de un producto
// Muestra la imagen ampliada, descripción completa, selector de talle y color, y el botón de compra.
// Si el usuario es admin, solo muestra la info sin los controles de compra.
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useNotification } from '../components/ui/useNotification';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import { useSelector } from 'react-redux';
import { selectProducts, selectUser } from '../store/selectors';
import { useShopActions } from '../store/useShopActions';
import { applyTeamCrestFallback } from '../utils/teamCrest';

function getStockForSize(product, size) {
  if (!product) {
    return 0;
  }

  return typeof product.stock === 'object' && product.stock !== null
    ? (parseInt(product.stock[size], 10) || 0)
    : parseInt(product.stock, 10) || 0;
}

function ProductDetail() {
  const user = useSelector(selectUser);
  const products = useSelector(selectProducts);
  const productsLoading = useSelector((state) => state.products.loading);
  const productsError = useSelector((state) => state.products.error);
  const { addToCart } = useShopActions();
  const { showNotification } = useNotification();
  const [addingToCart, setAddingToCart] = useState(false);
  const canUseShoppingFeatures = !user || user.role === 'user';

  // Obtengo el id de la URL con useParams y busco el producto correspondiente
  const { id } = useParams();
  const product = products.find((p) => p.id === parseInt(id, 10));

  const defaultSize = product?.sizes.find((size) => getStockForSize(product, size) > 0)
    || product?.sizes[0]
    || '';
  const [selection, setSelection] = useState({
    productId: null,
    size: '',
    quantity: 1
  });
  const selectedSize = selection.productId === product?.id ? selection.size : defaultSize;
  const quantity = selection.productId === product?.id ? selection.quantity : 1;

  // Calcular stock total y stock para el talle seleccionado
  const totalStock = product
    ? (typeof product.stock === 'object' && product.stock !== null
      ? Object.values(product.stock).reduce((sum, qty) => sum + (parseInt(qty, 10) || 0), 0)
      : parseInt(product.stock, 10) || 0)
    : 0;

  const currentSizeStock = getStockForSize(product, selectedSize);

  const selectSize = (size) => {
    setSelection({
      productId: product.id,
      size,
      quantity: 1
    });
  };

  const changeQuantity = (update) => {
    setSelection((current) => {
      const currentQuantity = current.productId === product.id ? current.quantity : 1;
      return {
        productId: product.id,
        size: selectedSize,
        quantity: update(currentQuantity)
      };
    });
  };

  // Si el producto no existe (ID inválido o fue eliminado), muestro un mensaje de error
  if (productsLoading && !product) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4 text-antracita">
        <h2 className="text-xl font-bold font-title">Cargando camiseta...</h2>
        <p className="text-sm text-neutral-500">Estamos consultando el catalogo del backend.</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4 text-antracita">
        <h2 className="text-xl font-bold font-title">Camiseta no encontrada</h2>
        <p className="text-sm text-neutral-500">{productsError || 'El producto solicitado no existe o ha sido retirado de nuestra tienda.'}</p>
        <Link to="/catalog" className="inline-block bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-5 rounded-lg transition-colors cursor-pointer shadow-sm">
          Volver al catálogo
        </Link>
      </main>
    );
  }

  const productSpecs = product.specs || {
    composition: "100% Poliéster reciclado de alta densidad",
    technology: "Tejido transpirable de alto rendimiento",
    details: "Escudo y logotipo bordados con costuras reforzadas",
    origin: "Importado / Réplica oficial premium"
  };

  // Agrego el producto al carrito con la talla y cantidad seleccionados
  const handleAddToCart = async () => {
    if (currentSizeStock === 0) return;  // no hago nada si está agotado
    setAddingToCart(true);
    try {
      const success = await addToCart(product, quantity, selectedSize);
      if (success) {
        showNotification({
          type: 'success',
          message: `¡"${product.name}" (${selectedSize}) agregada al carrito!`
        });
      }
    } finally {
      setAddingToCart(false);
    }
  };

  // Si la imagen externa falla, mantengo el detalle con una imagen genérica.
  const handleImageError = (e) => {
    applyTeamCrestFallback(e, product);
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
        <div className="relative aspect-[4/5] bg-white rounded-xl overflow-hidden border border-neutral-200 self-start">
          <img
            src={product.image}
            alt={`Detalle de la camiseta ${product.name}`}
            className="w-full h-full object-contain p-4"
            onError={handleImageError}
          />
          {/* Badge de agotado sobre la imagen */}
          {totalStock === 0 && (
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
          <div className="space-y-5">
            {/* Categoría del producto como badge */}
            <span className="inline-block bg-cream text-primary text-[10px] font-bold tracking-wider px-3 py-1 rounded-full border border-neutral-200 uppercase mb-2">
              {product.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-antracita leading-tight font-title">{product.name}</h1>

            {/* Precio en grande */}
            <p className="text-2xl font-black text-antracita font-title">${product.price.toFixed(2)}</p>

            <hr className="border-neutral-100" />

            {/* Descripción del producto */}
            <p className="text-sm text-neutral-500 leading-relaxed">{product.description}</p>

            {/* Detalles Técnicos y Composición */}
            <div className="pt-2 space-y-2">
              <h4 className="text-[10px] font-bold text-neutral-500 tracking-wider uppercase">Especificaciones del producto</h4>
              <ul className="text-xs text-neutral-500 space-y-1 list-disc pl-4 font-semibold">
                <li><strong>Composición:</strong> {productSpecs.composition}</li>
                <li><strong>Tecnología:</strong> {productSpecs.technology}</li>
                <li><strong>Detalles:</strong> {productSpecs.details}</li>
                <li><strong>Origen:</strong> {productSpecs.origin}</li>
              </ul>
            </div>

            {/* Tabla de Medidas */}
            <div className="pt-2 space-y-2">
              <h4 className="text-[10px] font-bold text-neutral-500 tracking-wider uppercase">Guía de Talles y Medidas</h4>
              <div className="overflow-hidden border border-neutral-200 rounded-lg shadow-sm bg-cream">
                <table className="min-w-full text-center text-xs">
                  <thead className="bg-neutral-100 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2 px-3">Talle</th>
                      <th className="py-2 px-3">Ancho (Axila a Axila)</th>
                      <th className="py-2 px-3">Largo (Hombro a Cintura)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 text-neutral-600 font-semibold bg-white">
                    <tr>
                      <td className="py-1.5 px-3">S</td>
                      <td className="py-1.5 px-3">50 cm</td>
                      <td className="py-1.5 px-3">70 cm</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3">M</td>
                      <td className="py-1.5 px-3">52 cm</td>
                      <td className="py-1.5 px-3">72 cm</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3">L</td>
                      <td className="py-1.5 px-3">54 cm</td>
                      <td className="py-1.5 px-3">74 cm</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3">XL</td>
                      <td className="py-1.5 px-3">56 cm</td>
                      <td className="py-1.5 px-3">76 cm</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Controles de configuración: talle, color y cantidad */}
          <div className="space-y-6 pt-4">

            {/* Selector de talle */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-neutral-500 tracking-wider uppercase block">Talles Disponibles</span>
              <div className="flex gap-2.5">
                {product.sizes.map((size) => {
                  const sizeStock = getStockForSize(product, size);

                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => selectSize(size)}
                      disabled={sizeStock === 0}
                      aria-pressed={selectedSize === size}
                      title={sizeStock === 0 ? `Talle ${size} sin stock` : `${sizeStock} disponibles`}
                      className={`w-10 h-10 flex items-center justify-center text-xs font-bold rounded-lg border transition-all ${sizeStock === 0
                          ? 'bg-neutral-100 border-neutral-200 text-neutral-300 cursor-not-allowed line-through'
                          : selectedSize === size
                            ? 'bg-primary border-primary text-white shadow-sm'
                            : 'bg-cream border-neutral-200 text-antracita hover:border-neutral-350 cursor-pointer'
                        }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-neutral-500 font-semibold">
                {currentSizeStock > 0
                  ? `${currentSizeStock} unidades disponibles en talle ${selectedSize}`
                  : 'No hay stock disponible en este talle'}
              </p>
            </div>



            {/* Selector de cantidad y botón de compra — solo para usuarios normales, no para el admin */}
            {canUseShoppingFeatures ? (
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {/* Control de cantidad: − número + */}
                <div className="flex items-center space-x-3 bg-cream border border-neutral-200 px-3.5 py-2 rounded-lg self-start shadow-inner">
                  <button
                    type="button"
                    onClick={() => changeQuantity((q) => Math.max(1, q - 1))}
                    className="text-neutral-500 hover:text-antracita text-lg font-bold w-6 text-center cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-antracita text-sm font-bold w-6 text-center">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => changeQuantity((q) => Math.min(currentSizeStock, q + 1))}
                    disabled={quantity >= currentSizeStock}
                    className={`text-neutral-500 hover:text-antracita text-lg font-bold w-6 text-center cursor-pointer ${quantity >= currentSizeStock ? 'opacity-50' : ''
                      }`}
                  >
                    +
                  </button>
                </div>

                {/* Botón principal de agregar al carrito */}
                <div className="flex-grow">
                  <button
                    onClick={handleAddToCart}
                    disabled={currentSizeStock === 0 || addingToCart}
                    className={`w-full text-center font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-lg shadow-md transition-all duration-200 cursor-pointer ${currentSizeStock === 0
                        ? 'bg-neutral-100 border border-neutral-200 text-neutral-400 cursor-not-allowed shadow-none'
                        : 'bg-primary hover:bg-primary/95 text-white shadow-primary/10 hover:shadow-primary/20'
                      }`}
                  >
                    {currentSizeStock === 0
                      ? 'Sin Stock en este Talle'
                      : addingToCart
                        ? <LoadingIndicator label="Agregando..." compact />
                        : 'Agregar al Carrito'}
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
