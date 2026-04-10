import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import api from '../../utils/api';
import { formatPrice, getImageUrl } from '../../utils/helpers';
import { PageLoader } from '../../components/ProtectedRoute';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    loadProducts();
  }, [page]);

  const loadProducts = async () => {
    try {
      const { data } = await api.get(`/products?page=${page}&limit=20`);
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      loadProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="page-container py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-dark-900">Products ({pagination.total || 0})</h1>
        <Link to="/admin/products/add" className="btn-primary flex items-center gap-2" id="add-product-btn">
          <HiOutlinePlus className="w-5 h-5" /> Add Product
        </Link>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dark-50 text-dark-600">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Product</th>
                <th className="text-left px-5 py-3 font-medium">Category</th>
                <th className="text-left px-5 py-3 font-medium">Price</th>
                <th className="text-left px-5 py-3 font-medium">Stock</th>
                <th className="text-left px-5 py-3 font-medium">Featured</th>
                <th className="text-right px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-dark-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img src={getImageUrl(product.primary_image)} alt="" className="w-12 h-12 object-cover rounded-lg bg-dark-50" />
                      <div>
                        <p className="font-medium text-dark-900 line-clamp-1">{product.name}</p>
                        <p className="text-xs text-dark-500">{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-dark-600">{product.category_name || '—'}</td>
                  <td className="px-5 py-3">
                    <span className="font-semibold">{formatPrice(product.discount_price || product.price)}</span>
                    {product.discount_price && <span className="text-dark-400 text-xs line-through ml-1">{formatPrice(product.price)}</span>}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`badge ${product.stock_qty > 10 ? 'bg-green-100 text-green-800' : product.stock_qty > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {product.stock_qty}
                    </span>
                  </td>
                  <td className="px-5 py-3">{product.is_featured ? '⭐' : '—'}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/admin/products/edit/${product.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <HiOutlinePencil className="w-4 h-4" />
                      </Link>
                      <button onClick={() => deleteProduct(product.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
