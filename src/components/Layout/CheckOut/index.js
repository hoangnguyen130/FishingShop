import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Checkout() {
  const [cart, setCart] = useState({ items: [] });
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    note: '',
  });
  const [formErrors, setFormErrors] = useState({});

  // Lấy giỏ hàng từ API
  useEffect(() => {
    const token = localStorage.getItem('token');
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
            localStorage.removeItem('token');
            navigate('/sign-in');
          }
        } else if (err.response?.status === 401) {
          errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!';
          localStorage.removeItem('token');
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
        if (typeof item.price !== 'number' || item.price <= 0) {
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
      const token = localStorage.getItem('token');
      const orderData = {
        items: cart.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          productName: item.productName || '',
          price: item.price,
          image: item.image || '',
        })),
        total: cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
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
        await axios.delete('http://localhost:3001/v1/products/cart', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Giỏ hàng đã được xóa');
        setCart({ items: [] });
      } catch (deleteErr) {
        console.error('Lỗi khi xóa giỏ hàng:', {
          message: deleteErr.message,
          response: deleteErr.response?.data,
          status: deleteErr.response?.status,
        });
        toast.warn('Đơn hàng đã được tạo, nhưng không thể xóa giỏ hàng. Vui lòng kiểm tra lại!');
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
        localStorage.removeItem('token');
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

    setFormErrors({});
  };

  const handleBack = () => {
    navigate('/cart');
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6 border border-gray-300 rounded-lg shadow-md">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 border border-gray-300 rounded-lg shadow-md">
      <h1 className="text-3xl font-semibold text-center text-blue-600 mb-6">Thanh toán</h1>
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
      {cart.items.length === 0 ? (
        <div className="text-center text-gray-600">Giỏ hàng trống. Vui lòng thêm sản phẩm để thanh toán.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form nhập thông tin giao hàng (bên trái) */}
          <div className="md:col-span-1">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Thông tin giao hàng</h2>
            <form onSubmit={handleSubmit} noValidate>
              <div className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-lg mb-2">Họ tên</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập họ tên"
                    required
                  />
                  {formErrors.fullName && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="phone" className="block text-lg mb-2">Số điện thoại</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập số điện thoại (10 chữ số)"
                    required
                  />
                  {formErrors.phone && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="address" className="block text-lg mb-2">Địa chỉ</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Nhập địa chỉ giao hàng"
                    required
                  />
                  {formErrors.address && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="note" className="block text-lg mb-2">Ghi chú (tùy chọn)</label>
                  <textarea
                    id="note"
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Nhập ghi chú (nếu có)"
                  />
                </div>
              </div>
              <div className="text-center mt-6">
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300"
                >
                  Xác nhận thanh toán
                </button>
              </div>
            </form>
          </div>

          {/* Thông tin đơn hàng (bên phải) */}
          <div className="md:col-span-1">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Thông tin đơn hàng</h2>
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.productId} className="flex gap-4 border-b pb-4">
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-24 h-24 object-cover rounded-md"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150';
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800">{item.productName}</h3>
                    <p className="text-gray-600">Giá: {item.price.toLocaleString()} VND</p>
                    <p className="text-gray-600">Số lượng: {item.quantity}</p>
                    <p className="text-gray-600">Tổng: {(item.price * item.quantity).toLocaleString()} VND</p>
                  </div>
                </div>
              ))}
              <div className="text-xl font-semibold text-gray-800 mt-4">
                Tổng cộng: {cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()} VND
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="text-center mt-6">
        <button
          onClick={handleBack}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Quay lại giỏ hàng
        </button>
      </div>
    </div>
  );
}

export default Checkout;