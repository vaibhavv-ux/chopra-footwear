import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { formatPrice, getImageUrl, getStatusColor } from '../utils/helpers';
import { PageLoader } from '../components/ProtectedRoute';

const TIMELINE_STEPS = ['pending', 'confirmed', 'shipped', 'delivered'];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data.order);
    } catch (err) {
      console.error('Failed to load order:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!order) return <div className="page-container py-20 text-center"><h2 className="text-2xl font-bold">Order not found</h2></div>;

  const currentStep = order.status === 'cancelled' ? -1 : TIMELINE_STEPS.indexOf(order.status);
  let address = {};
  try {
    address = typeof order.address_snapshot === 'string' ? JSON.parse(order.address_snapshot) : (order.address_snapshot || {});
  } catch { address = {}; }

  return (
    <div className="page-container py-8 animate-fade-in">
      <nav className="flex items-center gap-2 text-sm text-dark-500 mb-6">
        <Link to="/orders" className="hover:text-primary-800">My Orders</Link>
        <span>/</span>
        <span className="text-dark-900 font-medium">Order #{order.id}</span>
      </nav>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-dark-900">Order #{order.id}</h1>
        <span className={`badge text-sm ${getStatusColor(order.status)} capitalize`}>{order.status}</span>
      </div>

      {/* Timeline */}
      {order.status !== 'cancelled' && (
        <div className="card p-6 mb-8">
          <h2 className="font-semibold text-dark-900 mb-6">Order Timeline</h2>
          <div className="flex items-center justify-between relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-dark-200" />
            <div className="absolute top-4 left-0 h-0.5 bg-primary-800 transition-all duration-500" style={{ width: `${(currentStep / (TIMELINE_STEPS.length - 1)) * 100}%` }} />
            {TIMELINE_STEPS.map((step, i) => (
              <div key={step} className="relative flex flex-col items-center z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i <= currentStep ? 'bg-primary-800 text-white' : 'bg-dark-200 text-dark-500'}`}>
                  {i <= currentStep ? '✓' : i + 1}
                </div>
                <span className={`text-xs mt-2 capitalize font-medium ${i <= currentStep ? 'text-primary-800' : 'text-dark-500'}`}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {order.status === 'cancelled' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
          <p className="text-red-700 font-medium">This order has been cancelled.</p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card p-5">
          <h3 className="font-semibold text-dark-900 mb-2 text-sm uppercase tracking-wider">Order Info</h3>
          <p className="text-sm text-dark-600">Date: {new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="text-sm text-dark-600">Payment: {order.payment_method?.toUpperCase()}</p>
          <p className="text-sm text-dark-600">Payment Status: <span className="capitalize">{order.payment_status}</span></p>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-dark-900 mb-2 text-sm uppercase tracking-wider">Delivery Address</h3>
          {address.fullName && <p className="text-sm text-dark-600">{address.fullName}</p>}
          {address.street && <p className="text-sm text-dark-600">{address.street}</p>}
          {address.city && <p className="text-sm text-dark-600">{address.city}, {address.state} - {address.pincode}</p>}
          {address.phone && <p className="text-sm text-dark-600">Ph: {address.phone}</p>}
          {!address.fullName && typeof order.address_snapshot === 'string' && <p className="text-sm text-dark-600">{order.address_snapshot}</p>}
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-dark-900 mb-2 text-sm uppercase tracking-wider">Total</h3>
          <p className="text-3xl font-bold text-dark-900">{formatPrice(order.total_amount)}</p>
        </div>
      </div>

      {/* Order Items */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-dark-100">
          <h2 className="font-semibold text-dark-900">Order Items ({order.items?.length || 0})</h2>
        </div>
        <div className="divide-y divide-dark-100">
          {order.items?.map(item => (
            <div key={item.id} className="p-5 flex items-center gap-4">
              <img src={getImageUrl(item.image)} alt={item.name} className="w-16 h-16 object-cover rounded-lg bg-dark-50" />
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product_id}`} className="font-medium text-dark-900 hover:text-primary-800 text-sm">{item.name}</Link>
                <p className="text-xs text-dark-500">{item.brand} · Size: {item.size || 'N/A'} · Qty: {item.quantity}</p>
              </div>
              <span className="text-sm font-bold text-dark-900">{formatPrice(item.price_at_purchase * item.quantity)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
