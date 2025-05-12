import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faBars } from '@fortawesome/free-solid-svg-icons';
import ChatContainer from '../../ChatContainer';

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

const ProductSection = ({ title, products, id, onProductClick, onAddToCart }) => {
  // Limit to 12 products
  const limitedProducts = products.slice(0, 12);
  
  return (
    <div id={id} className="mb-8">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">{title}</h2>
      {limitedProducts.length === 0 ? (
        <div className="text-center text-gray-600">Không có sản phẩm nào.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {limitedProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onProductClick={onProductClick}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
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

const MenuItems = [
  { href: '#home', label: 'Trang chủ' },
  { href: '#cancau', label: 'Cần câu chính hãng' },
  { href: '#docau', label: 'Đồ câu cá' },
  { href: '#phukien', label: 'Phụ kiện' },
  { href: '#moicau', label: 'Mồi câu' },
];

function Content() {
  const [products, setProducts] = useState({
    canCau: [],
    doCau: [],
    phuKien: [],
    moiCau: [],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedType, setSelectedType] = useState('all');
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get('http://localhost:3001/v1/products/get');

        if (!Array.isArray(response.data)) {
          throw new Error('Dữ liệu sản phẩm không hợp lệ!');
        }

        // Sắp xếp sản phẩm theo ngày tạo mới nhất
        const sortedProducts = [...response.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const categorizedProducts = {
          canCau: sortedProducts.filter((product) => product.type === 'cần câu'),
          doCau: sortedProducts.filter((product) => product.type === 'đồ câu'),
          phuKien: sortedProducts.filter((product) => product.type === 'phụ kiện'),
          moiCau: sortedProducts.filter((product) => product.type === 'mồi câu'),
        };

        setProducts(categorizedProducts);

        if (Object.values(categorizedProducts).every((category) => category.length === 0)) {
          setError('Không có sản phẩm nào để hiển thị.');
          toast.warn('Không có sản phẩm nào để hiển thị.');
        }
      } catch (err) {
        handleApiError(err, 'Lỗi khi lấy danh sách sản phẩm. Vui lòng thử lại!');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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

  const filterProducts = (productList) => {
    return productList.filter(product => {
      // Filter by price range
      const price = product.price;
      const minPrice = priceRange.min ? Number(priceRange.min) : 0;
      const maxPrice = priceRange.max ? Number(priceRange.max) : Infinity;
      
      if (price < minPrice || price > maxPrice) {
        return false;
      }

      // Filter by type
      if (selectedType !== 'all' && product.type !== selectedType) {
        return false;
      }

      return true;
    });
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setPriceRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
  };

  const resetFilters = () => {
    setPriceRange({ min: '', max: '' });
    setSelectedType('all');
  };

  return (
    <ChatContainer>
      <div className="flex mt-20">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="fixed top-4 left-4 z-50 bg-blue-600 text-white p-2 rounded-lg md:hidden"
          aria-label="Toggle menu"
        >
          <FontAwesomeIcon icon={faBars} size="lg" />
        </button>

        {/* Sidebar Filter */}
        <div 
          className={`fixed top-16 left-0 h-full w-64 bg-white shadow-lg z-0 transition-transform duration-300 ease-in-out transform ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 md:shadow-none`}
        >
          <div className="p-4 sm:p-6 h-full overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-semibold mb-6 sm:mb-8 text-center">Bộ lọc sản phẩm</h2>
            
            {/* Filter Section */}
            <div className="mb-8">
              {/* Price Range Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Khoảng giá (VND)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="min"
                    value={priceRange.min}
                    onChange={handlePriceChange}
                    placeholder="Từ"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    name="max"
                    value={priceRange.max}
                    onChange={handlePriceChange}
                    placeholder="Đến"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Loại sản phẩm</label>
                <select
                  value={selectedType}
                  onChange={handleTypeChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả</option>
                  <option value="cần câu">Cần câu</option>
                  <option value="đồ câu">Đồ câu</option>
                  <option value="phụ kiện">Phụ kiện</option>
                  <option value="mồi câu">Mồi câu</option>
                </select>
              </div>

              {/* Reset Button */}
              <button
                onClick={resetFilters}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 md:pl-80 overflow-y-auto bg-gray-100">
          {error && (
            <div className="text-red-500 mb-4 text-sm sm:text-base" role="alert">
              {error}
            </div>
          )}

          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <ProductSection
                title="Cần câu chính hãng"
                products={filterProducts(products.canCau)}
                id="cancau"
                onProductClick={handleProductClick}
                onAddToCart={handleAddToCart}
              />
              <ProductSection
                title="Đồ câu cá"
                products={filterProducts(products.doCau)}
                id="docau"
                onProductClick={handleProductClick}
                onAddToCart={handleAddToCart}
              />
              <ProductSection
                title="Phụ kiện"
                products={filterProducts(products.phuKien)}
                id="phukien"
                onProductClick={handleProductClick}
                onAddToCart={handleAddToCart}
              />
              <ProductSection
                title="Mồi câu"
                products={filterProducts(products.moiCau)}
                id="moicau"
                onProductClick={handleProductClick}
                onAddToCart={handleAddToCart}
              />
            </>
          )}
        </div>
      </div>
    </ChatContainer>
  );
}

export default Content;