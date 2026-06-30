import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  ClipboardList, 
  AlertTriangle,
  Bell,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { adminGetUsers, adminGetOrders, adminGetInventory, adminGetNotifications } from '../../services/adminApi';
import { getProducts } from '../../services/productApi';
import { User, Product, Order, InventoryItem, NotificationEvent } from '../../types';

const Analytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);

  const loadAnalyticsData = async () => {
    try {
      const [usersData, ordersData, productsData, inventoryData, notifData] = await Promise.all([
        adminGetUsers(),
        adminGetOrders(),
        getProducts(),
        adminGetInventory(),
        adminGetNotifications().catch(() => []) // Fallback in case notification-service is down
      ]);
      setUsers(usersData);
      setOrders(ordersData);
      setProducts(productsData);
      setInventory(inventoryData);
      setNotifications(notifData.reverse()); // Show newest first
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
    // Setup interval to poll Kafka notifications every 5 seconds
    const interval = setInterval(async () => {
      try {
        const notifData = await adminGetNotifications();
        setNotifications(notifData.reverse());
      } catch {
        // Suppress errors during background polling
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent" />
        <p className="text-slate-500 font-semibold text-xs">Computing chart distributions...</p>
      </div>
    );
  }

  // 1. Sales Trend
  const salesByDayMap: Record<string, number> = {};
  orders
    .filter(o => o.orderStatus !== 'CANCELLED' && o.orderStatus !== 'REJECTED')
    .forEach(o => {
      const date = new Date(o.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      salesByDayMap[date] = (salesByDayMap[date] || 0) + o.totalPrice;
    });

  const salesTrendData = Object.keys(salesByDayMap).map(date => ({
    date,
    sales: Number(salesByDayMap[date].toFixed(2))
  })).slice(-7);

  // 2. Category Pie Chart
  const salesByCategoryMap: Record<string, number> = {};
  products.forEach(prod => {
    salesByCategoryMap[prod.category || 'Other'] = 0;
  });

  orders
    .filter(o => o.orderStatus !== 'CANCELLED' && o.orderStatus !== 'REJECTED')
    .forEach(o => {
      if (o.orderLineItemsList) {
        o.orderLineItemsList.forEach(item => {
          // Find product category
          const prod = products.find(p => p.id === item.skuCode || p.skuCode === item.skuCode);
          const cat = prod?.category || 'Other';
          salesByCategoryMap[cat] = (salesByCategoryMap[cat] || 0) + (item.price * item.quantity);
        });
      }
    });

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6'];
  const categoryData = Object.keys(salesByCategoryMap).map(cat => ({
    name: cat,
    value: Number(salesByCategoryMap[cat].toFixed(2))
  })).filter(item => item.value > 0);

  // 3. Stock warning chart data
  const stockBarData = inventory.map(item => ({
    skuCode: item.skuCode,
    quantity: item.quantity
  })).slice(0, 8); // Top 8 items

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Business Analytics</h1>
          <p className="text-slate-500 text-sm mt-0.5">Statistical insights, category metrics, and Kafka event logs</p>
        </div>
        <button 
          onClick={loadAnalyticsData}
          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold p-2.5 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Charts Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart 1: Revenue Area */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-800 text-base">Revenue Flow Timeline</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                  <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                  <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chart 2: Category Shares */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-800 text-base">Revenue by Category</h3>
              <div className="h-56 flex items-center justify-center">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`₹${value}`, 'Sales']} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 10, fontWeight: 'bold' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <span className="text-slate-400 font-semibold text-xs">No categorization sales data.</span>
                )}
              </div>
            </div>

            {/* Chart 3: Stock Levels */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-800 text-base">Stock Quantities</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stockBarData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="skuCode" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="quantity" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Notification Drawer */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col h-[520px]">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4 shrink-0">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-indigo-600 animate-bounce" />
              <h3 className="font-black text-slate-800 text-base tracking-tight">Kafka Event Stream</h3>
            </div>
            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-extrabold px-2 py-0.5 rounded-lg animate-pulse uppercase tracking-wider">
              Live Feed
            </span>
          </div>

          <div className="flex-grow overflow-y-auto space-y-3.5 pr-1">
            {notifications.length > 0 ? notifications.map((notif, index) => {
              const isLowStock = notif.status === 'LOW_INVENTORY';
              const isRegister = notif.status === 'USER_REGISTERED';
              const isOrderPlaced = notif.status === 'ORDER_PLACED';
              
              return (
                <div key={index} className={`p-4 rounded-xl border text-xs leading-relaxed ${
                  isLowStock ? 'bg-rose-50 border-rose-100 text-rose-800' :
                  isRegister ? 'bg-sky-50 border-sky-100 text-sky-850' :
                  isOrderPlaced ? 'bg-emerald-50 border-emerald-100 text-emerald-850' :
                  'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <div className="flex items-center justify-between mb-1.5 font-bold uppercase tracking-wider text-[9px] text-slate-400">
                    <span className={
                      isLowStock ? 'text-rose-600' :
                      isRegister ? 'text-sky-655' :
                      isOrderPlaced ? 'text-emerald-600' : 'text-slate-500'
                    }>
                      {notif.status.replace('_', ' ')}
                    </span>
                    <span>Event Code: #{notif.orderNumber.substring(0, 8)}</span>
                  </div>
                  <p className="font-semibold">{notif.message}</p>
                </div>
              );
            }) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center space-y-2 py-12">
                <Sparkles className="w-8 h-8 text-slate-355" />
                <span className="font-bold text-xs">No active event signals logged.</span>
                <p className="text-[10px] text-slate-400 max-w-[200px]">Events like register, low inventory, status update will pop up here.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
