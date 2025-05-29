import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faShoppingCart, 
  faTrash, 
  faMinus, 
  faPlus, 
  faExclamationCircle,
  faCreditCard,
  faBox,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

function Cart() {
  const [cart, setCart] = useState([]);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      setError('Vui lòng đăng nhập để xem giỏ hàng');
      toast.error('Vui lòng đăng nhập để xem giỏ hàng');
      setTimeout(() => navigate('/sign-in'), 2000);
      return;
    }
    setIsAuthenticated(true);

    const fetchCart = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:3001/v1/products/cart', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCart(response.data.items || []);
        console.log(response.data.items);
      } catch (err) {
        let errorMessage = 'Lỗi khi lấy giỏ hàng';
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
          if (err.response.data.message.includes('userId không hợp lệ')) {
            errorMessage = 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại!';
            sessionStorage.removeItem('token');
            navigate('/sign-in');
          }
        } else if (err.response?.status === 401) {
          errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!';
          sessionStorage.removeItem('token');
          navigate('/sign-in');
        } else if (err.response?.status === 400) {
          errorMessage = 'Dữ liệu giỏ hàng không hợp lệ. Vui lòng kiểm tra lại!';
        } else if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
          errorMessage = 'Không kết nối được tới server. Vui lòng kiểm tra backend.';
        }
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [navigate]);

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      toast.error('Số lượng phải lớn hơn hoặc bằng 1');
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      await axios.put(
        'http://localhost:3001/v1/products/cart/update',
        { productId: productId.trim(), quantity: newQuantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success('Đã cập nhật số lượng sản phẩm');

      const cartResponse = await axios.get('http://localhost:3001/v1/products/cart', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCart(cartResponse.data.items);
    } catch (err) {
      let errorMessage = 'Lỗi khi cập nhật số lượng';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!';
        sessionStorage.removeItem('token');
        navigate('/sign-in');
      }
      toast.error(errorMessage);
    }
  };

  const handleRemoveItem = async (productId) => {
    setItemToDelete(productId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const token = sessionStorage.getItem('token');
      await axios.delete('http://localhost:3001/v1/products/cart/remove', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { productId: itemToDelete.trim() },
      });
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');

      const cartResponse = await axios.get('http://localhost:3001/v1/products/cart', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCart(cartResponse.data.items);
      console.log(cartResponse.data.items);
    } catch (err) {
      let errorMessage = 'Lỗi khi xóa sản phẩm';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!';
        sessionStorage.removeItem('token');
        navigate('/sign-in');
      }
      toast.error(errorMessage);
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center text-red-500 mb-4">
              <FontAwesomeIcon icon={faExclamationCircle} className="text-4xl" />
            </div>
            <div className="text-red-500 text-center">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalAmount = cart.reduce((sum, item) => {
    if (!item) return sum;
    return sum + (item.discountedPrice || item.originalPrice) * (item.quantity || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handleBack}
                className="text-blue-600 hover:text-blue-700 flex items-center"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                Quay lại
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Giỏ hàng</h1>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {cart.length === 0 ? (
              <div className="text-center py-12">
                <FontAwesomeIcon icon={faShoppingCart} className="text-6xl text-gray-400 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-600 mb-2">Giỏ hàng trống</h2>
                <p className="text-gray-500 mb-6">Hãy thêm sản phẩm vào giỏ hàng của bạn</p>
                <button
                  onClick={handleBack}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300"
                >
                  Tiếp tục mua sắm
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {cart.map((item) => (
                  <div key={item.productId} className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
                    <div className="w-24 h-24 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.productName}</h3>
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-gray-600">Giá:</span>
                        {item.discountPercentage > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 line-through">
                              {item.originalPrice?.toLocaleString('vi-VN')} VND
                            </span>
                            <span className="text-red-600 font-semibold">
                              {item.discountedPrice?.toLocaleString('vi-VN')} VND
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              -{item.discountPercentage}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-blue-600 font-semibold">
                            {item.originalPrice?.toLocaleString('vi-VN')} VND
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-600">Số lượng:</span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className={`p-1 rounded-lg ${
                              item.quantity <= 1
                                ? 'bg-gray-200 cursor-not-allowed'
                                : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                          >
                            <FontAwesomeIcon icon={faMinus} className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateQuantity(item.productId, Number(e.target.value))}
                            className="w-16 text-center p-1 border border-gray-300 rounded-lg"
                          />
                          <button
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                            className="p-1 bg-gray-200 hover:bg-gray-300 rounded-lg"
                          >
                            <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-lg font-semibold text-gray-900">
                        {item.discountPercentage > 0 ? (
                          <div className="flex flex-col items-end">
                            <span className="text-red-600">
                              {(item.discountedPrice * (item.quantity || 0)).toLocaleString('vi-VN')} VND
                            </span>
                            <span className="text-sm text-gray-400 line-through">
                              {(item.originalPrice * (item.quantity || 0)).toLocaleString('vi-VN')} VND
                            </span>
                          </div>
                        ) : (
                          <span>
                            {(item.originalPrice * (item.quantity || 0)).toLocaleString('vi-VN')} VND
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        className="text-red-600 hover:text-red-700 p-2"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="border-t border-gray-200 pt-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="text-xl font-semibold text-gray-900">Tổng cộng:</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {typeof totalAmount === 'number' ? totalAmount.toLocaleString('vi-VN') : '0'} VND
                    </div>
                  </div>
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={handleBack}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-300"
                    >
                      Tiếp tục mua sắm
                    </button>
                    <button
                      onClick={handleCheckout}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 flex items-center"
                    >
                      <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
                      Thanh toán
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Xác nhận xóa</h3>
              <button
                onClick={cancelDelete}
                className="text-gray-400 hover:text-gray-500"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-600">
                Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?
              </p>
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-300"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300 flex items-center"
              >
                <FontAwesomeIcon icon={faTrash} className="mr-2" />
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;