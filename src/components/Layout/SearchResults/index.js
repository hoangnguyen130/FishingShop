import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import ChatContainer from '../ChatContainer';

const ProductCard = ({ product, onProductClick, onAddToCart }) => {
  const getImageSrc = (images) => {
    if (Array.isArray(images) && images.length > 0) return images[0];
    if (typeof images === 'string') return images;
    return 'https://via.placeholder.com/150';
  };

  return (
    <div
      className="bg-white p-6 rounded-lg shadow-xl hover:scale-105 transform transition duration-300 hover:shadow-2xl cursor-pointer"
      role="article"
      aria-labelledby={`product-${product._id}`}
    >
      <img
        src={getImageSrc(product.images)}
        alt={product.productName}
        className="w-full h-48 object-cover rounded-md mb-4"
        onClick={() => onProductClick(product._id)}
        onError={(e) => (e.target.src = 'https://via.placeholder.com/150')}
      />
      <h3
        id={`product-${product._id}`}
        className="min-h-14 text-xl font-semibold text-gray-800 cursor-pointer hover:text-blue-500"
        onClick={() => onProductClick(product._id)}
      >
        {product.productName}
      </h3>
      <div className="flex items-center justify-between">
        <p className="text-xl font-bold text-blue-500">{product.price.toLocaleString()} VND</p>
        <button
          onClick={() => onAddToCart(product._id)}
          className="text-black hover:text-red-600 transition duration-300"
          title="Thêm vào giỏ hàng"
          aria-label={`Thêm ${product.productName} vào giỏ hàng`}
        >
          <FontAwesomeIcon icon={faShoppingCart} size="xl" />
        </button>
      </div>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="text-center text-gray-600">
    <svg
      className="animate-spin h-8 w-8 mx-auto text-blue-500"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
      ></path>
    </svg>
    <p className="mt-2 text-sm sm:text-base">Đang tải dữ liệu...</p>
  </div>
);

function SearchResults() {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q');

  useEffect(() => {
    if (searchQuery) {
      handleSearch(searchQuery);
    }
  }, [searchQuery]);

  const handleSearch = async (query) => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/v1/products/search', {
        params: { q: query }
      });
      setSearchResults(response.data.data || []);
      setError('');
    } catch (err) {
      handleApiError(err, 'Lỗi khi tìm kiếm sản phẩm. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleApiError = (err, defaultMessage) => {
    let errorMessage = defaultMessage;
    if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    }
    setError(errorMessage);
    toast.error(errorMessage);
  };

  const handleProductClick = (id) => {
    window.location.href = `/products/${id}`;
  };

  const handleAddToCart = async (productId) => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng!');
      window.location.href = '/sign-in';
      return;
    }

    try {
      await axios.post(
        'http://localhost:3001/v1/products/cart/add',
        { productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Đã thêm sản phẩm vào giỏ hàng!');
    } catch (err) {
      handleApiError(err, 'Lỗi khi thêm vào giỏ hàng. Vui lòng thử lại!');
    }
  };

  return (
    <ChatContainer>
      <div className="flex mt-20">
        <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto bg-gray-100">
          {error && (
            <div className="text-red-500 mb-4 text-sm sm:text-base" role="alert">
              {error}
            </div>
          )}

          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="mb-8">
              <h2 className="text-3xl font-semibold text-gray-800 mb-6">
                Kết quả tìm kiếm cho "{searchQuery}"
              </h2>
              {searchResults.length === 0 ? (
                <div className="text-center text-gray-600">Không tìm thấy sản phẩm nào.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {searchResults.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      onProductClick={handleProductClick}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ChatContainer>
  );
}

export default SearchResults; 