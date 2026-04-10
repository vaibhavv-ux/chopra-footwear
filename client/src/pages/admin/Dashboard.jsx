import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineUsers, HiOutlineShoppingBag, HiOutlineCurrencyRupee, HiOutlineCube, HiOutlineArrowRight } from 'react-icons/hi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../../utils/api';
import { formatPrice, getStatusColor } from '../../utils/helpers';
import { PageLoader } from '../../components/ProtectedRoute';

const PIE_COLORS = ['#7B1F32', '#C9A84C', '#2563eb', '#16a34a'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const { data } = await api.get('/admin/dashboard');
      setData(data);
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!data) return null;

  const dailySalesData = data.dailySales.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    revenue: d.revenue,
    orders: d.orders,
  }));

  const categoryData = data.categoryStats.map(c => ({
    name: c.name,
    value: c.order_count,
  }));

  return (
    <div className="page-container py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-dark-900">Admin Dashboard</h1>
          <p className="text-dark-500 text-sm mt-1">Welcome back! Here's your store overview.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/products" className="btn-secondary !py-2 !px-4 text-sm hidden md:inline-flex">Products</Link>
          <Link to="/admin/orders" className="btn-primary !py-2 !px-4 text-sm">Orders</Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        {[
          { icon: HiOutlineUsers, label: 'Total Users', value: data.stats.users, color: 'text-blue-600 bg-blue-100' },
          { icon: HiOutlineShoppingBag, label: 'Total Orders', value: data.stats.orders, color: 'text-purple-600 bg-purple-100' },
          { icon: HiOutlineCurrencyRupee, label: 'Revenue', value: formatPrice(data.stats.revenue), color: 'text-green-600 bg-green-100' },
          { icon: HiOutlineCube, label: 'Products', value: data.stats.products, color: 'text-orange-600 bg-orange-100' },
        ].map((stat, i) => (
          <div key={i} className="card p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-dark-900">{stat.value}</p>
            <p className="text-sm text-dark-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 card p-6">
          <h2 className="font-semibold text-dark-900 mb-4">Revenue - Last 7 Days</h2>
          {dailySalesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailySalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e7e7" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => formatPrice(v)} />
                <Line type="monotone" dataKey="revenue" stroke="#7B1F32" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-dark-500">No sales data yet</div>
          )}
        </div>
        <div className="card p-6">
          <h2 className="font-semibold text-dark-900 mb-4">Orders by Category</h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-dark-500">No order data yet</div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Products', link: '/admin/products', desc: 'Manage catalog' },
          { label: 'Orders', link: '/admin/orders', desc: 'View all orders' },
          { label: 'Users', link: '/admin/users', desc: 'Manage users' },
          { label: 'Categories', link: '/admin/categories', desc: 'Edit categories' },
          { label: 'Coupons', link: '/admin/coupons', desc: 'Manage discounts' },
          { label: 'Inventory', link: '/admin/inventory', desc: 'Stock levels' },
        ].map((item, i) => (
          <Link key={i} to={item.link} className="card p-4 hover:shadow-md transition-shadow group">
            <h3 className="font-semibold text-dark-900 flex items-center justify-between">
              {item.label}
              <HiOutlineArrowRight className="w-4 h-4 text-dark-400 group-hover:text-primary-800 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-dark-500 mt-1">{item.desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-dark-100 flex items-center justify-between">
          <h2 className="font-semibold text-dark-900">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-primary-800 font-medium hover:underline">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dark-50 text-dark-600">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Order ID</th>
                <th className="text-left px-5 py-3 font-medium">Customer</th>
                <th className="text-left px-5 py-3 font-medium">Amount</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {data.recentOrders.map(order => (
                <tr key={order.id} className="hover:bg-dark-50 transition-colors">
                  <td className="px-5 py-3 font-medium">#{order.id}</td>
                  <td className="px-5 py-3">{order.user_name}</td>
                  <td className="px-5 py-3 font-semibold">{formatPrice(order.total_amount)}</td>
                  <td className="px-5 py-3"><span className={`badge ${getStatusColor(order.status)} capitalize`}>{order.status}</span></td>
                  <td className="px-5 py-3 text-dark-500">{new Date(order.created_at).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
