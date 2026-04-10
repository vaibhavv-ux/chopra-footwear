import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { PageLoader } from '../../components/ProtectedRoute';

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const { data } = await api.get('/admin/inventory');
      setProducts(data.products);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="page-container py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-dark-900 mb-8">Inventory ({products.length} products)</h1>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dark-50 text-dark-600">
              <tr>
                <th className="text-left px-5 py-3 font-medium">ID</th>
                <th className="text-left px-5 py-3 font-medium">Product</th>
                <th className="text-left px-5 py-3 font-medium">Brand</th>
                <th className="text-left px-5 py-3 font-medium">Total Stock</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium">Size Breakdown</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {products.map(product => {
                let sizes = [];
                try {
                  sizes = typeof product.sizes === 'string' ? JSON.parse(product.sizes) : (product.sizes || []);
                } catch { sizes = []; }

                return (
                  <tr key={product.id} className="hover:bg-dark-50 transition-colors">
                    <td className="px-5 py-3 font-medium">{product.id}</td>
                    <td className="px-5 py-3 font-medium">{product.name}</td>
                    <td className="px-5 py-3 text-dark-600">{product.brand || '—'}</td>
                    <td className="px-5 py-3 font-semibold">{product.stock_qty}</td>
                    <td className="px-5 py-3">
                      <span className={`badge ${product.stock_qty > 20 ? 'bg-green-100 text-green-800' : product.stock_qty > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {product.stock_qty > 20 ? 'In Stock' : product.stock_qty > 0 ? 'Low Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {sizes.map((s, i) => (
                          <span key={i} className={`text-xs px-2 py-0.5 rounded ${s.stock_qty > 0 ? 'bg-dark-100 text-dark-700' : 'bg-red-100 text-red-700'}`}>
                            {s.size}: {s.stock_qty}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
