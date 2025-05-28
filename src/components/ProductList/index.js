import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';


const ProductCard = ({ product, onProductClick, onAddToCart }) => {
  const getImageSrc = (images) => {
    if (Array.isArray(images) && images.length > 0) return images[0];
    if (typeof images === 'string') return images;
    return 'https://via.placeholder.com/150';
  };

  const displayPrice = () => {
    if (product.discountPercentage) {
      return (
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-red-500">
              {product.discountedPrice.toLocaleString()} VND
            </span>
            <span className="text-sm text-gray-500 line-through">
              {product.price.toLocaleString()} VND
            </span>
          </div>
          <span className="text-sm font-bold text-white bg-red-500 px-2 py-1 rounded">
            -{product.discountPercentage}%
          </span>
        </div>
      );
    }
    return (
      <p className="text-xl font-bold text-blue-500">
        {product.price.toLocaleString()} VND
      </p>
    );
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
        {displayPrice()}
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

const ProductList = ({ category, title }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const handleApiError = (err, defaultMessage, navigateToSignIn = false) => {
    let errorMessage = defaultMessage;
    if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    } else if (err.response?.status === 401) {
      errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!';
      sessionStorage.removeItem('token');
      if (navigateToSignIn) navigate('/sign-in');
    } else if (err.response?.status === 404) {
      errorMessage = 'Không tìm thấy tài nguyên!';
    } else if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
      errorMessage = 'Không kết nối được tới server. Vui lòng kiểm tra backend!';
    }
    setError(errorMessage);
    toast.error(errorMessage);
    return errorMessage;
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:3001/v1/products/get');

      if (!Array.isArray(response.data)) {
        throw new Error('Dữ liệu sản phẩm không hợp lệ!');
      }

      const filteredProducts = response.data.filter(
        product => product.type.toLowerCase() === category.toLowerCase()
      );

      setProducts(filteredProducts);

      if (filteredProducts.length === 0) {
        setError('Không có sản phẩm nào để hiển thị.');
        toast.warn('Không có sản phẩm nào để hiển thị.');
      }
    } catch (err) {
      handleApiError(err, 'Lỗi khi lấy danh sách sản phẩm. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (id) => {
    navigate(`/products/${id}`);
  };

  const handleAddToCart = async (productId) => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng!');
      navigate('/sign-in');
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
      handleApiError(err, 'Lỗi khi thêm vào giỏ hàng. Vui lòng thử lại!', true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">{title}</h1>
      
      {error && (
        <div className="text-red-500 mb-4 text-sm sm:text-base" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
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
  );
};

export default ProductList; 