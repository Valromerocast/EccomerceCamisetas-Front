import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Input, Select, Button } from '../../components/ui/Form';
import { fetchCatalogOptions } from '../../services/api';

function findOptionId(options, name) {
  return String(options.find((option) => option.nombre === name)?.id || '');
}

function buildInitialForm(product, options) {
  const stock = {};

  for (const size of options.sizes) {
    const variant = product?.variants?.find((item) => item.talle === size.nombre);
    stock[size.nombre] = variant ? String(variant.stock) : '';
  }

  return {
    name: product?.name || '',
    price: product ? String(product.price) : '',
    description: product?.description || '',
    image: product?.image || '',
    countryId: product ? findOptionId(options.countries, product.country) : String(options.countries[0]?.id || ''),
    typeId: product ? findOptionId(options.types, product.kit) : String(options.types[0]?.id || ''),
    genderId: product ? findOptionId(options.genders, product.gender) : String(options.genders[0]?.id || ''),
    color: product?.variants?.[0]?.color || 'Único',
    stock
  };
}

function ProductForm({ product, options, addProduct, updateProduct }) {
  const navigate = useNavigate();
  const isEditMode = Boolean(product);
  const [formData, setFormData] = useState(() => buildInitialForm(product, options));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleStockChange = (size, value) => {
    setFormData((current) => ({
      ...current,
      stock: {
        ...current.stock,
        [size]: value === '' ? '' : String(Math.max(0, Number.parseInt(value, 10) || 0))
      }
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const name = formData.name.trim();
    const description = formData.description.trim();
    const image = formData.image.trim();
    const price = Number.parseFloat(formData.price);

    if (!name || !description || !image || !formData.countryId || !formData.typeId || !formData.genderId) {
      setError('Completa todos los datos básicos del producto.');
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError('El precio debe ser mayor a cero.');
      return;
    }

    if (!/^https?:\/\//i.test(image)) {
      setError('La imagen debe ser una URL pública que comience con http:// o https://.');
      return;
    }

    if (/instagram\.com\/p\//i.test(image)) {
      setError('Instagram entrega una página, no una imagen directa. Usa una URL que abra únicamente el archivo de imagen.');
      return;
    }

    const selectedSizes = options.sizes.filter((size) => formData.stock[size.nombre] !== '');
    if (selectedSizes.length === 0) {
      setError('Configura el stock de al menos un talle. Puedes usar 0.');
      return;
    }

    const productPayload = {
      nombre: name,
      descripcion: description,
      precio: price,
      imagen: image,
      paisId: Number(formData.countryId),
      tipoCamisetaId: Number(formData.typeId),
      generoId: Number(formData.genderId)
    };

    const normalizedName = name.toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '');
    const variants = selectedSizes.map((size) => {
      const existing = product?.variants?.find((variant) => variant.talle === size.nombre);

      return {
        sizeName: size.nombre,
        talleId: Number(size.id),
        stock: Number.parseInt(formData.stock[size.nombre], 10) || 0,
        sku: existing?.sku || `${normalizedName || 'CAMISETA'}-${size.nombre}-${product?.id || 'NUEVA'}`,
        color: formData.color.trim() || existing?.color || 'Único'
      };
    });

    setSaving(true);
    const result = isEditMode
      ? await updateProduct(product.id, { product: productPayload, variants })
      : await addProduct({ product: productPayload, variants });
    setSaving(false);

    if (!result.success) {
      setError(result.message || 'No se pudo guardar el producto.');
      return;
    }

    navigate('/admin/inventory');
  };

  const selectOptions = (items) => items.map((item) => ({
    value: String(item.id),
    label: item.nombre
  }));

  return (
    <div className="space-y-6 text-antracita">
      <header className="border-b border-neutral-200 pb-5 flex justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-antracita font-title">
            {isEditMode ? `Editar Artículo: ${product.name}` : 'Agregar Artículo Nuevo'}
          </h1>
          <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mt-1">
            Producto, clasificación y variantes persistidos en el backend.
          </p>
        </div>
        <Link to="/admin/inventory" className="text-xs text-primary hover:underline font-bold uppercase tracking-wider">
          ← Volver
        </Link>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-xs font-bold">
          {error}
        </div>
      )}

      <section className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input label="Nombre" name="name" value={formData.name} onChange={handleInputChange} required />
            <Input label="Precio (USD)" type="number" step="0.01" min="0.01" name="price" value={formData.price} onChange={handleInputChange} required />
            <Select label="País / Selección" name="countryId" value={formData.countryId} onChange={handleInputChange} options={selectOptions(options.countries)} required />
            <Select label="Tipo de camiseta" name="typeId" value={formData.typeId} onChange={handleInputChange} options={selectOptions(options.types)} required />
            <Select label="Género" name="genderId" value={formData.genderId} onChange={handleInputChange} options={selectOptions(options.genders)} required />
            <Input label="Color de variantes nuevas" name="color" value={formData.color} onChange={handleInputChange} required />
          </div>

          <div className="flex flex-col space-y-1.5">
            <label htmlFor="description" className="text-[10px] font-bold text-neutral-500 tracking-wider uppercase">
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              required
              className="w-full bg-white border border-neutral-300 text-antracita text-xs rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary shadow-sm"
            />
          </div>

          <Input
            label="URL pública de imagen"
            name="image"
            value={formData.image}
            onChange={handleInputChange}
            placeholder="https://..."
            required
          />

          <div className="space-y-3 border-t border-neutral-100 pt-5">
            <div>
              <span className="text-[10px] font-bold text-neutral-500 tracking-wider uppercase">Stock por talle</span>
              <p className="text-[10px] text-neutral-400 mt-1">Deja vacío un talle para no publicarlo; usa 0 para publicarlo sin stock.</p>
            </div>
            <div className="flex flex-wrap gap-4">
              {options.sizes.map((size) => (
                <label key={size.id} className="flex flex-col items-center gap-1.5 w-20 text-xs font-semibold">
                  {size.nombre}
                  <input
                    type="number"
                    min="0"
                    value={formData.stock[size.nombre] ?? ''}
                    onChange={(event) => handleStockChange(size.nombre, event.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-250 text-center rounded-lg px-2 py-2 focus:outline-none focus:border-primary"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-4 border-t border-neutral-100 pt-5">
            <Link to="/admin/inventory" className="w-1/3">
              <Button variant="secondary">Cancelar</Button>
            </Link>
            <div className="w-2/3">
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}

function AdminProductEdit({ products = [], addProduct, updateProduct }) {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const product = isEditMode ? products.find((item) => item.id === Number(id)) : null;
  const [options, setOptions] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;

    fetchCatalogOptions()
      .then((catalogOptions) => {
        if (active) setOptions(catalogOptions);
      })
      .catch((error) => {
        if (active) setLoadError(error.message || 'No se pudieron cargar los catálogos.');
      });

    return () => {
      active = false;
    };
  }, []);

  if (loadError) {
    return <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-sm">{loadError}</div>;
  }

  if (!options || (isEditMode && !product)) {
    return <p className="text-sm text-neutral-500">Cargando producto y catálogos...</p>;
  }

  return (
    <ProductForm
      key={product?.id || 'new'}
      product={product}
      options={options}
      addProduct={addProduct}
      updateProduct={updateProduct}
    />
  );
}

export default AdminProductEdit;
