// Vista de creación/edición de productos (panel admin)
// Se usa tanto para agregar un producto nuevo como para editar uno existente.
// Si hay un :id en la URL, estamos en modo edición; si no, en modo creación.
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Input, Select, Button } from '../../components/ui/Form';

function AdminProductEdit({ products = [], addProduct, updateProduct }) {
  const { id } = useParams();         // si hay id en la URL, es modo edición
  const navigate = useNavigate();
  const isEditMode = !!id;            // true si estamos editando, false si creando

  // Busco el producto a editar por su ID (solo aplica en modo edición)
  const productToEdit = products.find((p) => p.id === parseInt(id, 10));

  // Listas de opciones disponibles para talles y categorías
  const availableSizes = ["S", "M", "L", "XL", "XXL"];
  const categoryOptions = [
    { value: 'Titulares', label: 'Camisetas Titulares' },
    { value: 'Suplentes', label: 'Camisetas Suplentes' }
  ];

  // Estado del formulario — campos vacíos por defecto para el modo creación
  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',      // Selección o Equipo
    price: '',
    description: '',
    category: 'Titulares',
    image: '',
    stock: {           // Stock por talle inicializado vacío
      S: '',
      M: '',
      L: '',
      XL: '',
      XXL: ''
    },
    featured: false
  });

  // Mensaje de error de validación del formulario
  const [error, setError] = useState('');

  // Auxiliar para convertir stock heredado (número) a stock por talle
  const getStockBreakdown = (stock) => {
    if (typeof stock === 'number') {
      const base = Math.floor(stock / 5);
      return {
        S: base + (stock % 5 >= 1 ? 1 : 0),
        M: base + (stock % 5 >= 2 ? 1 : 0),
        L: base + (stock % 5 >= 3 ? 1 : 0),
        XL: base + (stock % 5 >= 4 ? 1 : 0),
        XXL: base
      };
    }
    return stock || {};
  };

  // Obtiene la lista única de selecciones/equipos cargados para el datalist
  const loadedSubtitles = [...new Set(products.map(p => p.subtitle).filter(Boolean))];

  // Si estamos en modo edición y el producto existe, cargo sus datos en el formulario
  useEffect(() => {
    if (isEditMode && productToEdit) {
      const stockObj = typeof productToEdit.stock === 'object' && productToEdit.stock !== null
        ? productToEdit.stock
        : getStockBreakdown(productToEdit.stock);

      setFormData({
        name: productToEdit.name,
        subtitle: productToEdit.subtitle || '',
        price: productToEdit.price.toString(),
        description: productToEdit.description,
        category: productToEdit.category,
        image: productToEdit.image,
        stock: {
          S: stockObj.S !== undefined ? stockObj.S.toString() : '',
          M: stockObj.M !== undefined ? stockObj.M.toString() : '',
          L: stockObj.L !== undefined ? stockObj.L.toString() : '',
          XL: stockObj.XL !== undefined ? stockObj.XL.toString() : '',
          XXL: stockObj.XXL !== undefined ? stockObj.XXL.toString() : '',
        },
        featured: productToEdit.featured || false
      });
    }
  }, [id, productToEdit, isEditMode]);

  // Handler para inputs y checkboxes simples (boolean)
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };



  // Handler para cambiar el stock de un talle individual
  const handleStockSizeChange = (size, value) => {
    setFormData((prev) => ({
      ...prev,
      stock: {
        ...prev.stock,
        [size]: value === '' ? '' : Math.max(0, parseInt(value, 10) || 0)
      }
    }));
  };

  // Valida y envía el formulario para crear o actualizar el producto
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Todos los campos básicos son obligatorios
    if (!formData.name || !formData.price || !formData.description || !formData.subtitle) {
      setError('Por favor, completa todos los campos del producto.');
      return;
    }

    // Proceso las tallas y el stock ingresados
    const stockPayload = {};
    const sizesPayload = [];
    availableSizes.forEach((size) => {
      const val = formData.stock[size];
      if (val !== undefined && val !== '') {
        const qty = parseInt(val, 10) || 0;
        stockPayload[size] = qty;
        sizesPayload.push(size);
      }
    });

    // Al menos un talle debe tener stock configurado
    if (sizesPayload.length === 0) {
      setError('Debes configurar la cantidad de stock para al menos un talle.');
      return;
    }



    // Preparo el payload final
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      sizes: sizesPayload,
      stock: stockPayload,
      image: formData.image || '/assets/success.svg'  // imagen por defecto si no se cargó
    };

    if (isEditMode) {
      // En modo edición: combino los datos del producto original con los nuevos
      updateProduct({
        ...productToEdit,
        ...payload
      });
      alert('¡Producto actualizado con éxito!');
    } else {
      // En modo creación: agrego el producto nuevo
      addProduct(payload);
      alert('¡Producto agregado al catálogo con éxito!');
    }

    // Vuelvo al inventario en ambos casos
    navigate('/admin/inventory');
  };

  return (
    <div className="space-y-6 text-antracita">

      {/* Encabezado con título dinámico según el modo (crear o editar) */}
      <header className="border-b border-neutral-200 pb-5 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-antracita font-title">
            {isEditMode ? `Editar Artículo: ${productToEdit?.name}` : 'Agregar Artículo Nuevo'}
          </h1>
          <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mt-1">
            {isEditMode ? 'Actualiza la información básica y el stock del producto.' : 'Introduce los detalles para la nueva prenda.'}
          </p>
        </div>
        {/* Link para volver al inventario sin guardar */}
        <Link
          to="/admin/inventory"
          className="text-xs text-primary hover:underline font-bold uppercase tracking-wider"
        >
          &larr; Volver al Inventario
        </Link>
      </header>

      {/* Mensaje de error de validación */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-500 p-4 rounded-lg text-xs font-bold shadow-sm">
          {error}
        </div>
      )}

      {/* Formulario de producto */}
      <section className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Campos básicos: nombre, categoría, precio y Selección/Equipo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Nombre del Producto"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ej: Argentina 1986 Titular"
              required
            />
            <Select
              label="Categoría"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              options={categoryOptions}
              required
            />
            <Input
              label="Precio (USD)"
              type="number"
              step="0.01"
              min="1"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="Ej: 89.99"
              required
            />
            <div className="relative w-full">
              <Input
                label="Selección o Equipo"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
                placeholder="Ej: AFA — HOME KIT o Boca Juniors"
                required
                list="loaded-subtitles"
              />
              <datalist id="loaded-subtitles">
                {loadedSubtitles.map((sub) => (
                  <option key={sub} value={sub} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Descripción completa del producto */}
          <div className="flex flex-col space-y-1.5 w-full">
            <label htmlFor="description" className="text-[10px] font-bold text-neutral-500 tracking-wider uppercase">
              Descripción del Producto <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Ej: Camiseta utilizada por Diego Maradona durante la Copa del Mundo de México 1986..."
              required
              rows={4}
              className="w-full bg-white border border-neutral-300 text-antracita text-xs rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary transition-all shadow-sm"
            />
          </div>

          {/* Sección de Cantidades por Talle */}
          <div className="space-y-3 pb-2 border-b border-neutral-100">
            <span className="text-[10px] font-bold text-neutral-500 tracking-wider uppercase block">Cantidades por Talle</span>
            <div className="flex flex-row flex-wrap gap-4 items-center">
              {availableSizes.map((size) => (
                <div key={size} className="flex flex-col items-center space-y-1.5 w-20 text-center">
                  <span className="text-xs font-semibold text-neutral-600 uppercase">{size}</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="—"
                    value={formData.stock[size]}
                    onChange={(e) => handleStockSizeChange(size, e.target.value)}
                    className="w-full bg-neutral-50/70 border border-neutral-250 text-antracita text-center text-xs rounded-lg px-2 py-2 focus:outline-none focus:border-primary focus:bg-white transition-all font-semibold shadow-sm"
                  />
                </div>
              ))}
            </div>
          </div>



          {/* Campo para la ruta de imagen del producto (manual en este proyecto) */}
          <div className="grid grid-cols-1 gap-5">
            <Input
              label="Ruta de Imagen (/assets/...)"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
              placeholder="Ej: /assets/success.svg"
            />
          </div>

          <hr className="border-neutral-100" />

          {/* Botones de acción: cancelar y guardar */}
          <div className="flex space-x-4">
            <div className="w-1/3">
              <Link to="/admin/inventory">
                <Button variant="secondary">Cancelar</Button>
              </Link>
            </div>
            <div className="w-2/3">
              <Button type="submit" variant="primary">
                Guardar Cambios
              </Button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}

export default AdminProductEdit;
