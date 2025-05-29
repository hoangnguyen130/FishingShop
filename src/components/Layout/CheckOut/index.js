import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faUser,
  faPhone,
  faMapMarkerAlt,
  faStickyNote,
  faShoppingBag,
  faCreditCard,
  faExclamationCircle,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';

function Checkout() {
  const [cart, setCart] = useState({ items: [] });
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    note: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const userId = sessionStorage.getItem('userId');

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = sessionStorage.getItem('token');
      if (!token) return;

      setIsLoadingProfile(true);
      try {
        const response = await axios.get('http://localhost:3001/v1/auth/profile', {
          params: { userId },
          headers: { Authorization: `Bearer ${token}` }
        });
        
        
        if (response.data) {
          setFormData(prev => ({
            ...prev,
            fullName: response.data.user.userName || '',
            phone: response.data.user.phone || '',
            address: response.data.user.address || '',
          }));
        }
      } catch (err) {
        console.error('Lỗi khi lấy thông tin người dùng:', err);
        if (err.response?.status === 401) {
          toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
          sessionStorage.removeItem('token');
          navigate('/sign-in');
        } else {
          toast.error('Không thể lấy thông tin người dùng. Vui lòng nhập thủ công!');
        }
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // Lấy giỏ hàng từ API
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      setError('Vui lòng đăng nhập để thanh toán');
      toast.error('Vui lòng đăng nhập để thanh toán');
      setTimeout(() => navigate('/sign-in'), 2000);
      return;
    }
    setIsAuthenticated(true);

    const fetchCart = async () => {
      try {
        const response = await axios.get('http://localhost:3001/v1/products/cart', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Phản hồi API giỏ hàng:', response.data);
        if (!Array.isArray(response.data.items)) {
          throw new Error('Dữ liệu giỏ hàng không hợp lệ');
        }
        setCart({ items: response.data.items });
      } catch (err) {
        console.error('Lỗi API giỏ hàng:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          code: err.code,
        });
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
        } else if (err.response?.status === 404) {
          errorMessage = 'API giỏ hàng không tồn tại. Vui lòng kiểm tra backend!';
        } else if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
          errorMessage = 'Không kết nối được tới server. Vui lòng kiểm tra backend!';
        }
        setError(errorMessage);
        toast.error(errorMessage);
      }
    };
    fetchCart();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) {
      errors.fullName = 'Vui lòng nhập họ tên';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      errors.phone = 'Số điện thoại phải có 10 chữ số';
    }
    if (!formData.address.trim()) {
      errors.address = 'Vui lòng nhập địa chỉ';
    }
    if (cart.items.length === 0) {
      errors.cart = 'Giỏ hàng trống. Vui lòng thêm sản phẩm!';
    } else {
      cart.items.forEach((item, index) => {
        if (!item.productId || !/^[0-9a-fA-F]{24}$/.test(item.productId)) {
          errors[`item_${index}_productId`] = `Sản phẩm ${item.productName || index + 1} có ID không hợp lệ`;
        }
        if (!Number.isInteger(item.quantity) || item.quantity < 1) {
          errors[`item_${index}_quantity`] = `Sản phẩm ${item.productName || index + 1} có số lượng không hợp lệ`;
        }
        if (typeof item.originalPrice !== 'number' || item.originalPrice <= 0) {
          errors[`item_${index}_price`] = `Sản phẩm ${item.productName || index + 1} có giá không hợp lệ`;
        }
      });
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      if (errors.cart) {
        toast.error(errors.cart);
      } else {
        const firstError = Object.values(errors)[0];
        toast.error(firstError);
      }
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      const orderData = {
        items: cart.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          productName: item.productName || '',
          originalPrice: item.originalPrice,
          discountPercentage: item.discountPercentage || 0,
          discountedPrice: item.discountedPrice || item.originalPrice,
          image: item.image || '',
        })),
        total: cart.items.reduce((sum, item) => 
          sum + (item.discountedPrice || item.originalPrice) * item.quantity, 0),
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        note: formData.note.trim(),
      };

      console.log('Gửi request tạo đơn hàng:', orderData);
      const response = await axios.post(
        'http://localhost:3001/v1/orders/create',
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Phản hồi API tạo đơn hàng:', response.data);
      toast.success(response.data.message || 'Đơn hàng đã được tạo thành công, thanh toán khi nhận hàng');

      // Xóa giỏ hàng sau khi tạo đơn hàng thành công
      try {
        await axios.delete('http://localhost:3001/v1/products/cart/clear', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCart({ items: [] });
      } catch (deleteErr) {
        console.error('Lỗi khi xóa giỏ hàng:', {
          message: deleteErr.message,
          response: deleteErr.response?.data,
          status: deleteErr.response?.status,
        });
      }

      navigate('/orders');
    } catch (err) {
      console.error('Lỗi khi tạo đơn hàng:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      let errorMessage = 'Lỗi khi tạo đơn hàng';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!';
        sessionStorage.removeItem('token');
        navigate('/sign-in');
      } else if (err.response?.status === 400) {
        errorMessage = err.response.data.message || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại!';
      } else if (err.response?.status === 404) {
        errorMessage = 'API không tồn tại. Vui lòng kiểm tra backend!';
      } else if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
        errorMessage = 'Không kết nối được tới server. Vui lòng kiểm tra backend!';
      }
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleBack = () => {
    navigate('/cart');
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

  const calculateTotal = () => {
    return cart.items.reduce((sum, item) => 
      sum + (item.discountedPrice || item.originalPrice) * item.quantity, 0);
  };

  const calculateOriginalTotal = () => {
    return cart.items.reduce((sum, item) => 
      sum + item.originalPrice * item.quantity, 0);
  };

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
                Quay lại giỏ hàng
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {cart.items.length === 0 ? (
              <div className="text-center py-12">
                <FontAwesomeIcon icon={faShoppingBag} className="text-6xl text-gray-400 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-600 mb-2">Giỏ hàng trống</h2>
                <p className="text-gray-500 mb-6">Vui lòng thêm sản phẩm vào giỏ hàng để thanh toán</p>
                <button
                  onClick={handleBack}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300"
                >
                  Quay lại giỏ hàng
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form thông tin giao hàng */}
                <div className="space-y-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Thông tin giao hàng</h2>
                    {isLoadingProfile && (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-600 mt-2">Đang tải thông tin...</p>
                      </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                          <FontAwesomeIcon icon={faUser} className="mr-2 text-blue-600" />
                          Họ tên
                        </label>
                        <input
                          type="text"
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            formErrors.fullName ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Nhập họ tên của bạn"
                        />
                        {formErrors.fullName && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.fullName}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          <FontAwesomeIcon icon={faPhone} className="mr-2 text-blue-600" />
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            formErrors.phone ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Nhập số điện thoại"
                        />
                        {formErrors.phone && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-blue-600" />
                          Địa chỉ
                        </label>
                        <input
                          type="text"
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            formErrors.address ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Nhập địa chỉ giao hàng"
                        />
                        {formErrors.address && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                          <FontAwesomeIcon icon={faStickyNote} className="mr-2 text-blue-600" />
                          Ghi chú
                        </label>
                        <textarea
                          id="note"
                          name="note"
                          value={formData.note}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Nhập ghi chú (không bắt buộc)"
                          rows="3"
                        />
                      </div>
                    </form>
                  </div>
                </div>

                {/* Thông tin đơn hàng */}
                <div className="space-y-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Thông tin đơn hàng</h2>
                    <div className="space-y-4">
                      {cart.items.map((item) => (
                        <div key={item.productId} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="w-20 h-20 flex-shrink-0">
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
                            <h3 className="font-medium text-gray-900">{item.productName}</h3>
                            <div className="text-sm text-gray-500">
                              {item.discountPercentage > 0 ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-red-600 font-semibold">
                                    {(item.discountedPrice * item.quantity).toLocaleString('vi-VN')} VND
                                  </span>
                                  <span className="text-sm text-gray-400 line-through">
                                    {(item.originalPrice * item.quantity).toLocaleString('vi-VN')} VND
                                  </span>
                                  <span className="text-sm font-bold text-white bg-red-500 px-2 py-0.5 rounded">
                                    -{item.discountPercentage}%
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-900 font-semibold">
                                  {(item.originalPrice * item.quantity).toLocaleString('vi-VN')} VND
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="font-semibold text-gray-900">
                            {item.discountPercentage > 0 ? (
                              <span className="text-red-600">
                                {(item.discountedPrice * item.quantity).toLocaleString('vi-VN')} VND
                              </span>
                            ) : (
                              <span>
                                {(item.originalPrice * item.quantity).toLocaleString('vi-VN')} VND
                              </span>
                            )}
                          </div>
                        </div>
                      ))}

                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Tạm tính:</span>
                          <span className="text-gray-900">{calculateOriginalTotal().toLocaleString('vi-VN')} VND</span>
                        </div>
                        {cart.items.some(item => item.discountPercentage > 0) && (
                          <div className="flex justify-between items-center text-red-600">
                            <span>Tiền giảm giá:</span>
                            <span>-{(calculateOriginalTotal() - calculateTotal()).toLocaleString('vi-VN')} VND</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-lg font-semibold mt-4 pt-4 border-t border-gray-200">
                          <span className="text-gray-900">Tổng cộng:</span>
                          <span className="text-blue-600">{calculateTotal().toLocaleString('vi-VN')} VND</span>
                        </div>
                      </div>

                      <button
                        onClick={handleSubmit}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center mt-6"
                      >
                        <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
                        Thanh toán khi nhận hàng
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;