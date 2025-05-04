import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Cart() {
  const [cart, setCart] = useState([]);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Lấy giỏ hàng từ API
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Vui lòng đăng nhập để xem giỏ hàng');
      toast.error('Vui lòng đăng nhập để xem giỏ hàng');
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
        console.log('Phản hồi API giỏ hàng (mảng items):', response.data.items);
        setCart(response.data.items); // response.data là mảng items
        if (response.data.length === 0) {
          console.log('Giỏ hàng rỗng từ API:', response.data);
        }
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
        } else if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
          errorMessage = 'Không kết nối được tới server. Vui lòng kiểm tra backend.';
        }
        setError(errorMessage);
        toast.error(errorMessage);
      }
    };
    fetchCart();
  }, [navigate]);

  // Cập nhật số lượng sản phẩm
  const handleUpdateQuantity = async (productId, newQuantity) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:3001/v1/products/cart/update',
        { productId: productId.trim(), quantity: newQuantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Phản hồi API cập nhật giỏ hàng:', response.data);
      toast.success('Đã cập nhật số lượng sản phẩm');

      // Lấy lại giỏ hàng
      const cartResponse = await axios.get('http://localhost:3001/v1/products/cart', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCart(cartResponse.data.items);
    } catch (err) {
      console.error('Lỗi khi cập nhật số lượng:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        code: err.code,
      });
      let errorMessage = 'Lỗi khi cập nhật số lượng';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
        if (err.response.data.message.includes('productId không hợp lệ')) {
          errorMessage = 'Sản phẩm không hợp lệ. Vui lòng kiểm tra lại!';
        }
      } else if (err.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!';
        localStorage.removeItem('token');
        navigate('/sign-in');
      }
      toast.error(errorMessage);
    }
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const handleRemoveItem = async (productId) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete('http://localhost:3001/v1/products/cart/remove', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { productId: productId.trim() },
      });
      console.log('Phản hồi API xóa sản phẩm:', response.data);
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');

      // Lấy lại giỏ hàng
      const cartResponse = await axios.get('http://localhost:3001/v1/products/cart', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCart(cartResponse.data.items);
    } catch (err) {
      console.error('Lỗi khi xóa sản phẩm:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        code: err.code,
      });
      let errorMessage = 'Lỗi khi xóa sản phẩm';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
        if (err.response.data.message.includes('productId không hợp lệ')) {
          errorMessage = 'Sản phẩm không hợp lệ. Vui lòng kiểm tra lại!';
        }
      } else if (err.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!';
        localStorage.removeItem('token');
        navigate('/sign-in');
      }
      toast.error(errorMessage);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleCheckout = () => {
    navigate('/checkout');
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
      <h1 className="text-3xl font-semibold text-center text-blue-600 mb-6">Giỏ hàng</h1>
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
      {cart.length === 0 ? (
        <div className="text-center text-gray-600">Giỏ hàng trống.</div>
      ) : (
        <div className="space-y-4">
          {cart.map((item) => (
            <div key={item.productId} className="flex gap-4 border-b pb-4 items-center">
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
                <div className="flex items-center gap-2">
                  <p className="text-gray-600">Số lượng:</p>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleUpdateQuantity(item.productId, Number(e.target.value))}
                    className="w-16 p-1 border border-gray-300 rounded-lg"
                  />
                </div>
                <p className="text-gray-600">Tổng: {(item.price * item.quantity).toLocaleString()} VND</p>
              </div>
              <button
                onClick={() => handleRemoveItem(item.productId)}
                className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition duration-300"
              >
                Xóa
              </button>
            </div>
          ))}
          <div className="text-xl font-semibold text-gray-800 mt-4">
            Tổng cộng: {cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()} VND
          </div>
        </div>
      )}
      <div className="text-center mt-6 flex justify-center gap-4">
        <button
          onClick={handleBack}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Quay lại
        </button>
        <button
          onClick={handleCheckout}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300"
          disabled={cart.length === 0}
        >
          Thanh toán
        </button>
      </div>
    </div>
  );
}

export default Cart;