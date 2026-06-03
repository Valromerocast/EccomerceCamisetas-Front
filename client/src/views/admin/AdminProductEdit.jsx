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

  // Listas de opciones disponibles para talles, colores y categorías
  const availableSizes = ["S", "M", "L", "XL", "XXL"];
  const availableColors = ["Celeste", "Blanco", "Azul", "Rojo", "Amarillo", "Verde", "Rosa", "Violeta", "Negro"];
  const categoryOptions = [
    { value: 'Titulares', label: 'Camisetas Titulares' },
    { value: 'Suplentes', label: 'Camisetas Suplentes' }
  ];

  // Estado del formulario — campos vacíos por defecto para el modo creación
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: 'Titulares',
    sizes: [],     // array de talles seleccionados (checkboxes)
    colors: [],    // array de colores seleccionados (checkboxes)
    image: '',
    stock: '',
    featured: false
  });

  // Mensaje de error de validación del formulario
  const [error, setError] = useState('');

  // Si estamos en modo edición y el producto existe, cargo sus datos en el formulario
  useEffect(() => {
    if (isEditMode && productToEdit) {
      setFormData({
        name: productToEdit.name,
        price: productToEdit.price.toString(),
        description: productToEdit.description,
        category: productToEdit.category,
        sizes: productToEdit.sizes || [],
        colors: productToEdit.colors || [],
        image: productToEdit.image,
        stock: productToEdit.stock.toString(),
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

  // Handler para los checkboxes de listas (talles y colores)
  // Si el valor ya está en la lista lo quita; si no, lo agrega
  const handleCheckboxListChange = (type, value) => {
    setFormData((prev) => {
      const currentList = prev[type];
      const newList = currentList.includes(value)
        ? currentList.filter((item) => item !== value)  // quitar
        : [...currentList, value];                       // agregar
      return { ...prev, [type]: newList };
    });
  };

  // Valida y envía el formulario para crear o actualizar el producto
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Todos los campos básicos son obligatorios
    if (!formData.name || !formData.price || !formData.description || !formData.stock) {
      setError('Por favor, completa todos los campos del producto.');
      return;
    }

    // Al menos un talle debe estar seleccionado
    if (formData.sizes.length === 0) {
      setError('Debes seleccionar al menos un talle disponible.');
      return;
    }

    // Al menos un color debe estar seleccionado
    if (formData.colors.length === 0) {
      setError('Debes seleccionar al menos un color disponible.');
      return;
    }

    // Preparo el payload con los tipos correctos (number en lugar de string)
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10),
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

          {/* Campos básicos: nombre, categoría, precio y stock */}
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
            <Input
              label="Stock de Unidades"
              type="number"
              min="0"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              placeholder="Ej: 50"
              required
            />
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

          {/* Checkboxes de talles disponibles */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-neutral-500 tracking-wider uppercase block">Cantidades por Talle</span>
            <div className="flex flex-wrap gap-4">
              {availableSizes.map((size) => {
                const isChecked = formData.sizes.includes(size);
                return (
                  <label key={size} className="flex items-center space-x-2 text-xs text-antracita font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleCheckboxListChange('sizes', size)}
                      className="rounded border-neutral-300 text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="font-bold">{size}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Checkboxes de colores disponibles */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-neutral-500 tracking-wider uppercase block">Colores Disponibles</span>
            <div className="flex flex-wrap gap-4">
              {availableColors.map((color) => {
                const isChecked = formData.colors.includes(color);
                return (
                  <label key={color} className="flex items-center space-x-2 text-xs text-antracita font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleCheckboxListChange('colors', color)}
                      className="rounded border-neutral-300 text-primary focus:ring-primary h-4 w-4"
                    />
                    <span>{color}</span>
                  </label>
                );
              })}
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
