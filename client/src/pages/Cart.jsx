import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineTrash, HiPlus, HiMinus } from 'react-icons/hi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, getImageUrl } from '../utils/helpers';
import { EmptyCart } from '../components/EmptyStates';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, cartCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const subtotal = cart.reduce((sum, item) => {
    const price = item.discount_price || item.price || 0;
    return sum + price * (item.quantity || 1);
  }, 0);

  const discount = coupon ? coupon.discount : 0;
  const total = Math.max(subtotal - discount, 0);

  const validateCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    try {
      const { data } = await api.post('/coupons/validate', { code: couponCode, order_total: subtotal });
      setCoupon(data.coupon);
      toast.success(`Coupon applied! You save ${formatPrice(data.coupon.discount)}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
      setCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please login to checkout');
      navigate('/login');
      return;
    }
    navigate('/checkout', { state: { coupon } });
  };

  if (cart.length === 0) return <div className="page-container py-8"><EmptyCart /></div>;

  return (
    <div className="page-container py-8 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-bold text-dark-900 mb-8">Shopping Cart ({cartCount} items)</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item, index) => (
            <div key={item.id || index} className="card p-4 md:p-6 flex gap-4">
              <Link to={`/products/${item.product_id}`} className="shrink-0">
                <img
                  src={getImageUrl(item.image)}
                  alt={item.name}
                  className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-xl bg-dark-50"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product_id}`} className="font-semibold text-dark-900 hover:text-primary-800 line-clamp-1 transition-colors">
                  {item.name || `Product #${item.product_id}`}
                </Link>
                {item.size && <p className="text-sm text-dark-500 mt-1">Size: {item.size}</p>}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-lg font-bold text-dark-900">
                    {formatPrice((item.discount_price || item.price || 0) * (item.quantity || 1))}
                  </span>
                  {item.discount_price && (
                    <span className="text-sm text-dark-400 line-through">{formatPrice(item.price)}/ea</span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-dark-200 rounded-lg">
                    <button onClick={() => updateQuantity(user ? item.id : index, (item.quantity || 1) - 1)} className="p-2 hover:bg-dark-50 rounded-l-lg transition-colors">
                      <HiMinus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-1 text-sm font-semibold border-x border-dark-200">{item.quantity || 1}</span>
                    <button onClick={() => updateQuantity(user ? item.id : index, (item.quantity || 1) + 1)} className="p-2 hover:bg-dark-50 rounded-r-lg transition-colors">
                      <HiPlus className="w-4 h-4" />
                    </button>
                  </div>
                  <button onClick={() => removeFromCart(user ? item.id : index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <HiOutlineTrash className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="text-lg font-bold text-dark-900 mb-6">Order Summary</h2>

            {/* Coupon */}
            {user && (
              <div className="mb-6">
                <label className="text-sm font-medium text-dark-700 mb-2 block">Coupon Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="input-field !py-2 text-sm flex-1"
                    id="coupon-input"
                  />
                  <button onClick={validateCoupon} disabled={validatingCoupon} className="btn-secondary !py-2 !px-4 text-sm">
                    {validatingCoupon ? '...' : 'Apply'}
                  </button>
                </div>
                {coupon && (
                  <p className="text-sm text-green-600 mt-2 font-medium">
                    ✓ {coupon.code} applied — {coupon.discount_type === 'percent' ? `${coupon.value}% off` : `₹${coupon.value} off`}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-dark-500">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-dark-500">Shipping</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <hr className="border-dark-100" />
              <div className="flex justify-between text-lg font-bold text-dark-900">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <button onClick={handleCheckout} className="btn-primary w-full" id="checkout-btn">
              Proceed to Checkout
            </button>
            <Link to="/products" className="block text-center text-sm text-primary-800 font-medium mt-4 hover:underline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
