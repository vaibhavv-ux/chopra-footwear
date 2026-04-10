export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const getImageUrl = (url) => {
  if (!url) return 'https://picsum.photos/seed/placeholder/400/400';
  if (url.startsWith('http')) return url;
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${API_URL}${url}`;
};

export const calculateDiscount = (price, discountPrice) => {
  if (!discountPrice) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
};

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};
