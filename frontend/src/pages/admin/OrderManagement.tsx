import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Eye, 
  Trash2, 
  X, 
  AlertCircle,
  Calendar
} from 'lucide-react';
import { adminGetOrders, adminUpdateOrderStatus, adminDeleteOrder } from '../../services/adminApi';
import { getProductsBySkus } from '../../services/productApi';
import { Order } from '../../types';

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminGetOrders();
      const skus = Array.from(
        new Set(
          data.flatMap(order => (order.orderLineItemsList || []).map(item => item.skuCode))
        )
      ).filter(Boolean);

      if (skus.length > 0) {
        try {
          const products = await getProductsBySkus(skus);
          const productMap = new Map(products.map(p => [p.skuCode, p]));
          const enrichedOrders = data.map(order => ({
            ...order,
            orderLineItemsList: (order.orderLineItemsList || []).map(item => {
              const prod = productMap.get(item.skuCode);
              return {
                ...item,
                productName: prod ? prod.name : 'Product details unavailable',
                imageUrl: prod ? prod.imageUrl : '',
              };
            }),
          }));
          setOrders(enrichedOrders);
        } catch (prodErr: unknown) {
          console.error('Failed to load product details for admin orders:', prodErr);
          setOrders(data);
        }
      } else {
        setOrders(data);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (order: Order, newStatus: string) => {
    try {
      await adminUpdateOrderStatus(order.orderNumber, newStatus);
      setOrders(orders.map(o => o.id === order.id ? { ...o, orderStatus: newStatus } : o));
      if (currentOrder && currentOrder.id === order.id) {
        setCurrentOrder({ ...currentOrder, orderStatus: newStatus });
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error updating order status');
    }
  };

  const handleOpenDetails = (order: Order) => {
    setCurrentOrder(order);
    setIsDetailsOpen(true);
  };

  const handleDeleteClick = (order: Order) => {
    setCurrentOrder(order);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!currentOrder) return;
    try {
      await adminDeleteOrder(currentOrder.orderNumber);
      setOrders(orders.filter(o => o.id !== currentOrder.id));
      setIsDeleteOpen(false);
      setCurrentOrder(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error deleting order record');
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.userId.toString().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter ? order.orderStatus === statusFilter : true;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeStyle = (status: string) => {
    const base = "px-2.5 py-0.5 rounded-lg text-xs font-bold border uppercase tracking-wider ";
    switch ((status || '').toUpperCase()) {
      case 'PENDING':
        return base + "bg-amber-50 text-amber-700 border-amber-100";
      case 'CONFIRMED':
        return base + "bg-indigo-50 text-indigo-700 border-indigo-100";
      case 'DELIVERED':
        return base + "bg-emerald-50 text-emerald-700 border-emerald-100";
      case 'CANCELLED':
      case 'REJECTED':
        return base + "bg-rose-50 text-rose-700 border-rose-100";
      default:
        return base + "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Order Fulfilment</h1>
        <p className="text-slate-500 text-sm mt-0.5">Oversee customer transactions, view cart lists, update order progression statuses</p>
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
            placeholder="Search Order Number or Customer ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 pl-10 pr-4 py-2 rounded-xl text-sm border border-slate-200 focus:outline-none focus:border-indigo-500"
          />
          <Search className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-slate-400" />
        </div>

        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 rounded-xl py-2 px-3 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-500">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Order Code / Date</th>
                <th className="px-6 py-4">Customer ID</th>
                <th className="px-6 py-4">Items Count</th>
                <th className="px-6 py-4">Total Sum</th>
                <th className="px-6 py-4">Status & Action</th>
                <th className="px-6 py-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredOrders.length > 0 ? filteredOrders.map((order) => {
                const totalItems = order.orderLineItemsList ? order.orderLineItemsList.reduce((sum, item) => sum + item.quantity, 0) : 0;
                return (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <span className="block font-bold text-slate-800">#{order.orderNumber.substring(0, 8)}...</span>
                        <span className="block text-[11px] text-slate-400 font-semibold mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-bold">
                      User #{order.userId}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {totalItems} items
                    </td>
                    <td className="px-6 py-4 font-black text-indigo-600">
                      ₹{order.totalPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2.5">
                        <span className={getStatusBadgeStyle(order.orderStatus)}>
                          {order.orderStatus}
                        </span>
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleStatusChange(order, e.target.value)}
                          className="bg-transparent border border-slate-200 text-xs font-semibold text-slate-500 rounded-lg py-1 px-2 focus:outline-none"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirm</option>
                          <option value="DELIVERED">Deliver</option>
                          <option value="CANCELLED">Cancel</option>
                          <option value="REJECTED">Reject</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button 
                          onClick={() => handleOpenDetails(order)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4.5 h-4.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(order)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Order Record"
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
                    No orders matching search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {isDetailsOpen && currentOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsDetailsOpen(false)} />
          
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl max-w-lg w-full z-10 p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-800">Order Items Details</h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Order Number: {currentOrder.orderNumber}</p>
              </div>
              <button onClick={() => setIsDetailsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-wrap justify-between items-center gap-4 text-xs font-semibold text-slate-500">
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Placed By</span>
                  <span className="text-slate-700 font-bold text-sm">Customer #{currentOrder.userId}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Order Date</span>
                  <span className="text-slate-700 font-bold text-sm">{new Date(currentOrder.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Status</span>
                  <span className={getStatusBadgeStyle(currentOrder.orderStatus)}>{currentOrder.orderStatus}</span>
                </div>
              </div>

              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
                {currentOrder.orderLineItemsList ? currentOrder.orderLineItemsList.map((item, idx) => (
                  <div key={idx} className="py-3 flex justify-between items-center text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-10 h-10 object-cover rounded-lg border border-slate-100 bg-slate-50"
                        />
                      )}
                      <div>
                        <span className="block font-bold text-slate-800">{item.productName || 'Product Info'}</span>
                        <span className="text-xs text-slate-400 font-semibold">SKU: {item.skuCode} • Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-extrabold text-slate-700">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                )) : (
                  <div className="text-center py-4 text-slate-400 text-xs">No items in this order.</div>
                )}
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                <span className="text-sm font-extrabold text-slate-800">Total Purchase:</span>
                <span className="text-xl font-black text-indigo-600">₹{currentOrder.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md cursor-pointer"
              >
                Close View
              </button>
            </div>
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
              <h3 className="text-lg font-black text-slate-800">Delete Order Record</h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                Are you sure you want to delete order record <strong className="text-slate-800">"#{currentOrder?.orderNumber.substring(0, 8)}..."</strong>? This does not refund the payment but removes it from reports. This action is irreversible.
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
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
