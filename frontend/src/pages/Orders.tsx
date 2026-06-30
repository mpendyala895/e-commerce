import React, { useEffect, useState } from 'react';
import { getUserOrders } from '../services/orderApi';
import { getProductsBySkus } from '../services/productApi';
import { Order } from '../types';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { Calendar, Package, AlertCircle } from 'lucide-react';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getUserOrders();
        
        // Collect all unique, non-null/non-empty SKU codes from all user orders
        const skus = Array.from(
          new Set(
            data.flatMap(order => (order.orderLineItemsList || []).map(item => item.skuCode))
          )
        ).filter(Boolean);

        if (skus.length > 0) {
          try {
            // Bulk fetch details for these SKUs from the Product Service
            const products = await getProductsBySkus(skus);
            const productMap = new Map(products.map(p => [p.skuCode, p]));

            // Merge product details with order line items
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
            console.error('Failed to load product details for orders:', prodErr);
            // Fallback to original order data if product enrichment fails
            setOrders(data);
          }
        } else {
          setOrders(data);
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Error retrieving orders';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    const normStatus = (status || '').toUpperCase();
    if (normStatus === 'DELIVERED') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    }
    if (normStatus === 'PENDING') {
      return 'bg-amber-50 text-amber-700 border-amber-100';
    }
    if (normStatus === 'CONFIRMED') {
      return 'bg-indigo-50 text-indigo-700 border-indigo-100';
    }
    return 'bg-rose-50 text-rose-700 border-rose-100';
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="bg-rose-50 text-rose-700 text-sm font-semibold p-4 rounded-xl flex items-center space-x-2 border border-rose-100 max-w-xl mx-auto my-12">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span>Failed to load orders: {error}</span>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        title="No Orders Yet"
        description="You haven't placed any orders yet. Once you complete your checkout from the cart, your orders will appear here."
        actionText="Explore Products"
        actionPath="/products"
      />
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Order History</h1>
        <p className="text-slate-500 text-sm mt-1">Track details and statuses of all your recent purchases</p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden"
          >
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4 text-xs font-semibold text-slate-500">
              <div className="flex space-x-6">
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">
                    Order Placed
                  </span>
                  <div className="flex items-center space-x-1 text-slate-700 font-bold">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">
                    Total Price
                  </span>
                  <span className="text-indigo-600 font-extrabold text-sm">
                    ₹{order.totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-slate-400 font-medium">Order Number: #{order.orderNumber}</span>
                <span
                  className={`px-3 py-1 rounded-full border text-[10px] uppercase font-bold tracking-wider ${getStatusBadge(
                    order.orderStatus
                  )}`}
                >
                  {order.orderStatus}
                </span>
              </div>
            </div>

            <div className="p-6 divide-y divide-slate-100">
              {(order.orderLineItemsList || []).map((item, idx) => (
                <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-14 h-14 object-cover rounded-xl bg-slate-50 border border-slate-100"
                      />
                    ) : (
                      <div className="bg-indigo-50 p-4 rounded-xl text-indigo-600">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{item.productName}</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        SKU: <span className="font-semibold text-slate-600">{item.skuCode}</span>
                        {' • '}
                        Qty: <span className="font-semibold text-slate-600">{item.quantity}</span>
                        {' • '}
                        Price: <span className="font-semibold text-slate-600">₹{item.price.toFixed(2)}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-slate-700">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
