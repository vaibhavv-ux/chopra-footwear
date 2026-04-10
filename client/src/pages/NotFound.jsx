import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 animate-fade-in">
      <div className="text-center">
        <h1 className="text-8xl md:text-9xl font-black text-gradient mb-4">404</h1>
        <h2 className="text-2xl md:text-3xl font-bold text-dark-900 mb-3">Page Not Found</h2>
        <p className="text-dark-500 mb-8 max-w-md mx-auto">
          Oops! The page you're looking for seems to have walked away. Let's get you back on track.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-primary">Go Home</Link>
          <Link to="/products" className="btn-secondary">Browse Products</Link>
        </div>
      </div>
    </div>
  );
}
