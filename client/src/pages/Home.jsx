import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiArrowRight, HiOutlineTruck, HiOutlineShieldCheck, HiOutlineRefresh, HiOutlineCreditCard } from 'react-icons/hi';
import api from '../utils/api';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import { getImageUrl } from '../utils/helpers';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [featRes, catRes, latestRes] = await Promise.all([
        api.get('/products?limit=4&sort=newest'),
        api.get('/categories'),
        api.get('/products?limit=8&sort=newest'),
      ]);
      setFeatured(featRes.data.products.filter(p => p.is_featured));
      setCategories(catRes.data.categories);
      setLatest(latestRes.data.products);
    } catch (err) {
      console.error('Failed to load home data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-800 via-primary-900 to-dark-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 -right-20 w-96 h-96 bg-accent-400 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary-600 rounded-full blur-3xl" />
        </div>
        <div className="page-container relative z-10 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <span className="inline-block bg-accent-400/20 text-accent-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider">
                Premium Collection 2026
              </span>
              <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
                Good nature &
                <span className="block text-accent-400">Science</span>
              </h1>
              <p className="text-lg text-dark-300 mb-8 max-w-lg leading-relaxed">
                Welcome to Aridos onn, where comfort meets style in our premium Hawai Chappals. With years of experience in the industry, we have perfected the art of creating chappals that not only provide excellent support and cushioning but also reflect the vibrant and laid-back Hawaiian lifestyle.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products" className="btn-accent !px-8 !py-4 text-base inline-flex items-center gap-2 group">
                  Grab in <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/products?category=summer-vibe" className="border-2 border-white/30 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all inline-flex items-center gap-2">
                  View Slippers
                </Link>
              </div>
            </div>
            <div className="hidden md:block relative">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-400/30 to-primary-800/30 rounded-full blur-3xl" />
                <img
                  src="https://lh3.googleusercontent.com/p/AF1QipNhysxbl39UfOupgnNxaApOegm1Itz00Xl7_VO3=s1360-w1360-h1020-rw"
                  alt="Premium Footwear"
                  className="relative z-10 w-full h-full object-cover rounded-3xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="bg-dark-50 border-b border-dark-100">
        <div className="page-container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { icon: HiOutlineTruck, title: 'Free Shipping', desc: 'On orders above ₹799' },
              { icon: HiOutlineShieldCheck, title: 'Genuine Products', desc: '100% authentic guaranteed' },
              { icon: HiOutlineRefresh, title: 'Easy Returns', desc: '7-day return policy' },
              { icon: HiOutlineCreditCard, title: 'Secure Payment', desc: 'COD & online options' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-800/10 rounded-xl flex items-center justify-center shrink-0">
                  <f.icon className="w-6 h-6 text-primary-800" />
                </div>
                <div>
                  <h4 className="font-semibold text-dark-900 text-sm">{f.title}</h4>
                  <p className="text-xs text-dark-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="page-container py-16">
        <div className="text-center mb-12">
          <h2 className="section-title mb-3">Shop by Category</h2>
          <p className="text-dark-500 max-w-md mx-auto">Find the perfect pair from our curated categories</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className="group relative h-72 rounded-2xl overflow-hidden"
              id={`category-${cat.slug}`}
            >
              <img
                src={getImageUrl(cat.image_url)}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-dark-900/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-bold text-white mb-1">{cat.name}</h3>
                <p className="text-dark-300 text-sm mb-3">{cat.description}</p>
                <span className="inline-flex items-center gap-1 text-accent-400 text-sm font-semibold group-hover:gap-2 transition-all">
                  Explore Collection <HiArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="bg-dark-50 py-16">
          <div className="page-container">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="section-title mb-2">Featured Products</h2>
                <p className="text-dark-500">Handpicked selections just for you</p>
              </div>
              <Link to="/products" className="hidden md:inline-flex items-center gap-1 text-primary-800 font-semibold hover:gap-2 transition-all">
                View All <HiArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {loading ? (
                Array(4).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
              ) : (
                featured.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* Promo Banner */}
      <section className="page-container py-16">
        <div className="relative bg-gradient-to-r from-primary-800 to-primary-900 rounded-3xl overflow-hidden p-8 md:p-16">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-400/10 rounded-full blur-3xl" />
          <div className="relative z-10 max-w-lg">
            <span className="text-accent-400 text-sm font-semibold uppercase tracking-wider">Limited Offer</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-3 mb-4">Get 20% Off Your First Order</h2>
            <p className="text-dark-300 mb-6">Use code <span className="text-accent-400 font-bold">WELCOME20</span> at checkout. Valid on orders above ₹799.</p>
            <Link to="/products" className="btn-accent inline-flex items-center gap-2">
              Dive in <HiArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Products */}
      <section className="page-container pb-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="section-title mb-2">New Arrivals</h2>
            <p className="text-dark-500">The latest additions to our collection</p>
          </div>
          <Link to="/products?sort=newest" className="hidden md:inline-flex items-center gap-1 text-primary-800 font-semibold hover:gap-2 transition-all">
            View All <HiArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {loading ? (
            Array(8).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
          ) : (
            latest.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
