import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HiOutlineAdjustments, HiOutlineX } from 'react-icons/hi';
import api from '../utils/api';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import { NoResults } from '../components/EmptyStates';

const SIZES = ['6', '7', '8', '9', '10', '11'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const size = searchParams.get('size') || '';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [category, sort, minPrice, maxPrice, size, page]);

  const loadCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data.categories);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (sort) params.set('sort', sort);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (size) params.set('size', size);
      params.set('page', page);
      params.set('limit', 12);

      const { data } = await api.get(`/products?${params.toString()}`);
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const activeFilterCount = [category, minPrice, maxPrice, size].filter(Boolean).length;

  return (
    <div className="page-container py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-dark-900">
            {category ? categories.find(c => c.slug === category)?.name || 'Products' : 'All Products'}
          </h1>
          {!loading && <p className="text-dark-500 text-sm mt-1">{pagination.total || 0} products found</p>}
        </div>
        <div className="flex items-center gap-3">
          {/* Sort dropdown - desktop */}
          <select
            id="sort-select"
            value={sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="hidden md:block input-field !w-auto !py-2 text-sm"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Filter toggle - mobile */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-2 px-4 py-2 bg-dark-50 rounded-lg text-sm font-medium"
          >
            <HiOutlineAdjustments className="w-5 h-5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-primary-800 text-white rounded-full text-xs flex items-center justify-center">{activeFilterCount}</span>
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside className={`${showFilters ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto' : 'hidden'} md:block md:static md:w-64 shrink-0`}>
          {showFilters && (
            <div className="flex items-center justify-between mb-6 md:hidden">
              <h2 className="text-lg font-bold">Filters</h2>
              <button onClick={() => setShowFilters(false)}>
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>
          )}

          <div className="space-y-6">
            {/* Categories */}
            <div>
              <h3 className="font-semibold text-dark-900 mb-3 text-sm uppercase tracking-wider">Category</h3>
              <div className="space-y-2">
                <button
                  onClick={() => updateFilter('category', '')}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!category ? 'bg-primary-800 text-white' : 'hover:bg-dark-50 text-dark-700'}`}
                >
                  All Categories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => updateFilter('category', cat.slug)}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${category === cat.slug ? 'bg-primary-800 text-white' : 'hover:bg-dark-50 text-dark-700'}`}
                  >
                    {cat.name} <span className="text-xs opacity-60">({cat.product_count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price range */}
            <div>
              <h3 className="font-semibold text-dark-900 mb-3 text-sm uppercase tracking-wider">Price Range</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                  className="input-field !py-2 text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  className="input-field !py-2 text-sm"
                />
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h3 className="font-semibold text-dark-900 mb-3 text-sm uppercase tracking-wider">Size</h3>
              <div className="flex flex-wrap gap-2">
                {SIZES.map(s => (
                  <button
                    key={s}
                    onClick={() => updateFilter('size', size === s ? '' : s)}
                    className={`w-12 h-10 rounded-lg text-sm font-medium transition-all ${size === s ? 'bg-primary-800 text-white' : 'bg-dark-50 text-dark-700 hover:bg-dark-100'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort - mobile */}
            <div className="md:hidden">
              <h3 className="font-semibold text-dark-900 mb-3 text-sm uppercase tracking-wider">Sort By</h3>
              <select
                value={sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="input-field !py-2 text-sm"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-primary-800 text-sm font-medium hover:underline">
                Clear All Filters
              </button>
            )}

            {showFilters && (
              <button onClick={() => setShowFilters(false)} className="btn-primary w-full md:hidden">
                Show Results
              </button>
            )}
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {Array(6).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <NoResults />
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => updateFilter('page', p.toString())}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${p === page ? 'bg-primary-800 text-white' : 'bg-dark-50 text-dark-700 hover:bg-dark-100'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
