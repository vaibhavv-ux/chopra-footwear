import { useState, useEffect } from 'react';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import { EmptyWishlist } from '../components/EmptyStates';
import { PageLoader } from '../components/ProtectedRoute';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const { data } = await api.get('/wishlist');
      setWishlist(data.wishlist);
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      setWishlist(prev => prev.filter(w => w.product_id !== productId));
      toast.success('Removed from wishlist');
    } catch (err) {
      toast.error('Failed to remove from wishlist');
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="page-container py-8 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-bold text-dark-900 mb-8">
        My Wishlist {wishlist.length > 0 && <span className="text-dark-500 text-lg font-normal">({wishlist.length})</span>}
      </h1>

      {wishlist.length === 0 ? <EmptyWishlist /> : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {wishlist.map(item => (
            <ProductCard
              key={item.id}
              product={{
                id: item.product_id,
                name: item.name,
                price: item.price,
                discount_price: item.discount_price,
                brand: item.brand,
                primary_image: item.image,
                avg_rating: item.avg_rating,
              }}
              onWishlistToggle={removeFromWishlist}
              isWishlisted={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
