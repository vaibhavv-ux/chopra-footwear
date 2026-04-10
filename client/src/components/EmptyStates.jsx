import { HiOutlineShoppingBag, HiOutlineHeart, HiOutlineSearch, HiOutlineClipboardList } from 'react-icons/hi';
import { Link } from 'react-router-dom';

export function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      <div className="w-24 h-24 bg-dark-50 rounded-full flex items-center justify-center mb-6">
        <HiOutlineShoppingBag className="w-12 h-12 text-dark-300" />
      </div>
      <h3 className="text-xl font-semibold text-dark-900 mb-2">Your cart is empty</h3>
      <p className="text-dark-500 mb-6 text-center max-w-sm">Looks like you haven't added anything to your cart yet. Start shopping to find something you love!</p>
      <Link to="/products" className="btn-primary">Browse Products</Link>
    </div>
  );
}

export function EmptyWishlist() {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      <div className="w-24 h-24 bg-dark-50 rounded-full flex items-center justify-center mb-6">
        <HiOutlineHeart className="w-12 h-12 text-dark-300" />
      </div>
      <h3 className="text-xl font-semibold text-dark-900 mb-2">Your wishlist is empty</h3>
      <p className="text-dark-500 mb-6 text-center max-w-sm">Save items you love so you can find them easily later. Tap the heart icon on any product!</p>
      <Link to="/products" className="btn-primary">Discover Products</Link>
    </div>
  );
}

export function NoResults({ query }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      <div className="w-24 h-24 bg-dark-50 rounded-full flex items-center justify-center mb-6">
        <HiOutlineSearch className="w-12 h-12 text-dark-300" />
      </div>
      <h3 className="text-xl font-semibold text-dark-900 mb-2">No results found</h3>
      <p className="text-dark-500 mb-6 text-center max-w-sm">
        {query ? `We couldn't find any products matching "${query}". Try a different search term.` : 'No products match your current filters. Try adjusting your search criteria.'}
      </p>
      <Link to="/products" className="btn-secondary">View All Products</Link>
    </div>
  );
}

export function EmptyOrders() {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      <div className="w-24 h-24 bg-dark-50 rounded-full flex items-center justify-center mb-6">
        <HiOutlineClipboardList className="w-12 h-12 text-dark-300" />
      </div>
      <h3 className="text-xl font-semibold text-dark-900 mb-2">No orders yet</h3>
      <p className="text-dark-500 mb-6 text-center max-w-sm">You haven't placed any orders yet. Find something you love today!</p>
      <Link to="/products" className="btn-primary">Start Shopping</Link>
    </div>
  );
}
