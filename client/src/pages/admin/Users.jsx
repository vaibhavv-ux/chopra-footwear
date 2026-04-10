import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { PageLoader } from '../../components/ProtectedRoute';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data.users);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId, role) => {
    try {
      await api.put(`/admin/users/${userId}`, { role });
      toast.success('User role updated');
      loadUsers();
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="page-container py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-dark-900 mb-8">All Users ({users.length})</h1>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dark-50 text-dark-600">
              <tr>
                <th className="text-left px-5 py-3 font-medium">ID</th>
                <th className="text-left px-5 py-3 font-medium">Name</th>
                <th className="text-left px-5 py-3 font-medium">Email</th>
                <th className="text-left px-5 py-3 font-medium">Phone</th>
                <th className="text-left px-5 py-3 font-medium">Orders</th>
                <th className="text-left px-5 py-3 font-medium">Role</th>
                <th className="text-left px-5 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-dark-50 transition-colors">
                  <td className="px-5 py-3 font-medium">{user.id}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary-800/10 rounded-full flex items-center justify-center">
                        <span className="text-primary-800 text-xs font-semibold">{user.name?.[0]?.toUpperCase()}</span>
                      </div>
                      {user.name}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-dark-600">{user.email}</td>
                  <td className="px-5 py-3 text-dark-600">{user.phone || '—'}</td>
                  <td className="px-5 py-3">{user.order_count}</td>
                  <td className="px-5 py-3">
                    <select
                      value={user.role}
                      onChange={e => updateRole(user.id, e.target.value)}
                      className={`input-field !py-1 !px-2 text-xs !w-auto ${user.role === 'admin' ? 'bg-accent-50 text-accent-700' : ''}`}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-5 py-3 text-dark-500">{new Date(user.created_at).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
