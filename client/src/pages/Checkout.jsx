import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, getImageUrl } from '../utils/helpers';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { HiOutlineCheckCircle } from 'react-icons/hi';

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const coupon = location.state?.coupon;

  const [step, setStep] = useState(1); // 1=address, 2=payment, 3=review, 4=success
  const [orderResult, setOrderResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    name: '',
  });

  const subtotal = cart.reduce((sum, item) => sum + (item.discount_price || item.price || 0) * (item.quantity || 1), 0);
  const discount = coupon ? coupon.discount : 0;
  const total = Math.max(subtotal - discount, 0);

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/orders', {
        payment_method: paymentMethod,
        address,
        coupon_code: coupon?.code,
      });
      setOrderResult(data);
      setStep(4);
      clearCart();
      toast.success('Order placed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && step !== 4) {
    navigate('/cart');
    return null;
  }

  // Success Step
  if (step === 4 && orderResult) {
    return (
      <div className="page-container py-20 animate-fade-in">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <HiOutlineCheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-dark-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-dark-500 mb-6">Your order #{orderResult.orderId} has been placed.</p>
          <div className="card p-6 text-left mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-dark-500">Order ID</span>
              <span className="font-semibold">#{orderResult.orderId}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-dark-500">Total Amount</span>
              <span className="font-semibold">{formatPrice(orderResult.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-500">Payment</span>
              <span className="font-semibold uppercase">{paymentMethod}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to={`/orders/${orderResult.orderId}`} className="btn-primary flex-1">View Order</Link>
            <Link to="/products" className="btn-secondary flex-1">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container py-8 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-bold text-dark-900 mb-8">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center justify-center gap-4 mb-10">
        {['Address', 'Payment', 'Review'].map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-primary-800 text-white' : 'bg-dark-100 text-dark-500'}`}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span className={`text-sm font-medium ${step === i + 1 ? 'text-dark-900' : 'text-dark-500'}`}>{s}</span>
            {i < 2 && <div className="w-12 h-0.5 bg-dark-200" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Step 1: Address */}
          {step === 1 && (
            <div className="card p-6 animate-fade-in">
              <h2 className="text-lg font-bold text-dark-900 mb-6">Delivery Address</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-dark-700 mb-1.5 block">Full Name</label>
                  <input value={address.fullName} onChange={e => setAddress({...address, fullName: e.target.value})} className="input-field" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-dark-700 mb-1.5 block">Phone</label>
                  <input value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} className="input-field" required />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-dark-700 mb-1.5 block">Street Address</label>
                  <input value={address.street} onChange={e => setAddress({...address, street: e.target.value})} className="input-field" placeholder="House No, Building, Street" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-dark-700 mb-1.5 block">City</label>
                  <input value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="input-field" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-dark-700 mb-1.5 block">State</label>
                  <input value={address.state} onChange={e => setAddress({...address, state: e.target.value})} className="input-field" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-dark-700 mb-1.5 block">Pincode</label>
                  <input value={address.pincode} onChange={e => setAddress({...address, pincode: e.target.value})} className="input-field" required />
                </div>
              </div>
              <button onClick={() => {
                if (!address.fullName || !address.phone || !address.street || !address.city || !address.state || !address.pincode) {
                  toast.error('Please fill all address fields');
                  return;
                }
                setStep(2);
              }} className="btn-primary mt-6">Continue to Payment</button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="card p-6 animate-fade-in">
              <h2 className="text-lg font-bold text-dark-900 mb-6">Payment Method</h2>
              <div className="space-y-4">
                <label className={`card p-4 flex items-center gap-4 cursor-pointer transition-all ${paymentMethod === 'cod' ? '!border-primary-800 !ring-2 !ring-primary-800/20 bg-dark-50' : ''}`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={e => setPaymentMethod(e.target.value)} className="accent-primary-800 w-5 h-5" />
                  <div>
                    <p className="font-semibold text-dark-900">Cash on Delivery</p>
                    <p className="text-sm text-dark-500">Pay when you receive your order</p>
                  </div>
                </label>
                
                <div className={`card overflow-hidden transition-all ${paymentMethod === 'online' ? '!border-primary-800 !ring-2 !ring-primary-800/20 bg-dark-50' : ''}`}>
                  <label className="p-4 flex items-center gap-4 cursor-pointer">
                    <input type="radio" name="payment" value="online" checked={paymentMethod === 'online'} onChange={e => setPaymentMethod(e.target.value)} className="accent-primary-800 w-5 h-5" />
                    <div>
                      <p className="font-semibold text-dark-900">Credit / Debit Card</p>
                      <p className="text-sm text-dark-500">Pay securely via Mastercard, Visa, or Amex</p>
                    </div>
                  </label>
                  
                  {paymentMethod === 'online' && (
                    <div className="p-4 pt-0 border-t border-dark-200 mt-2 animate-fade-in">
                      <div className="grid md:grid-cols-2 gap-4 mt-2">
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium text-dark-700 mb-1.5 block">Card Number</label>
                          <input 
                            type="text" 
                            maxLength="19"
                            placeholder="0000 0000 0000 0000"
                            value={cardDetails.cardNumber} 
                            onChange={e => {
                              let val = e.target.value.replace(/\D/g, '');
                              val = val.replace(/(.{4})/g, '$1 ').trim();
                              setCardDetails({...cardDetails, cardNumber: val});
                            }} 
                            className="input-field font-mono" 
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-dark-700 mb-1.5 block">Expiry Date</label>
                          <input 
                            type="text" 
                            placeholder="MM/YY"
                            maxLength="5"
                            value={cardDetails.expiry} 
                            onChange={e => {
                              let val = e.target.value.replace(/\D/g, '');
                              if (val.length >= 2) {
                                val = val.substring(0, 2) + '/' + val.substring(2, 4);
                              }
                              setCardDetails({...cardDetails, expiry: val});
                            }} 
                            className="input-field font-mono" 
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-dark-700 mb-1.5 block">CVV</label>
                          <input 
                            type="password" 
                            maxLength="4"
                            placeholder="123"
                            value={cardDetails.cvv} 
                            onChange={e => setCardDetails({...cardDetails, cvv: e.target.value.replace(/\D/g, '')})} 
                            className="input-field font-mono text-xl tracking-widest leading-none pt-2" 
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium text-dark-700 mb-1.5 block">Name on Card</label>
                          <input 
                            type="text" 
                            placeholder="CARDHOLDER NAME"
                            value={cardDetails.name} 
                            onChange={e => setCardDetails({...cardDetails, name: e.target.value.toUpperCase()})} 
                            className="input-field" 
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="btn-secondary">Back</button>
                <button onClick={() => {
                  if (paymentMethod === 'online') {
                    if (!cardDetails.cardNumber || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
                      toast.error('Please enter complete card details');
                      return;
                    }
                    if (cardDetails.cardNumber.replace(/\s/g, '').length < 15) {
                      toast.error('Please enter a valid card number');
                      return;
                    }
                    if (cardDetails.cvv.length < 3) {
                      toast.error('Please enter a valid CVV');
                      return;
                    }
                  }
                  setStep(3);
                }} className="btn-primary">Review Order</button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="card p-6 animate-fade-in">
              <h2 className="text-lg font-bold text-dark-900 mb-6">Review Your Order</h2>
              <div className="space-y-4 mb-6">
                <div className="bg-dark-50 rounded-xl p-4">
                  <h3 className="font-semibold text-dark-900 mb-2">Delivery Address</h3>
                  <p className="text-sm text-dark-600">{address.fullName}, {address.phone}</p>
                  <p className="text-sm text-dark-600">{address.street}, {address.city}, {address.state} - {address.pincode}</p>
                </div>
                <div className="bg-dark-50 rounded-xl p-4">
                  <h3 className="font-semibold text-dark-900 mb-2">Payment</h3>
                  <p className="text-sm text-dark-600">{paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-dark-900 mb-3">Items ({cart.length})</h3>
                  {cart.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 py-3 border-b border-dark-100 last:border-0">
                      <img src={getImageUrl(item.image)} alt={item.name} className="w-16 h-16 object-cover rounded-lg bg-dark-50" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-dark-900 line-clamp-1">{item.name || `Product #${item.product_id}`}</p>
                        <p className="text-xs text-dark-500">Size: {item.size || 'N/A'} × {item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold">{formatPrice((item.discount_price || item.price || 0) * (item.quantity || 1))}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-secondary">Back</button>
                <button onClick={handlePlaceOrder} disabled={loading} className="btn-primary flex-1">
                  {loading ? 'Placing Order...' : `Place Order — ${formatPrice(total)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="text-lg font-bold text-dark-900 mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-dark-500">Subtotal ({cart.length} items)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Coupon Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-dark-500">Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
