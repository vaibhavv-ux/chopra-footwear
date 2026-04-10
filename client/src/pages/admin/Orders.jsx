import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { formatPrice, getStatusColor } from '../../utils/helpers';
import { PageLoader } from '../../components/ProtectedRoute';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    loadOrders();
  }, [statusFilter, page]);

  const loadOrders = async () => {
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (statusFilter) params.set('status', statusFilter);
      const { data } = await api.get(`/orders?${params}`);
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success('Order status updated');
      loadOrders();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="page-container py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-dark-900">All Orders ({pagination.total || 0})</h1>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="input-field !w-auto !py-2 text-sm">
          <option value="">All Statuses</option>
          {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => (
            <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dark-50 text-dark-600">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Order</th>
                <th className="text-left px-5 py-3 font-medium">Customer</th>
                <th className="text-left px-5 py-3 font-medium">Items</th>
                <th className="text-left px-5 py-3 font-medium">Amount</th>
                <th className="text-left px-5 py-3 font-medium">Payment</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium">Date</th>
                <th className="text-left px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-dark-50 transition-colors">
                  <td className="px-5 py-3 font-semibold">#{order.id}</td>
                  <td className="px-5 py-3">
                    <p className="font-medium">{order.user_name}</p>
                    <p className="text-xs text-dark-500">{order.user_email}</p>
                  </td>
                  <td className="px-5 py-3">{order.item_count}</td>
                  <td className="px-5 py-3 font-semibold">{formatPrice(order.total_amount)}</td>
                  <td className="px-5 py-3 uppercase text-xs font-medium">{order.payment_method}</td>
                  <td className="px-5 py-3"><span className={`badge ${getStatusColor(order.status)} capitalize`}>{order.status}</span></td>
                  <td className="px-5 py-3 text-dark-500">{new Date(order.created_at).toLocaleDateString('en-IN')}</td>
                  <td className="px-5 py-3">
                    <select
                      value={order.status}
                      onChange={e => updateStatus(order.id, e.target.value)}
                      className="input-field !py-1.5 !px-2 text-xs !w-auto"
                    >
                      {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-lg text-sm font-medium ${p === page ? 'bg-primary-800 text-white' : 'bg-dark-50 hover:bg-dark-100'}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
