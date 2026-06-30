import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  ClipboardList, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock,
  ArrowRight
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
  Pie
} from 'recharts';
import { adminGetUsers, adminGetOrders, adminGetInventory } from '../../services/adminApi';
import { getProducts } from '../../services/productApi';
import { User, Product, Order, InventoryItem } from '../../types';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [usersData, ordersData, productsData, inventoryData] = await Promise.all([
          adminGetUsers(),
          adminGetOrders(),
          getProducts(),
          adminGetInventory()
        ]);
        setUsers(usersData);
        setOrders(ordersData);
        setProducts(productsData);
        setInventory(inventoryData);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
          <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
        </div>
        <p className="text-slate-500 font-semibold animate-pulse text-sm">Gathering admin metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 text-rose-700 text-sm font-semibold p-4 rounded-xl flex items-center space-x-2 border border-rose-100 max-w-xl mx-auto my-12">
        <AlertTriangle className="w-5 h-5 shrink-0" />
        <span>Failed to load metrics: {error}</span>
      </div>
    );
  }

  // Stat calculations
  const totalProducts = products.length;
  const totalUsers = users.length;
  const totalOrders = orders.length;
  
  // Total Revenue: sum of all order totals (excluding CANCELLED and REJECTED)
  const revenue = orders
    .filter(o => o.orderStatus !== 'CANCELLED' && o.orderStatus !== 'REJECTED')
    .reduce((acc, o) => acc + o.totalPrice, 0);

  const pendingOrders = orders.filter(o => o.orderStatus === 'PENDING').length;
  const confirmedOrders = orders.filter(o => o.orderStatus === 'CONFIRMED' || o.orderStatus === 'DELIVERED').length;
  const cancelledOrders = orders.filter(o => o.orderStatus === 'CANCELLED').length;
  
  const lowStockItems = inventory.filter(i => i.quantity < 10);
  const lowStockCount = lowStockItems.length;

  // Chart 1: Sales trend by day
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
  })).slice(-7); // Last 7 days

  // Chart 2: Order status distribution
  const orderStatusData = [
    { name: 'Pending', count: pendingOrders, color: '#f59e0b' },
    { name: 'Confirmed', count: orders.filter(o => o.orderStatus === 'CONFIRMED').length, color: '#6366f1' },
    { name: 'Delivered', count: orders.filter(o => o.orderStatus === 'DELIVERED').length, color: '#10b981' },
    { name: 'Cancelled', count: cancelledOrders, color: '#ef4444' }
  ];

  // Latest entities
  const latestOrders = [...orders].reverse().slice(0, 5);
  const latestUsers = [...users].reverse().slice(0, 5);

  const stats = [
    { name: 'Total Revenue', value: `₹${revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    { name: 'Total Products', value: totalProducts, icon: ShoppingBag, color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
    { name: 'Total Users', value: totalUsers, icon: Users, color: 'bg-sky-50 text-sky-700 border-sky-100' },
    { name: 'Total Orders', value: totalOrders, icon: ClipboardList, color: 'bg-amber-50 text-amber-700 border-amber-100' },
  ];

  const orderStats = [
    { name: 'Pending Orders', value: pendingOrders, icon: Clock, color: 'text-amber-500 bg-amber-50' },
    { name: 'Confirmed/Delivered', value: confirmedOrders, icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50' },
    { name: 'Cancelled Orders', value: cancelledOrders, icon: XCircle, color: 'text-rose-500 bg-rose-50' },
    { name: 'Low Stock SKU Warning', value: lowStockCount, icon: AlertTriangle, color: 'text-rose-600 bg-rose-50 border-rose-100 animate-pulse' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 text-sm mt-0.5">Real-time business performance analytics and metrics</p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`bg-white border rounded-2xl p-6 flex items-center justify-between shadow-xs ${stat.color}`}>
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{stat.name}</span>
                <span className="text-2xl font-black text-slate-900">{stat.value}</span>
              </div>
              <div className="p-3 bg-white/80 rounded-xl border border-inherit">
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {orderStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center space-x-3.5 shadow-xs">
              <div className={`p-2.5 rounded-xl ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">{stat.name}</span>
                <span className="text-lg font-extrabold text-slate-800 leading-none">{stat.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-slate-800 text-base">Sales Revenue Trend</h3>
            <span className="text-xs text-slate-400 font-semibold">Last 7 Days</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #f1f5f9', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }} 
                  formatter={(value) => [`₹${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-slate-800 text-base">Order Fulfillment</h3>
          </div>
          <div className="h-72 flex flex-col justify-between">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orderStatusData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #f1f5f9', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-500">
              {orderStatusData.map((stat, i) => (
                <div key={i} className="flex items-center space-x-2 p-2 bg-slate-50 rounded-xl">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: stat.color }} />
                  <span className="truncate">{stat.name}: {stat.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Orders */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-extrabold text-slate-800 text-base">Latest Orders</h3>
            <Link to="/admin/orders" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1 hover:underline">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {latestOrders.length > 0 ? latestOrders.map((order) => (
              <div key={order.id} className="px-6 py-4 flex items-center justify-between text-sm">
                <div>
                  <span className="font-bold text-slate-800">#{order.orderNumber.substring(0, 8)}...</span>
                  <div className="text-xs text-slate-400 font-semibold mt-0.5 flex space-x-2">
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>User: #{order.userId}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block font-black text-slate-800">₹{order.totalPrice.toFixed(2)}</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1 border ${
                    order.orderStatus === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                    order.orderStatus === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                    order.orderStatus === 'CANCELLED' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                    'bg-indigo-50 text-indigo-700 border-indigo-100'
                  }`}>{order.orderStatus}</span>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-slate-400 font-semibold text-xs">No orders registered yet.</div>
            )}
          </div>
        </div>

        {/* New Registered Users */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-extrabold text-slate-800 text-base">New Users</h3>
            <Link to="/admin/users" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1 hover:underline">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {latestUsers.length > 0 ? latestUsers.map((user) => (
              <div key={user.id} className="px-6 py-4 flex items-center justify-between text-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 font-extrabold text-xs flex items-center justify-center">
                    {`${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()}
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block leading-tight">{user.firstName} {user.lastName}</span>
                    <span className="text-xs text-slate-400 font-semibold leading-none">{user.email}</span>
                  </div>
                </div>
                <div>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    user.role === 'ROLE_ADMIN' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-slate-50 text-slate-600 border-slate-150'
                  }`}>
                    {user.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}
                  </span>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-slate-400 font-semibold text-xs">No users registered yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
