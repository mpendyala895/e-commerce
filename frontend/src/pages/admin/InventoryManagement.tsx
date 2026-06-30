import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  AlertCircle,
  Package,
  TrendingUp,
  TrendingDown,
  RefreshCw
} from 'lucide-react';
import { adminGetInventory, adminUpdateStock, adminRestock, adminDeleteInventory } from '../../services/adminApi';
import { InventoryItem } from '../../types';

const InventoryManagement: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search
  const [search, setSearch] = useState('');

  // Modals
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
  
  // Actions
  const [actionType, setActionType] = useState<'update' | 'restock' | 'create'>('update');
  const [skuCode, setSkuCode] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const loadInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminGetInventory();
      setInventory(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleOpenCreate = () => {
    setActionType('create');
    setSkuCode('');
    setQuantity(0);
    setCurrentItem(null);
    setFormErrors({});
    setIsUpdateOpen(true);
  };

  const handleOpenUpdate = (item: InventoryItem) => {
    setActionType('update');
    setSkuCode(item.skuCode);
    setQuantity(item.quantity);
    setCurrentItem(item);
    setFormErrors({});
    setIsUpdateOpen(true);
  };

  const handleOpenRestock = (item: InventoryItem) => {
    setActionType('restock');
    setSkuCode(item.skuCode);
    setQuantity(0); // input quantity to add
    setCurrentItem(item);
    setFormErrors({});
    setIsUpdateOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!skuCode.trim()) errors.skuCode = 'SKU Code is required';
    if (quantity < 0) errors.quantity = 'Quantity cannot be negative';
    if (actionType === 'restock' && quantity <= 0) errors.quantity = 'Restock amount must be greater than 0';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (actionType === 'create' || actionType === 'update') {
        await adminUpdateStock(skuCode, quantity);
      } else if (actionType === 'restock') {
        await adminRestock(skuCode, quantity);
      }

      setIsUpdateOpen(false);
      loadInventory();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error updating stock');
    }
  };

  const handleDeleteClick = (item: InventoryItem) => {
    setCurrentItem(item);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!currentItem) return;
    try {
      await adminDeleteInventory(currentItem.skuCode);
      setInventory(inventory.filter(i => i.skuCode !== currentItem.skuCode));
      setIsDeleteOpen(false);
      setCurrentItem(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error deleting inventory mapping');
    }
  };

  const filteredInventory = inventory.filter(item => 
    item.skuCode.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && inventory.length === 0) {
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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Stock Inventory</h1>
          <p className="text-slate-500 text-sm mt-0.5">Configure stock reserves, restock catalog units, view warnings</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={loadInventory}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold p-2.5 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs"
            title="Refresh Stock List"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button 
            onClick={handleOpenCreate}
            className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold py-2.5 px-4 rounded-xl flex items-center space-x-2 shadow-md hover:shadow-lg transition-all cursor-pointer text-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Map SKU Stock</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 text-sm font-semibold p-4 rounded-xl flex items-center space-x-2 border border-rose-100">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Summary widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Stock Items</span>
            <span className="text-xl font-black text-slate-800">{inventory.length} SKUs</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-500">
            <Package className="w-5 h-5" />
          </div>
        </div>
        
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Units Count</span>
            <span className="text-xl font-black text-slate-800">
              {inventory.reduce((sum, item) => sum + item.quantity, 0)} units
            </span>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex items-center justify-between border-rose-100 bg-rose-50/20">
          <div>
            <span className="block text-xs font-bold text-rose-500 uppercase tracking-wider mb-1">Low Stock Warning</span>
            <span className="text-xl font-black text-rose-700">
              {inventory.filter(item => item.quantity < 10).length} SKUs
            </span>
          </div>
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs flex flex-wrap gap-4 items-center">
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder="Search SKU Code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 pl-10 pr-4 py-2 rounded-xl text-sm border border-slate-200 focus:outline-none focus:border-indigo-500"
          />
          <Search className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-slate-400" />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-500">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">SKU Code</th>
                <th className="px-6 py-4">Quantity Available</th>
                <th className="px-6 py-4">Availability Status</th>
                <th className="px-6 py-4 text-right">Fulfillment Adjustments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredInventory.length > 0 ? filteredInventory.map((item) => (
                <tr key={item.skuCode} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-slate-900 text-sm">
                    {item.skuCode}
                  </td>
                  <td className="px-6 py-4 text-base font-extrabold text-slate-800">
                    {item.quantity} units
                  </td>
                  <td className="px-6 py-4">
                    {item.quantity <= 0 ? (
                      <span className="bg-rose-50 text-rose-700 text-xs font-bold px-2.5 py-0.5 rounded-lg border border-rose-100">
                        Out of Stock
                      </span>
                    ) : item.quantity < 10 ? (
                      <span className="bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-0.5 rounded-lg border border-amber-100 animate-pulse">
                        Low Stock Alert
                      </span>
                    ) : (
                      <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-lg border border-emerald-100">
                        Available
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button 
                        onClick={() => handleOpenRestock(item)}
                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center space-x-1"
                        title="Restock Item"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Restock</span>
                      </button>
                      <button 
                        onClick={() => handleOpenUpdate(item)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                        title="Set Stock Directly"
                      >
                        <Edit className="w-4.5 h-4.5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(item)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete SKU Mapping"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-400 font-semibold text-xs">
                    No SKU items found in database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit / Restock Modal */}
      {isUpdateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsUpdateOpen(false)} />
          
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl max-w-sm w-full z-10 p-6 flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-lg font-black text-slate-800 tracking-tight">
                {actionType === 'create' ? 'Map SKU Stock' :
                 actionType === 'restock' ? 'Restock SKU Units' : 'Set Stock Quantity'}
              </h3>
              <button onClick={() => setIsUpdateOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">SKU Code</label>
                <input
                  type="text"
                  value={skuCode}
                  onChange={(e) => setSkuCode(e.target.value)}
                  placeholder="e.g. WH-1000"
                  disabled={actionType !== 'create'}
                  className={`w-full px-3 py-2 border rounded-xl text-sm ${formErrors.skuCode ? 'border-rose-300' : 'border-slate-200'} ${actionType !== 'create' ? 'bg-slate-50 text-slate-400' : ''}`}
                />
                {formErrors.skuCode && <p className="text-rose-500 text-xs mt-1 font-semibold">{formErrors.skuCode}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  {actionType === 'restock' ? 'Quantity to Add' : 'Target Quantity'}
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  placeholder="e.g. 50"
                  className={`w-full px-3 py-2 border rounded-xl text-sm ${formErrors.quantity ? 'border-rose-300' : 'border-slate-200'}`}
                />
                {formErrors.quantity && <p className="text-rose-500 text-xs mt-1 font-semibold">{formErrors.quantity}</p>}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsUpdateOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md cursor-pointer"
                >
                  {actionType === 'restock' ? 'Add Stock' : 'Save Stock'}
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
              <h3 className="text-lg font-black text-slate-800">Delete SKU Stock Mapping</h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                Are you sure you want to delete SKU stock record <strong className="text-slate-800">"{currentItem?.skuCode}"</strong>? This will decouple stock tracking from the catalog. This action is irreversible.
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
                Delete SKU Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
