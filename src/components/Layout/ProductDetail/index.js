import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faShoppingCart, faMinus, faPlus, faExclamationCircle, faBox, faCartShopping } from '@fortawesome/free-solid-svg-icons';

function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`http://localhost:3001/v1/products/get/${id}`);
        setProduct(response.data.product);
        console.log(response.data.product);
      } catch (err) {
        let errorMessage = 'Lỗi khi lấy chi tiết sản phẩm. Vui lòng thử lại!';
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response?.status === 401) {
          errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!';
          sessionStorage.removeItem('token');
          navigate('/sign-in');
        } else if (err.response?.status === 404) {
          errorMessage = 'Không tìm thấy sản phẩm. Vui lòng thử sản phẩm khác!';
        } else if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
          errorMessage = 'Không kết nối được tới server. Vui lòng kiểm tra backend!';
        }
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleQuantityChange = (e) => {
    const value = Number(e.target.value);
    if (value >= 1 && value <= product.quantity) {
      setCartQuantity(value);
    } else if (value > product.quantity) {
      toast.error(`Chỉ còn ${product.quantity} sản phẩm trong kho!`);
      setCartQuantity(product.quantity);
    } else {
      toast.error('Số lượng phải lớn hơn hoặc bằng 1!');
      setCartQuantity(1);
    }
  };

  const handleQuantityIncrement = () => {
    if (cartQuantity < product.quantity) {
      setCartQuantity(prev => prev + 1);
    } else {
      toast.error(`Chỉ còn ${product.quantity} sản phẩm trong kho!`);
    }
  };

  const handleQuantityDecrement = () => {
    if (cartQuantity > 1) {
      setCartQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!product) {
      toast.error('Không có sản phẩm để thêm!');
      return;
    }

    if (product.quantity === 0) {
      toast.error('Sản phẩm đã hết hàng!');
      return;
    }

    const token = sessionStorage.getItem('token');
    if (!token) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng!');
      navigate('/sign-in');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:3001/v1/products/cart/add',
        {
          productId: product.productId,
          quantity: cartQuantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success('Đã thêm sản phẩm vào giỏ hàng!');
    } catch (err) {
      let errorMessage = 'Lỗi khi thêm vào giỏ hàng. Vui lòng thử lại!';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!';
        sessionStorage.removeItem('token');
        navigate('/sign-in');
      } else if (err.response?.status === 404) {
        errorMessage = 'Sản phẩm không tồn tại!';
      } else if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
        errorMessage = 'Không kết nối được tới server. Vui lòng kiểm tra backend!';
      }
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
          <div className="flex items-center justify-center text-red-500 mb-4">
            <FontAwesomeIcon icon={faExclamationCircle} className="text-4xl" />
          </div>
          <div className="text-red-500 text-center mb-6" role="alert">{error}</div>
          <div className="text-center">
            <button
              onClick={() => navigate('/')}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-300 flex items-center justify-center mx-auto"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
          <div className="text-gray-600 text-center mb-6">Không tìm thấy sản phẩm.</div>
          <div className="text-center">
            <button
              onClick={() => navigate('/')}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-300 flex items-center justify-center mx-auto"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigate('/')}
                className="text-blue-600 hover:text-blue-700 flex items-center"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                Quay lại
              </button>
              
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Product Image */}
              <div className="relative">
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100">
                  {product.image && !imageError ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-gray-400">Không có ảnh</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="flex flex-col">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.productName}</h1>
                
                <div className="flex items-center gap-4 mb-4">
                  {product.discountPercentage > 0 && product.discountedPrice ? (
                    <>
                      <span className="text-3xl font-bold text-red-600">
                        {product.discountedPrice.toLocaleString()} VND
                      </span>
                      <span className="text-xl text-gray-500 line-through">
                        {product.originalPrice.toLocaleString()} VND
                      </span>
                      <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-sm font-semibold">
                        -{product.discountPercentage}%
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-gray-900">
                      {product.originalPrice?.toLocaleString() || product.price?.toLocaleString() || '0'} VND
                    </span>
                  )}
                </div>

                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Mô tả sản phẩm</h2>
                  <p className="text-gray-600">{product.description || 'Không có mô tả.'}</p>
                </div>

                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Loại sản phẩm</h2>
                  <p className="text-gray-600">{product.type || 'Chưa phân loại'}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Số lượng trong kho</h2>
                    <div className="flex items-center text-gray-600">
                      <FontAwesomeIcon icon={faBox} className="mr-2" />
                      <span className={product.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                        {product.quantity > 0 ? `${product.quantity} sản phẩm` : 'Hết hàng'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handleQuantityDecrement}
                      disabled={cartQuantity <= 1}
                      className={`p-2 border border-gray-300 rounded-lg ${
                        cartQuantity <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
                      }`}
                    >
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.quantity}
                      value={cartQuantity}
                      onChange={handleQuantityChange}
                      className="w-20 text-center border border-gray-300 rounded-lg py-2"
                    />
                    <button
                      onClick={handleQuantityIncrement}
                      disabled={cartQuantity >= product.quantity}
                      className={`p-2 border border-gray-300 rounded-lg ${
                        cartQuantity >= product.quantity ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
                      }`}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.quantity === 0}
                    className={`flex-1 py-3 px-4 rounded-lg text-white font-semibold flex items-center justify-center ${
                      product.quantity === 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
                    {product.quantity === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
                  </button>
                  <button
                    onClick={() => navigate('/cart')}
                    className="flex-1 py-3 px-4 rounded-lg text-blue-600 font-semibold flex items-center justify-center border-2 border-blue-600 hover:bg-blue-50"
                  >
                    <FontAwesomeIcon icon={faCartShopping} className="mr-2" />
                    Xem giỏ hàng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;