import { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';
import api from '../../utils/api';
import { formatPrice } from '../../utils/helpers';
import { PageLoader } from '../../components/ProtectedRoute';
import toast from 'react-hot-toast';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: '', discount_type: 'percent', value: '', min_order: '', max_uses: '', expiry_date: ''
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      const { data } = await api.get('/coupons');
      setCoupons(data.coupons);
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/coupons', form);
      toast.success('Coupon created');
      setShowForm(false);
      setForm({ code: '', discount_type: 'percent', value: '', min_order: '', max_uses: '', expiry_date: '' });
      loadCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create coupon');
    }
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      toast.success('Coupon deleted');
      loadCoupons();
    } catch (err) {
      toast.error('Failed to delete coupon');
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="page-container py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-dark-900">Coupons ({coupons.length})</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <HiOutlinePlus className="w-5 h-5" /> Create Coupon
        </button>
      </div>

      {showForm && (
        <div className="card p-6 mb-8 animate-slide-down">
          <h2 className="font-semibold text-dark-900 mb-4">New Coupon</h2>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-dark-700 mb-1.5 block">Code</label>
              <input value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} className="input-field" placeholder="e.g. SAVE20" required />
            </div>
            <div>
              <label className="text-sm font-medium text-dark-700 mb-1.5 block">Type</label>
              <select value={form.discount_type} onChange={e => setForm({...form, discount_type: e.target.value})} className="input-field">
                <option value="percent">Percentage (%)</option>
                <option value="flat">Flat (₹)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-dark-700 mb-1.5 block">Value</label>
              <input type="number" value={form.value} onChange={e => setForm({...form, value: e.target.value})} className="input-field" required />
            </div>
            <div>
              <label className="text-sm font-medium text-dark-700 mb-1.5 block">Min Order (₹)</label>
              <input type="number" value={form.min_order} onChange={e => setForm({...form, min_order: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="text-sm font-medium text-dark-700 mb-1.5 block">Max Uses</label>
              <input type="number" value={form.max_uses} onChange={e => setForm({...form, max_uses: e.target.value})} className="input-field" placeholder="0 = unlimited" />
            </div>
            <div>
              <label className="text-sm font-medium text-dark-700 mb-1.5 block">Expiry Date</label>
              <input type="date" value={form.expiry_date} onChange={e => setForm({...form, expiry_date: e.target.value})} className="input-field" />
            </div>
            <div className="md:col-span-3 flex gap-3">
              <button type="submit" className="btn-primary">Create Coupon</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dark-50 text-dark-600">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Code</th>
                <th className="text-left px-5 py-3 font-medium">Type</th>
                <th className="text-left px-5 py-3 font-medium">Value</th>
                <th className="text-left px-5 py-3 font-medium">Min Order</th>
                <th className="text-left px-5 py-3 font-medium">Used / Max</th>
                <th className="text-left px-5 py-3 font-medium">Expiry</th>
                <th className="text-right px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {coupons.map(coupon => (
                <tr key={coupon.id} className="hover:bg-dark-50 transition-colors">
                  <td className="px-5 py-3 font-bold text-primary-800">{coupon.code}</td>
                  <td className="px-5 py-3 capitalize">{coupon.discount_type}</td>
                  <td className="px-5 py-3 font-semibold">{coupon.discount_type === 'percent' ? `${coupon.value}%` : formatPrice(coupon.value)}</td>
                  <td className="px-5 py-3">{formatPrice(coupon.min_order)}</td>
                  <td className="px-5 py-3">{coupon.used_count} / {coupon.max_uses || '∞'}</td>
                  <td className="px-5 py-3 text-dark-500">{coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleDateString('en-IN') : '—'}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end">
                      <button onClick={() => deleteCoupon(coupon.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
