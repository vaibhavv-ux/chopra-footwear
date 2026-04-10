import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import { NoResults } from '../components/EmptyStates';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) searchProducts();
  }, [query]);

  const searchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/products?search=${encodeURIComponent(query)}&limit=24`);
      setProducts(data.products);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container py-8 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-bold text-dark-900 mb-2">
        Search Results
      </h1>
      <p className="text-dark-500 mb-8">
        {loading ? 'Searching...' : `${products.length} results for "${query}"`}
      </p>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {Array(8).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <NoResults query={query} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
