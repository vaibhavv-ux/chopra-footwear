import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCart();
      mergeLocalCart();
    } else {
      loadLocalCart();
    }
  }, [user]);

  const loadLocalCart = () => {
    try {
      const saved = localStorage.getItem('chopra_cart');
      if (saved) setCart(JSON.parse(saved));
    } catch { setCart([]); }
  };

  const saveLocalCart = (items) => {
    localStorage.setItem('chopra_cart', JSON.stringify(items));
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/cart');
      setCart(data.cart);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const mergeLocalCart = async () => {
    try {
      const saved = localStorage.getItem('chopra_cart');
      if (saved) {
        const localItems = JSON.parse(saved);
        if (localItems.length > 0) {
          await api.post('/cart/merge', { items: localItems });
          localStorage.removeItem('chopra_cart');
          fetchCart();
        }
      }
    } catch (err) {
      console.error('Failed to merge cart:', err);
    }
  };

  const addToCart = async (product_id, size, quantity = 1, productName = '') => {
    try {
      if (user) {
        await api.post('/cart', { product_id, size, quantity });
        await fetchCart();
      } else {
        const existingIndex = cart.findIndex(i => i.product_id === product_id && i.size === size);
        let newCart;
        if (existingIndex >= 0) {
          newCart = [...cart];
          newCart[existingIndex].quantity += quantity;
        } else {
          newCart = [...cart, { product_id, size, quantity }];
        }
        setCart(newCart);
        saveLocalCart(newCart);
      }
      toast.success(productName ? `${productName} added to cart` : 'Added to cart');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      if (user) {
        if (quantity <= 0) {
          await api.delete(`/cart/${cartItemId}`);
        } else {
          await api.put(`/cart/${cartItemId}`, { quantity });
        }
        await fetchCart();
      } else {
        if (quantity <= 0) {
          const newCart = cart.filter((_, i) => i !== cartItemId);
          setCart(newCart);
          saveLocalCart(newCart);
        } else {
          const newCart = [...cart];
          newCart[cartItemId].quantity = quantity;
          setCart(newCart);
          saveLocalCart(newCart);
        }
      }
    } catch (err) {
      toast.error('Failed to update cart');
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      if (user) {
        await api.delete(`/cart/${cartItemId}`);
        await fetchCart();
      } else {
        const newCart = cart.filter((_, i) => i !== cartItemId);
        setCart(newCart);
        saveLocalCart(newCart);
      }
      toast.success('Item removed from cart');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      if (user) {
        await api.delete('/cart');
        setCart([]);
      } else {
        setCart([]);
        localStorage.removeItem('chopra_cart');
      }
    } catch (err) {
      toast.error('Failed to clear cart');
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <CartContext.Provider value={{ cart, loading, cartCount, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
