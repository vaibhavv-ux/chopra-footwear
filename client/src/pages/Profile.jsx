import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineUser } from 'react-icons/hi';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container py-8 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-bold text-dark-900 mb-8">My Profile</h1>

      <div className="max-w-2xl">
        <div className="card p-8">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-dark-100">
            <div className="w-16 h-16 bg-primary-800 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-dark-900">{user?.name}</h2>
              <p className="text-sm text-dark-500">{user?.email}</p>
              <span className="badge bg-primary-800/10 text-primary-800 mt-1 capitalize">{user?.role}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-dark-700 mb-1.5 block">Full Name</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" required />
              </div>
              <div>
                <label className="text-sm font-medium text-dark-700 mb-1.5 block">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-field" required />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-dark-700 mb-1.5 block">Phone</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input-field" placeholder="+91 XXXXXXXXXX" />
            </div>
            <div>
              <label className="text-sm font-medium text-dark-700 mb-1.5 block">Address</label>
              <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} rows={3} className="input-field resize-none" placeholder="Full address" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
