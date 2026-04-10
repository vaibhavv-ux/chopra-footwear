import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiOutlinePlus, HiOutlineX } from 'react-icons/hi';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { PageLoader } from '../../components/ProtectedRoute';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function AdminEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', price: '', discount_price: '',
    category_id: '', brand: '', stock_qty: '0', is_featured: false,
  });
  const [sizes, setSizes] = useState([]);
  const [images, setImages] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get(`/products/${id}`),
      api.get('/categories'),
    ]).then(([prodRes, catRes]) => {
      const p = prodRes.data.product;
      setForm({
        name: p.name, description: p.description || '', price: p.price,
        discount_price: p.discount_price || '', category_id: p.category_id || '',
        brand: p.brand || '', stock_qty: p.stock_qty || 0, is_featured: p.is_featured,
      });
      setSizes(p.sizes?.map(s => ({ size: s.size, stock_qty: s.stock_qty })) || []);
      setCategories(catRes.data.categories);
      setLoading(false);
    }).catch(() => { setLoading(false); toast.error('Failed to load product'); });
  }, [id]);

  const addSize = () => setSizes([...sizes, { size: '', stock_qty: '0' }]);
  const removeSize = (i) => setSizes(sizes.filter((_, idx) => idx !== i));
  const updateSize = (i, key, val) => {
    const newSizes = [...sizes];
    newSizes[i][key] = val;
    setSizes(newSizes);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach(k => formData.append(k, form[k]));
      formData.append('sizes', JSON.stringify(sizes.filter(s => s.size)));
      images.forEach(img => formData.append('images', img));

      await fetch(`${API_URL}/api/products/${id}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include',
      });

      toast.success('Product updated!');
      navigate('/admin/products');
    } catch (err) {
      toast.error('Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="page-container py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-dark-900 mb-8">Edit Product</h1>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-dark-900">Basic Information</h2>
          <div>
            <label className="text-sm font-medium text-dark-700 mb-1.5 block">Product Name</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" required />
          </div>
          <div>
            <label className="text-sm font-medium text-dark-700 mb-1.5 block">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={4} className="input-field resize-none" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-dark-700 mb-1.5 block">Price (₹)</label>
              <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="input-field" required />
            </div>
            <div>
              <label className="text-sm font-medium text-dark-700 mb-1.5 block">Discount Price (₹)</label>
              <input type="number" value={form.discount_price} onChange={e => setForm({...form, discount_price: e.target.value})} className="input-field" />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-dark-700 mb-1.5 block">Category</label>
              <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} className="input-field">
                <option value="">Select</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-dark-700 mb-1.5 block">Brand</label>
              <input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="text-sm font-medium text-dark-700 mb-1.5 block">Stock Qty</label>
              <input type="number" value={form.stock_qty} onChange={e => setForm({...form, stock_qty: e.target.value})} className="input-field" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_featured} onChange={e => setForm({...form, is_featured: e.target.checked})} className="accent-primary-800 w-4 h-4" />
            <span className="text-sm font-medium text-dark-700">Featured Product</span>
          </label>
        </div>

        {/* Sizes */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-dark-900">Sizes</h2>
            <button type="button" onClick={addSize} className="text-primary-800 text-sm font-medium flex items-center gap-1">
              <HiOutlinePlus className="w-4 h-4" /> Add Size
            </button>
          </div>
          <div className="space-y-3">
            {sizes.map((s, i) => (
              <div key={i} className="flex gap-3 items-end">
                <div className="flex-1">
                  <input value={s.size} onChange={e => updateSize(i, 'size', e.target.value)} className="input-field !py-2" placeholder="Size" />
                </div>
                <div className="flex-1">
                  <input type="number" value={s.stock_qty} onChange={e => updateSize(i, 'stock_qty', e.target.value)} className="input-field !py-2" placeholder="Stock" />
                </div>
                <button type="button" onClick={() => removeSize(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg mb-0.5">
                  <HiOutlineX className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="card p-6">
          <h2 className="font-semibold text-dark-900 mb-4">Add More Images</h2>
          <input type="file" multiple accept="image/*" onChange={e => setImages(Array.from(e.target.files))} className="input-field" />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => navigate('/admin/products')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
