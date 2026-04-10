import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineShoppingBag, HiOutlineHeart, HiOutlineUser, HiOutlineSearch, HiOutlineMenu, HiOutlineX, HiOutlineLogout, HiOutlineChevronDown } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setMobileMenu(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserMenu(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-dark-100/50">
      <div className="page-container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" id="navbar-logo">
            <div className="w-10 h-10 bg-primary-800 rounded-lg flex items-center justify-center group-hover:bg-primary-900 transition-colors">
              <span className="text-white font-bold text-sm">CFI</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-dark-900 leading-tight">Chopra Footwear</h1>
              <p className="text-[10px] font-medium text-accent-400 tracking-[0.2em] uppercase -mt-1">Industries</p>
            </div>
          </Link>

          {/* Search bar - desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-5 h-5" />
              <input
                id="search-input"
                type="text"
                placeholder="Search for shoes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-dark-50 border border-dark-200 rounded-full text-sm focus:outline-none focus:border-primary-800 focus:ring-2 focus:ring-primary-800/20 transition-all"
              />
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {user && (
              <Link to="/wishlist" className="hidden md:flex p-2 rounded-full hover:bg-dark-100 transition-colors relative" id="navbar-wishlist">
                <HiOutlineHeart className="w-6 h-6 text-dark-700" />
              </Link>
            )}

            <Link to="/cart" className="p-2 rounded-full hover:bg-dark-100 transition-colors relative" id="navbar-cart">
              <HiOutlineShoppingBag className="w-6 h-6 text-dark-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-800 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  id="user-menu-btn"
                  onClick={() => setUserMenu(!userMenu)}
                  className="hidden md:flex items-center gap-2 p-2 rounded-full hover:bg-dark-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-800 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">{user.name?.[0]?.toUpperCase()}</span>
                  </div>
                  <HiOutlineChevronDown className={`w-4 h-4 text-dark-500 transition-transform ${userMenu ? 'rotate-180' : ''}`} />
                </button>

                {userMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-dark-100 py-2 animate-slide-down">
                    <div className="px-4 py-2 border-b border-dark-100">
                      <p className="font-semibold text-dark-900 text-sm">{user.name}</p>
                      <p className="text-xs text-dark-500">{user.email}</p>
                    </div>
                    <Link to="/profile" onClick={() => setUserMenu(false)} className="block px-4 py-2.5 text-sm text-dark-700 hover:bg-dark-50 transition-colors">My Profile</Link>
                    <Link to="/orders" onClick={() => setUserMenu(false)} className="block px-4 py-2.5 text-sm text-dark-700 hover:bg-dark-50 transition-colors">My Orders</Link>
                    <Link to="/wishlist" onClick={() => setUserMenu(false)} className="block px-4 py-2.5 text-sm text-dark-700 hover:bg-dark-50 transition-colors">Wishlist</Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setUserMenu(false)} className="block px-4 py-2.5 text-sm text-accent-400 font-medium hover:bg-dark-50 transition-colors">Admin Panel</Link>
                    )}
                    <hr className="my-1 border-dark-100" />
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2">
                      <HiOutlineLogout className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="hidden md:flex btn-primary !py-2 !px-4 text-sm" id="navbar-login">
                Sign In
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenu(!mobileMenu)}
              className="md:hidden p-2 rounded-full hover:bg-dark-100 transition-colors"
            >
              {mobileMenu ? <HiOutlineX className="w-6 h-6" /> : <HiOutlineMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="md:hidden border-t border-dark-100 py-4 animate-slide-down">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for shoes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-dark-50 border border-dark-200 rounded-full text-sm focus:outline-none focus:border-primary-800"
                />
              </div>
            </form>
            <div className="flex flex-col gap-1">
              <Link to="/products" onClick={() => setMobileMenu(false)} className="px-4 py-3 text-dark-700 hover:bg-dark-50 rounded-lg transition-colors font-medium">All Products</Link>
              <Link to="/products?category=summer-vibe" onClick={() => setMobileMenu(false)} className="px-4 py-3 text-dark-700 hover:bg-dark-50 rounded-lg transition-colors">Summer Vibe</Link>
              <Link to="/products?category=casuals" onClick={() => setMobileMenu(false)} className="px-4 py-3 text-dark-700 hover:bg-dark-50 rounded-lg transition-colors">Casuals</Link>
              {user ? (
                <>
                  <hr className="my-2 border-dark-100" />
                  <Link to="/profile" onClick={() => setMobileMenu(false)} className="px-4 py-3 text-dark-700 hover:bg-dark-50 rounded-lg transition-colors">Profile</Link>
                  <Link to="/orders" onClick={() => setMobileMenu(false)} className="px-4 py-3 text-dark-700 hover:bg-dark-50 rounded-lg transition-colors">Orders</Link>
                  <Link to="/wishlist" onClick={() => setMobileMenu(false)} className="px-4 py-3 text-dark-700 hover:bg-dark-50 rounded-lg transition-colors">Wishlist</Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setMobileMenu(false)} className="px-4 py-3 text-accent-400 font-medium hover:bg-dark-50 rounded-lg transition-colors">Admin Panel</Link>
                  )}
                  <button onClick={() => { handleLogout(); setMobileMenu(false); }} className="text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors">Logout</button>
                </>
              ) : (
                <>
                  <hr className="my-2 border-dark-100" />
                  <Link to="/login" onClick={() => setMobileMenu(false)} className="px-4 py-3 text-primary-800 font-semibold hover:bg-primary-50 rounded-lg transition-colors">Sign In</Link>
                  <Link to="/register" onClick={() => setMobileMenu(false)} className="px-4 py-3 text-dark-700 hover:bg-dark-50 rounded-lg transition-colors">Create Account</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
