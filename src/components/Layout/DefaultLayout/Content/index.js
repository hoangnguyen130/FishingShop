import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faBars } from '@fortawesome/free-solid-svg-icons';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ChatContainer from '../../ChatContainer';
import banner1 from '~/assets/imgs/banner-can-cau.png';
import banner2 from '~/assets/imgs/banner-phu-kien.png';
import banner3 from '~/assets/imgs/banner-moi-cau.png';

const BannerSlider = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    pauseOnHover: true,
    fade: true,
    cssEase: 'linear',
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false,
          dots: true
        }
      }
    ]
  };

  const banners = [
    {
      id: 1,
      image: banner1,
      title: 'Cần câu chính hãng',
      description: 'Khám phá bộ sưu tập cần câu chất lượng cao',
      buttonText: 'Xem ngay',
      buttonLink: '/cancau'
    },
    {
      id: 2,
      image: banner2,
      title: 'Phụ kiện câu cá',
      description: 'Đầy đủ phụ kiện cho người đam mê câu cá',
      buttonText: 'Mua ngay',
      buttonLink: '/phukien'
    },
    {
      id: 3,
      image: banner3,
      title: 'Mồi câu đặc biệt',
      description: 'Các loại mồi câu chất lượng cao',
      buttonText: 'Khám phá',
      buttonLink: '/moicau'
    }
  ];

  return (
    <div className="mb-12">
      <Slider {...settings}>
        {banners.map((banner) => (
          <div key={banner.id} className="relative">
            <div className="relative h-[500px] w-full overflow-hidden">
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40 flex items-center">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="max-w-2xl text-white">
                    <h2 className="text-4xl sm:text-5xl font-bold mb-4 animate-fade-in">
                      {banner.title}
                    </h2>
                    <p className="text-xl sm:text-2xl mb-8 text-gray-200 animate-fade-in-delay">
                      {banner.description}
                    </p>
                    <a
                      href={banner.buttonLink}
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-full transition-colors duration-300 transform hover:scale-105 animate-fade-in-delay-2"
                    >
                      {banner.buttonText}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

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

const ProductSection = ({ title, products, id, onProductClick, onAddToCart }) => {
  const navigate = useNavigate();
  // Limit to 12 products
  const limitedProducts = products.slice(0, 12);
  
  const handleViewMore = () => {
    // Convert Vietnamese text to kebab-case
    const kebabId = id
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/đ/g, 'd') // Replace đ with d
      .replace(/([a-z])([A-Z])/g, '$1-$2') // Add hyphen between camelCase
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .toLowerCase(); // Convert to lowercase
    navigate(`/${kebabId}`);
  };
  
  return (
    <div id={id} className="mb-8 relative group">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-3xl font-semibold text-gray-800">{title}</h2>
        <button
          onClick={handleViewMore}
          className="text-xl text-blue-500 opacity-0 -translate-x-1/2 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0 flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          Xem thêm
        </button>
      </div>
      {limitedProducts.length === 0 ? (
        <div className="text-center text-gray-600">Không có sản phẩm nào.</div>
      ) : (
        <>
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
          <div className="flex justify-center mt-8">
            <button
              onClick={handleViewMore}
              className="text-xl text-blue-500 hover:text-blue-600 transition-colors duration-300 flex items-center gap-2"
            >
              Xem thêm
            </button>
          </div>
        </>
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
  const [products, setProducts] = useState({});
  const [productTypes, setProductTypes] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedDiscount, setSelectedDiscount] = useState('all');
  const navigate = useNavigate();

  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  useEffect(() => {
    fetchProductTypes();
    fetchProducts();
  }, []);

  const fetchProductTypes = async () => {
    try {
      const response = await axios.get('http://localhost:3001/v1/products/types');
      setProductTypes(response.data.data);
    } catch (error) {
      console.error('Error fetching product types:', error);
      toast.error('Không thể tải danh sách loại sản phẩm');
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:3001/v1/products/get');

      if (!Array.isArray(response.data)) {
        throw new Error('Dữ liệu sản phẩm không hợp lệ!');
      }

      // Sort products: discounted items first, then by creation date
      const sortedProducts = [...response.data].sort((a, b) => {
        // First sort by discount (products with discount come first)
        if (a.discountPercentage && !b.discountPercentage) return -1;
        if (!a.discountPercentage && b.discountPercentage) return 1;
        
        // If both have discount or both don't have discount, sort by creation date
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      // Group products by type
      const groupedProducts = {};
      sortedProducts.forEach(product => {
        if (!groupedProducts[product.type]) {
          groupedProducts[product.type] = [];
        }
        groupedProducts[product.type].push(product);
      });

      setProducts(groupedProducts);

      if (Object.keys(groupedProducts).length === 0) {
        setError('Không có sản phẩm nào để hiển thị.');
        toast.warn('Không có sản phẩm nào để hiển thị.');
      }
    } catch (err) {
      handleApiError(err, 'Lỗi khi lấy danh sách sản phẩm. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

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

      // Filter by discount percentage
      if (selectedDiscount !== 'all') {
        const discount = product.discountPercentage || 0;
        switch (selectedDiscount) {
          case '10-20':
            if (discount < 10 || discount > 20) return false;
            break;
          case '20-30':
            if (discount < 20 || discount > 30) return false;
            break;
          case '30-50':
            if (discount < 30 || discount > 50) return false;
            break;
          case '50+':
            if (discount < 50) return false;
            break;
          case 'discounted':
            if (!discount) return false;
            break;
          case 'no-discount':
            if (discount) return false;
            break;
          default:
            return true;
        }
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

  const handleDiscountChange = (e) => {
    setSelectedDiscount(e.target.value);
  };

  const resetFilters = () => {
    setPriceRange({ min: '', max: '' });
    setSelectedDiscount('all');
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

              {/* Discount Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Phần trăm giảm giá</label>
                <select
                  value={selectedDiscount}
                  onChange={handleDiscountChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả sản phẩm</option>
                  <option value="discounted">Có giảm giá</option>
                  <option value="no-discount">Không giảm giá</option>
                  <option value="10-20">Giảm 10% - 20%</option>
                  <option value="20-30">Giảm 20% - 30%</option>
                  <option value="30-50">Giảm 30% - 50%</option>
                  <option value="50+">Giảm trên 50%</option>
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
              <BannerSlider />
              {productTypes.map((type) => (
                <ProductSection
                  key={type._id}
                  title={capitalizeFirstLetter(type.typeName)}
                  products={filterProducts(products[type.typeName] || [])}
                  id={type.typeName.toLowerCase().replace(/\s+/g, '')}
                  onProductClick={handleProductClick}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </ChatContainer>
  );
}

export default Content;