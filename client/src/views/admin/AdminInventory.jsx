// Vista del inventario de productos (panel admin)
// Muestra todos los productos en una tabla con su imagen, nombre, categoría, stock por talle y precio.
// Desde acá el admin puede editar o eliminar cualquier producto, y agregar uno nuevo.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '../../components/ui/useNotification';
import { useScrollOnMessage } from '../../components/ui/useScrollOnMessage';

function AdminInventory({ products = [], deleteProduct }) {
  const { showConfirm, showNotification } = useNotification();
  const [deleteError, setDeleteError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  useScrollOnMessage(deleteError);

  // Pide confirmación antes de eliminar un producto (por seguridad)
  const handleDelete = async (id, name) => {
    const confirmed = await showConfirm({
      title: 'Eliminar producto',
      message: `¿Estás seguro de que deseas eliminar la camiseta "${name}" del catálogo?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    });

    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    setDeleteError('');
    const result = await deleteProduct(id);
    setDeletingId(null);

    if (!result.success) {
      const message = result.message || 'No se pudo eliminar el producto.';
      setDeleteError(message);
      showNotification({ type: 'error', message });
      return;
    }

    showNotification({
      type: 'success',
      message: `"${name}" se eliminó correctamente del catálogo.`
    });
  };

  // Calcula una distribución aproximada del stock por talle a partir del stock total
  // Es una estimación visual porque el sistema maneja stock único (no por talle individual)
  const getStockBreakdown = (stock) => {
    if (typeof stock === 'object' && stock !== null) {
      return {
        S: parseInt(stock.S, 10) || 0,
        M: parseInt(stock.M, 10) || 0,
        L: parseInt(stock.L, 10) || 0,
        XL: parseInt(stock.XL, 10) || 0
      };
    }
    if (typeof stock === 'number') {
      if (stock <= 0) return { S: 0, M: 0, L: 0, XL: 0 };
      const base = Math.floor(stock / 4);  // reparto equitativo entre 4 talles
      return {
        S: base + (stock % 4 >= 1 ? 1 : 0),   // los sobrantes van al S
        M: base + (stock % 4 >= 2 ? 1 : 0),   // segundo sobrante al M
        L: base + (stock % 4 >= 3 ? 1 : 0),   // tercer sobrante al L
        XL: base                                // XL solo el base
      };
    }
    return { S: 0, M: 0, L: 0, XL: 0 };
  };

  // Renderiza la cantidad del talle con colores según el nivel de stock
  const renderStockBadge = (qty) => {
    if (qty === 0) {
      return <span className="text-red-500 font-bold">00</span>;         // rojo: sin stock
    }
    if (qty <= 3) {
      return <span className="text-amber-500 font-bold">{qty.toString().padStart(2, '0')}</span>;  // naranja: pocas unidades
    }
    return <span className="text-neutral-500 font-semibold">{qty.toString().padStart(2, '0')}</span>;  // gris: stock normal
  };

  // Si la imagen del producto falla, muestro la imagen de fallback
  const handleImageError = (e, product) => {
    e.target.src = product.fallbackImage || "/assets/success.svg";
  };

  return (
    <div className="space-y-6 text-antracita">

      {/* Encabezado con el título y el botón para agregar un nuevo producto */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-antracita font-title">Inventario de Productos</h1>
          <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mt-1">Administra el stock y detalles de las camisetas de fútbol en tienda.</p>
        </div>
        {/* Botón para crear un nuevo artículo — lleva al formulario de creación */}
        <Link
          to="/admin/products/new"
          className="bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg shadow-md transition-colors cursor-pointer"
        >
          + Nuevo Artículo
        </Link>
      </header>

      {deleteError && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-xs font-bold">
          {deleteError}
        </div>
      )}

      {/* Si no hay productos, muestro un estado vacío */}
      {products.length === 0 ? (
        <div className="text-center py-16 bg-white border border-neutral-200 rounded-xl shadow-sm">
          <p className="text-sm text-neutral-500">No hay productos cargados en el inventario.</p>
        </div>
      ) : (
        /* Tabla de inventario */
        <section className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-450 font-bold uppercase tracking-wider">
                  <th className="p-4 w-16">Imagen</th>
                  <th className="p-4">Producto</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4">Stock (S/M/L/XL)</th>
                  <th className="p-4">Precio</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/60">
                {products.map((product) => {
                  // Calculo el breakdown de stock por talle para mostrarlo en la tabla
                  const sizesStock = getStockBreakdown(product.stock);
                  return (
                    <tr key={product.id} className="hover:bg-neutral-50/50 text-neutral-600 transition-colors">
                      {/* Miniatura del producto */}
                      <td className="p-4">
                        <img
                          src={product.image}
                          alt={`Miniatura de ${product.name}`}
                          className="w-10 h-12 object-cover rounded bg-neutral-100 border border-neutral-200"
                          onError={(e) => handleImageError(e, product)}
                        />
                      </td>
                      {/* Nombre y código de referencia */}
                      <td className="p-4">
                        <p className="font-bold text-antracita font-title text-sm">{product.name}</p>
                        <p className="text-[10px] text-neutral-450 mt-0.5 uppercase tracking-wide">Ref ID: MS-{product.id}</p>
                      </td>
                      <td className="p-4 font-semibold">{product.category}</td>
                      {/* Stock estimado por talle con colores */}
                      <td className="p-4 font-mono">
                        <div className="flex space-x-3 text-[11px]">
                          <span>S {renderStockBadge(sizesStock.S)}</span>
                          <span>M {renderStockBadge(sizesStock.M)}</span>
                          <span>L {renderStockBadge(sizesStock.L)}</span>
                          <span>XL {renderStockBadge(sizesStock.XL)}</span>
                        </div>
                      </td>
                      <td className="p-4 font-extrabold text-antracita">${product.price.toFixed(2)}</td>
                      {/* Acciones: editar o eliminar */}
                      <td className="p-4 text-right space-x-2">
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="bg-white border border-neutral-300 text-antracita hover:border-neutral-400 font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer inline-block uppercase text-[10px] tracking-wider"
                          aria-label={`Editar ${product.name}`}
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          disabled={deletingId === product.id}
                          className="bg-red-50 hover:bg-red-550 hover:text-white text-red-500 border border-red-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-block uppercase text-[10px] tracking-wider"
                          aria-label={`Eliminar ${product.name}`}
                        >
                          {deletingId === product.id ? 'Eliminando...' : 'Eliminar'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

export default AdminInventory;
