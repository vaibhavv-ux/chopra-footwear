import { HiStar, HiOutlineStar } from 'react-icons/hi';

export default function StarRating({ rating, setRating, size = 'md', readonly = false }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => setRating && setRating(star)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
        >
          {star <= rating ? (
            <HiStar className={`${sizes[size]} text-accent-400`} />
          ) : (
            <HiOutlineStar className={`${sizes[size]} text-dark-300`} />
          )}
        </button>
      ))}
    </div>
  );
}
