import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { formatPrice, getStatusColor } from '../utils/helpers';
import { EmptyOrders } from '../components/EmptyStates';
import { PageLoader } from '../components/ProtectedRoute';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data } = await api.get('/orders/my');
      setOrders(data.orders);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="page-container py-8 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-bold text-dark-900 mb-8">My Orders</h1>

      {orders.length === 0 ? <EmptyOrders /> : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link key={order.id} to={`/orders/${order.id}`} className="card p-5 block hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-dark-900">Order #{order.id}</span>
                  <span className={`badge ${getStatusColor(order.status)} capitalize`}>{order.status}</span>
                </div>
                <span className="text-lg font-bold text-dark-900">{formatPrice(order.total_amount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-dark-500">
                <span>{new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <span>{order.item_count} item(s) · {order.payment_method?.toUpperCase()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
