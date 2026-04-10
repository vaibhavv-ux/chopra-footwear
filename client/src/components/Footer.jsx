import { Link } from 'react-router-dom';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi';

export default function Footer() {
  return (
    <footer className="bg-dark-900 text-dark-300 mt-20">
      <div className="page-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CFI</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg leading-tight">Chopra Footwear</h3>
                <p className="text-[10px] font-medium text-accent-400 tracking-[0.2em] uppercase -mt-1">Industries</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-dark-400">
              Premium footwear crafted with passion and precision. From classic designs to modern innovations, we bring you the finest collection of shoes.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link to="/products" className="text-sm hover:text-accent-400 transition-colors">All Products</Link></li>
              <li><Link to="/products?category=summer-vibe" className="text-sm hover:text-accent-400 transition-colors">Summer Vibe</Link></li>
              <li><Link to="/products?category=casuals" className="text-sm hover:text-accent-400 transition-colors">Casuals</Link></li>
            </ul>
          </div>

          {/* Customer */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Customer</h4>
            <ul className="space-y-3">
              <li><Link to="/orders" className="text-sm hover:text-accent-400 transition-colors">My Orders</Link></li>
              <li><Link to="/wishlist" className="text-sm hover:text-accent-400 transition-colors">Wishlist</Link></li>
              <li><Link to="/cart" className="text-sm hover:text-accent-400 transition-colors">Shopping Cart</Link></li>
              <li><Link to="/profile" className="text-sm hover:text-accent-400 transition-colors">My Account</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <HiOutlineMail className="w-4 h-4 text-accent-400 shrink-0" />
                choprafootwearindustries.com
              </li>
              <li className="flex items-center gap-2 text-sm">
                <HiOutlinePhone className="w-4 h-4 text-accent-400 shrink-0" />
                +91 7210120001
              </li>
              <li className="flex items-start gap-2 text-sm">
                <HiOutlineLocationMarker className="w-4 h-4 text-accent-400 shrink-0 mt-0.5" />
                Village Chamiara, Jalandhar, Punjab, India-144002
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-dark-800">
        <div className="page-container py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-dark-500">© {new Date().getFullYear()} Chopra Footwear Industries. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-dark-500">
            <span className="hover:text-accent-400 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-accent-400 cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-accent-400 cursor-pointer transition-colors">Shipping Info</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
