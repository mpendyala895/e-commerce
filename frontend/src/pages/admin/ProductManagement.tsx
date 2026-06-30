import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  X, 
  AlertCircle,
  Eye,
  SlidersHorizontal,
  FolderPlus
} from 'lucide-react';
import { getProducts } from '../../services/productApi';
import { adminAddProduct, adminUpdateProduct, adminDeleteProduct, adminGetInventory } from '../../services/adminApi';
import api from '../../services/api';
import { Product, InventoryItem } from '../../types';

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [skuCode, setSkuCode] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('');
  const [initialStock, setInitialStock] = useState(0);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodData, invData] = await Promise.all([
        getProducts(),
        adminGetInventory()
      ]);
      setProducts(prodData);
      setInventory(invData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setCurrentProduct(null);
    setName('');
    setDescription('');
    setPrice(0);
    setSkuCode('');
    setImageUrl('');
    setCategory('');
    setInitialStock(0);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setCurrentProduct(product);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price);
    setSkuCode(product.skuCode || '');
    setImageUrl(product.imageUrl || '');
    setCategory(product.category || '');
    // Fetch current stock from inventory list
    const inv = inventory.find(i => i.skuCode === product.skuCode);
    setInitialStock(inv ? inv.quantity : 0);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Product name is required';
    if (!description.trim()) errors.description = 'Description is required';
    if (price <= 0) errors.price = 'Price must be greater than 0';
    if (!skuCode.trim()) errors.skuCode = 'SKU code is required';
    if (!imageUrl.trim()) errors.imageUrl = 'Image URL is required';
    if (!category.trim()) errors.category = 'Category is required';
    if (!currentProduct && initialStock < 0) errors.initialStock = 'Initial stock cannot be negative';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (currentProduct) {
        // Edit flow
        const updated = await adminUpdateProduct(currentProduct.id, {
          name,
          description,
          price,
          skuCode,
          imageUrl,
          category
        });
        
        // Optionally update stock if quantity changed
        const currentInv = inventory.find(i => i.skuCode === currentProduct.skuCode);
        if (currentInv && currentInv.quantity !== initialStock) {
          await api.put(`/api/inventory/admin/update?skuCode=${skuCode}&quantity=${initialStock}`);
        }

        setProducts(products.map(p => p.id === currentProduct.id ? updated : p));
      } else {
        // Add flow
        const newProduct = await adminAddProduct({
          name,
          description,
          price,
          skuCode,
          imageUrl,
          category
        });

        // Initialize stock via Kafka event (triggers inventory-service listener)
        await api.post('/api/product/inventory-event', {
          skuCode,
          quantity: initialStock
        });

        setProducts([...products, newProduct]);
      }
      
      setIsModalOpen(false);
      loadData(); // Reload stats and inventory lists
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error saving product');
    }
  };

  const handleDeleteClick = (product: Product) => {
    setCurrentProduct(product);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!currentProduct) return;
    try {
      await adminDeleteProduct(currentProduct.id);
      // Also delete inventory
      if (currentProduct.skuCode) {
        try {
          await api.delete(`/api/inventory/admin/${currentProduct.skuCode}`);
        } catch {
          // Ignore if inventory item doesn't exist
        }
      }
      setProducts(products.filter(p => p.id !== currentProduct.id));
      setIsDeleteOpen(false);
      setCurrentProduct(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error deleting product');
    }
  };

  // Get distinct categories
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  // Filtered & Sorted products
  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        (p.skuCode && p.skuCode.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = categoryFilter ? p.category === categoryFilter : true;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      return 0;
    });

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Product Catalog</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage products, SKUs, inventory, and categories</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold py-2.5 px-4 rounded-xl flex items-center space-x-2 shadow-md hover:shadow-lg transition-all cursor-pointer text-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 text-sm font-semibold p-4 rounded-xl flex items-center space-x-2 border border-rose-100">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs flex flex-wrap gap-4 items-center">
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder="Search name, description, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 pl-10 pr-4 py-2 rounded-xl text-sm border border-slate-200 focus:outline-none focus:border-indigo-500"
          />
          <Search className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-slate-400" />
        </div>

        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 rounded-xl py-2 px-3 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 rounded-xl py-2 px-3 focus:outline-none"
          >
            <option value="">Sort By</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-500">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Product Details</th>
                <th className="px-6 py-4">SKU / Code</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock Level</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredProducts.length > 0 ? filteredProducts.map((product) => {
                const stockItem = inventory.find(i => i.skuCode === product.skuCode);
                const stockQty = stockItem ? stockItem.quantity : 0;
                return (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="w-12 h-12 object-cover rounded-lg bg-slate-50 border border-slate-100 shrink-0" 
                        />
                        <div className="min-w-0">
                          <span className="block font-bold text-slate-800 truncate">{product.name}</span>
                          <span className="block text-xs text-slate-400 font-semibold truncate max-w-xs">{product.description}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono font-bold text-slate-500">
                      {product.skuCode || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-lg border border-slate-200">
                        {product.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-slate-900">
                      ₹{product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold border ${
                        stockQty < 10 
                          ? 'bg-rose-50 text-rose-700 border-rose-100' 
                          : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      }`}>
                        {stockQty} units
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button 
                          onClick={() => handleOpenEdit(product)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-4.5 h-4.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(product)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-semibold text-xs">
                    No products matching search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl max-w-lg w-full z-10 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-black text-slate-800 tracking-tight">
                {currentProduct ? 'Edit Product Details' : 'Add New Product'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-grow text-left">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Product Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Wireless Headset"
                  className={`w-full px-3 py-2 border rounded-xl text-sm ${formErrors.name ? 'border-rose-300' : 'border-slate-200'}`}
                />
                {formErrors.name && <p className="text-rose-500 text-xs mt-1 font-semibold">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the product details..."
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-xl text-sm ${formErrors.description ? 'border-rose-300' : 'border-slate-200'}`}
                />
                {formErrors.description && <p className="text-rose-500 text-xs mt-1 font-semibold">{formErrors.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-xl text-sm ${formErrors.price ? 'border-rose-300' : 'border-slate-200'}`}
                  />
                  {formErrors.price && <p className="text-rose-500 text-xs mt-1 font-semibold">{formErrors.price}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">SKU Code</label>
                  <input
                    type="text"
                    value={skuCode}
                    onChange={(e) => setSkuCode(e.target.value)}
                    placeholder="e.g. WH-1000"
                    disabled={!!currentProduct}
                    className={`w-full px-3 py-2 border rounded-xl text-sm ${formErrors.skuCode ? 'border-rose-300' : 'border-slate-200'} ${currentProduct ? 'bg-slate-50 text-slate-400' : ''}`}
                  />
                  {formErrors.skuCode && <p className="text-rose-500 text-xs mt-1 font-semibold">{formErrors.skuCode}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Tech, Fashion"
                    className={`w-full px-3 py-2 border rounded-xl text-sm ${formErrors.category ? 'border-rose-300' : 'border-slate-200'}`}
                  />
                  {formErrors.category && <p className="text-rose-500 text-xs mt-1 font-semibold">{formErrors.category}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    {currentProduct ? 'Edit Stock Quantity' : 'Initial Stock Quantity'}
                  </label>
                  <input
                    type="number"
                    value={initialStock}
                    onChange={(e) => setInitialStock(Number(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-xl text-sm ${formErrors.initialStock ? 'border-rose-300' : 'border-slate-200'}`}
                  />
                  {formErrors.initialStock && <p className="text-rose-500 text-xs mt-1 font-semibold">{formErrors.initialStock}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Image URL</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className={`w-full px-3 py-2 border rounded-xl text-sm ${formErrors.imageUrl ? 'border-rose-300' : 'border-slate-200'}`}
                />
                {formErrors.imageUrl && <p className="text-rose-500 text-xs mt-1 font-semibold">{formErrors.imageUrl}</p>}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md cursor-pointer"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsDeleteOpen(false)} />
          
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl max-w-sm w-full z-10 p-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">Delete Product</h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                Are you sure you want to delete <strong className="text-slate-800">"{currentProduct?.name}"</strong>? This will also remove its SKU stock mapping. This action is irreversible.
              </p>
            </div>
            <div className="pt-2 flex justify-center space-x-3">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-md cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
