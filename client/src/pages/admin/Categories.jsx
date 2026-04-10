import { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import api from '../../utils/api';
import { PageLoader } from '../../components/ProtectedRoute';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', image_url: '' });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data.categories);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/categories/${editing}`, form);
        toast.success('Category updated');
      } else {
        await api.post('/categories', form);
        toast.success('Category created');
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', slug: '', description: '', image_url: '' });
      loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    }
  };

  const editCategory = (cat) => {
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', image_url: cat.image_url || '' });
    setEditing(cat.id);
    setShowForm(true);
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted');
      loadCategories();
    } catch (err) {
      toast.error('Failed to delete category');
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="page-container py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-dark-900">Categories ({categories.length})</h1>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ name: '', slug: '', description: '', image_url: '' }); }} className="btn-primary flex items-center gap-2">
          <HiOutlinePlus className="w-5 h-5" /> Add Category
        </button>
      </div>

      {showForm && (
        <div className="card p-6 mb-8 animate-slide-down">
          <h2 className="font-semibold text-dark-900 mb-4">{editing ? 'Edit Category' : 'New Category'}</h2>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-dark-700 mb-1.5 block">Name</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} className="input-field" required />
            </div>
            <div>
              <label className="text-sm font-medium text-dark-700 mb-1.5 block">Slug</label>
              <input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="input-field" required />
            </div>
            <div>
              <label className="text-sm font-medium text-dark-700 mb-1.5 block">Description</label>
              <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="text-sm font-medium text-dark-700 mb-1.5 block">Image URL</label>
              <input value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} className="input-field" />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
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
                <th className="text-left px-5 py-3 font-medium">Category</th>
                <th className="text-left px-5 py-3 font-medium">Slug</th>
                <th className="text-left px-5 py-3 font-medium">Products</th>
                <th className="text-right px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {categories.map(cat => (
                <tr key={cat.id} className="hover:bg-dark-50 transition-colors">
                  <td className="px-5 py-3 font-medium">{cat.name}</td>
                  <td className="px-5 py-3 text-dark-500">{cat.slug}</td>
                  <td className="px-5 py-3">{cat.product_count}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => editCategory(cat)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <HiOutlinePencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteCategory(cat.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
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
