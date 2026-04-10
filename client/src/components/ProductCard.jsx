import { Link } from 'react-router-dom';
import { HiOutlineHeart, HiHeart, HiOutlineStar, HiStar } from 'react-icons/hi';
import { formatPrice, getImageUrl, calculateDiscount } from '../utils/helpers';

export default function ProductCard({ product, onWishlistToggle, isWishlisted }) {
  const discount = calculateDiscount(product.price, product.discount_price);

  return (
    <div className="card group overflow-hidden animate-fade-in" id={`product-card-${product.id}`}>
      {/* Image */}
      <Link to={`/products/${product.id}`} className="block relative overflow-hidden aspect-square bg-dark-50">
        <img
          src={getImageUrl(product.primary_image || product.image)}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-primary-800 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            -{discount}%
          </span>
        )}
        {product.is_featured === 1 && (
          <span className="absolute top-3 right-3 bg-accent-400 text-dark-900 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
            Featured
          </span>
        )}
      </Link>

      {/* Details */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <Link to={`/products/${product.id}`} className="flex-1">
            <p className="text-xs text-dark-500 uppercase tracking-wider mb-1">{product.brand || product.category_name}</p>
            <h3 className="font-semibold text-dark-900 text-sm leading-tight group-hover:text-primary-800 transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>
          {onWishlistToggle && (
            <button
              onClick={(e) => { e.preventDefault(); onWishlistToggle(product.id); }}
              className="p-1.5 rounded-full hover:bg-dark-50 transition-colors shrink-0"
              aria-label="Toggle wishlist"
            >
              {isWishlisted ? (
                <HiHeart className="w-5 h-5 text-red-500" />
              ) : (
                <HiOutlineHeart className="w-5 h-5 text-dark-400 hover:text-red-500 transition-colors" />
              )}
            </button>
          )}
        </div>

        {/* Rating */}
        {product.avg_rating && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                star <= Math.round(product.avg_rating) ? (
                  <HiStar key={star} className="w-3.5 h-3.5 text-accent-400" />
                ) : (
                  <HiOutlineStar key={star} className="w-3.5 h-3.5 text-dark-300" />
                )
              ))}
            </div>
            <span className="text-xs text-dark-500">({product.review_count || 0})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-dark-900">
            {formatPrice(product.discount_price || product.price)}
          </span>
          {product.discount_price && (
            <span className="text-sm text-dark-400 line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Skeleton loader
export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-square skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-16 skeleton" />
        <div className="h-4 w-full skeleton" />
        <div className="h-3 w-20 skeleton" />
        <div className="h-5 w-24 skeleton" />
      </div>
    </div>
  );
}
