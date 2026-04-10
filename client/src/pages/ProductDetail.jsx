import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiOutlineHeart, HiHeart, HiOutlineShoppingBag, HiOutlineTruck, HiOutlineShieldCheck, HiOutlineRefresh } from 'react-icons/hi';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice, getImageUrl, calculateDiscount } from '../utils/helpers';
import StarRating from '../components/StarRating';
import ProductCard from '../components/ProductCard';
import { PageLoader } from '../components/ProtectedRoute';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({});
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    loadProduct();
    loadReviews();
    window.scrollTo(0, 0);
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/products/${id}`);
      setProduct(data.product);
      setRelated(data.related);
      setSelectedImage(0);
      setSelectedSize('');
      setQuantity(1);

      // Track recently viewed
      if (user) {
        api.post('/admin/recently-viewed', { product_id: id }).catch(() => {});
      }

      // Check wishlist
      if (user) {
        try {
          const { data: wlData } = await api.get('/wishlist');
          setIsWishlisted(wlData.wishlist.some(w => w.product_id === parseInt(id)));
        } catch {}
      }
    } catch (err) {
      console.error('Failed to load product:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const { data } = await api.get(`/reviews/${id}`);
      setReviews(data.reviews);
      setReviewStats(data.stats);
    } catch {}
  };

  const handleAddToCart = () => {
    if (!selectedSize && product.sizes?.length > 0) {
      toast.error('Please select a size');
      return;
    }
    addToCart(product.id, selectedSize, quantity, product.name);
  };

  const toggleWishlist = async () => {
    if (!user) {
      toast.error('Please login to use wishlist');
      return;
    }
    try {
      if (isWishlisted) {
        await api.delete(`/wishlist/${product.id}`);
        setIsWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await api.post('/wishlist', { product_id: product.id });
        setIsWishlisted(true);
        toast.success('Added to wishlist');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update wishlist');
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to submit a review');
      return;
    }
    setSubmittingReview(true);
    try {
      await api.post(`/reviews/${id}`, reviewForm);
      toast.success('Review submitted');
      setReviewForm({ rating: 5, comment: '' });
      loadReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!product) return <div className="page-container py-20 text-center"><h2 className="text-2xl font-bold">Product not found</h2></div>;

  const discount = calculateDiscount(product.price, product.discount_price);
  const images = product.images || [];

  return (
    <div className="page-container py-8 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-dark-500 mb-8">
        <Link to="/" className="hover:text-primary-800">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-primary-800">Products</Link>
        <span>/</span>
        {product.category_name && (
          <>
            <Link to={`/products?category=${product.category_slug}`} className="hover:text-primary-800">{product.category_name}</Link>
            <span>/</span>
          </>
        )}
        <span className="text-dark-900 font-medium">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-dark-50 rounded-2xl overflow-hidden">
            <img
              src={getImageUrl(images[selectedImage]?.image_url)}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${i === selectedImage ? 'border-primary-800 ring-2 ring-primary-800/20' : 'border-dark-200 hover:border-dark-300'}`}
                >
                  <img src={getImageUrl(img.image_url)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-2">
            <span className="text-sm text-dark-500 uppercase tracking-wider">{product.brand}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-dark-900 mb-3">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={reviewStats.avg_rating || 0} readonly size="sm" />
            <span className="text-sm text-dark-500">
              {reviewStats.avg_rating || 0} ({reviewStats.total_reviews || 0} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold text-dark-900">
              {formatPrice(product.discount_price || product.price)}
            </span>
            {product.discount_price && (
              <>
                <span className="text-lg text-dark-400 line-through">{formatPrice(product.price)}</span>
                <span className="badge bg-green-100 text-green-800">-{discount}% OFF</span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="text-dark-600 leading-relaxed mb-6">{product.description}</p>

          {/* Size Selector */}
          {product.sizes?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-dark-900 mb-3">Select Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSize(s.size)}
                    disabled={s.stock_qty === 0}
                    className={`w-14 h-12 rounded-lg text-sm font-medium transition-all
                      ${selectedSize === s.size ? 'bg-primary-800 text-white ring-2 ring-primary-800/30' : s.stock_qty === 0 ? 'bg-dark-50 text-dark-300 cursor-not-allowed line-through' : 'bg-dark-50 text-dark-700 hover:bg-dark-100'}`}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <h3 className="font-semibold text-dark-900 mb-3">Quantity</h3>
            <div className="flex items-center border border-dark-200 rounded-lg w-fit">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 text-lg font-medium hover:bg-dark-50 transition-colors rounded-l-lg">−</button>
              <span className="px-6 py-2 font-semibold text-dark-900 border-x border-dark-200">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 text-lg font-medium hover:bg-dark-50 transition-colors rounded-r-lg">+</button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={product.stock_qty === 0}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              id="add-to-cart-btn"
            >
              <HiOutlineShoppingBag className="w-5 h-5" />
              {product.stock_qty === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button
              onClick={toggleWishlist}
              className="p-3 border-2 border-dark-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-all"
              id="wishlist-btn"
            >
              {isWishlisted ? <HiHeart className="w-6 h-6 text-red-500" /> : <HiOutlineHeart className="w-6 h-6 text-dark-500" />}
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-dark-50 rounded-xl">
            {[
              { icon: HiOutlineTruck, text: 'Free Shipping' },
              { icon: HiOutlineShieldCheck, text: 'Genuine Product' },
              { icon: HiOutlineRefresh, text: 'Easy Returns' },
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-1">
                <f.icon className="w-5 h-5 text-primary-800" />
                <span className="text-xs text-dark-600">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-dark-900 mb-8">Customer Reviews</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Review Form */}
          <div className="md:col-span-1">
            <div className="card p-6">
              <h3 className="font-semibold text-dark-900 mb-4">Write a Review</h3>
              {user ? (
                <form onSubmit={submitReview} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-dark-700 mb-2 block">Your Rating</label>
                    <StarRating rating={reviewForm.rating} setRating={(r) => setReviewForm(prev => ({ ...prev, rating: r }))} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-700 mb-2 block">Your Review</label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="Share your experience..."
                      rows={4}
                      className="input-field resize-none"
                    />
                  </div>
                  <button type="submit" disabled={submittingReview} className="btn-primary w-full">
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <p className="text-dark-500 text-sm">
                  <Link to="/login" className="text-primary-800 font-semibold">Login</Link> to write a review.
                </p>
              )}
            </div>
          </div>

          {/* Reviews list */}
          <div className="md:col-span-2 space-y-4">
            {reviews.length === 0 ? (
              <p className="text-dark-500 text-center py-8">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="card p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-800/10 rounded-full flex items-center justify-center">
                        <span className="text-primary-800 font-semibold text-sm">{review.user_name?.[0]?.toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-dark-900 text-sm">{review.user_name}</p>
                        <p className="text-xs text-dark-500">{new Date(review.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                    </div>
                    <StarRating rating={review.rating} readonly size="sm" />
                  </div>
                  {review.comment && <p className="text-dark-600 text-sm mt-2">{review.comment}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-dark-900 mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
