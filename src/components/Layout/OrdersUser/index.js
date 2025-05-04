import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function OrdersUser() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'ordered', 'shipping', 'completed', 'canceled'
  const navigate = useNavigate();

  // Lấy danh sách đơn hàng của người dùng
  const fetchOrders = async (query = '') => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Vui lòng đăng nhập để xem đơn hàng');
      toast.error('Vui lòng đăng nhập để xem đơn hàng');
      setTimeout(() => navigate('/sign-in'), 2000);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const url = query
        ? `http://localhost:3001/v1/orders/search?query=${encodeURIComponent(query)}`
        : 'http://localhost:3001/v1/orders/user';
      console.log('Gọi API đơn hàng:', url);
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Phản hồi API:', response.data);
      if (!Array.isArray(response.data)) {
        throw new Error('Dữ liệu đơn hàng không hợp lệ');
      }
      setOrders(response.data);
    } catch (err) {
      console.error('Lỗi API:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      let errorMessage = 'Lỗi khi lấy đơn hàng';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!';
        localStorage.removeItem('token');
        navigate('/sign-in');
      } else if (err.response?.status === 404) {
        errorMessage = 'API không tồn tại. Vui lòng kiểm tra backend!';
      } else if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
        errorMessage = 'Không kết nối được tới server. Vui lòng kiểm tra backend!';
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi component mount hoặc query thay đổi
  useEffect(() => {
    fetchOrders(searchQuery);
  }, [searchQuery, navigate]);

  // Xử lý thay đổi tìm kiếm
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Hàm xác nhận nhận hàng
  const handleConfirmReceived = async (orderId) => {
    if (!/^[0-9a-fA-F]{24}$/.test(orderId)) {
      console.error('Invalid orderId format:', orderId);
      toast.error('ID đơn hàng không hợp lệ');
      return;
    }

    if (!window.confirm('Bạn có chắc đã nhận được đơn hàng này?')) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Vui lòng đăng nhập để xác nhận nhận hàng!');
      navigate('/sign-in');
      return;
    }

    try {
      console.log('Gọi API xác nhận nhận hàng:', `http://localhost:3001/v1/orders/received/${orderId}`);
      const response = await axios.put(
        `http://localhost:3001/v1/orders/received/${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Phản hồi API:', response.data);
      toast.success(response.data.message || 'Đã xác nhận nhận hàng!');

      // Làm mới danh sách đơn hàng
      await fetchOrders(searchQuery);
    } catch (err) {
      console.error('Lỗi khi xác nhận nhận hàng:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      let errorMessage = 'Lỗi khi xác nhận nhận hàng';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!';
        localStorage.removeItem('token');
        navigate('/sign-in');
      } else if (err.response?.status === 404) {
        errorMessage = 'Đơn hàng không tồn tại hoặc không thuộc về bạn!';
      } else if (err.response?.status === 400) {
        errorMessage = err.response.data.message || 'Yêu cầu không hợp lệ!';
      }
      toast.error(errorMessage);
    }
  };

  // Hàm hiển thị trạng thái đơn hàng bằng tiếng Việt
  const displayStatus = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ xử lý';
      case 'ordered':
        return 'Đã đặt hàng';
      case 'shipping':
        return 'Đang giao';
      case 'completed':
        return 'Đã nhận hàng';
      case 'canceled':
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  };

  // Lọc đơn hàng theo tab đang chọn
  const filteredOrders = activeTab === 'all'
    ? orders
    : orders.filter(order => order.status === activeTab);

  // Đếm số đơn hàng theo trạng thái
  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    ordered: orders.filter(o => o.status === 'ordered').length,
    shipping: orders.filter(o => o.status === 'shipping').length,
    completed: orders.filter(o => o.status === 'completed').length,
    canceled: orders.filter(o => o.status === 'canceled').length,
  };

  if (loading) {
    return <div className="text-center">Đang tải...</div>;
  }
  const handleBackToHome = () => {
    navigate('/');
  };
  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 border border-gray-300 rounded-lg shadow-md">
      <button
          onClick={handleBackToHome}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Trở về
        </button>
      <h1 className="text-3xl font-semibold text-center text-blue-600 mb-6">Đơn hàng của bạn</h1>
      
      {/* Thanh tìm kiếm */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Tìm kiếm theo mã đơn hàng hoặc tên sản phẩm..."
          className="w-full p-2 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Tabs trạng thái */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'all', label: `Tất cả (${statusCounts.all})` },
          { key: 'pending', label: `Chờ xử lý (${statusCounts.pending})` },
          { key: 'ordered', label: `Đã đặt hàng (${statusCounts.ordered})` },
          { key: 'shipping', label: `Đang giao (${statusCounts.shipping})` },
          { key: 'completed', label: `Đã nhận hàng (${statusCounts.completed})` },
          { key: 'canceled', label: `Đã hủy (${statusCounts.canceled})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg transition duration-300 ${
              activeTab === tab.key
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Thông báo lỗi */}
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}

      {/* Danh sách đơn hàng */}
      {filteredOrders.length === 0 ? (
        <div className="text-center text-gray-600">
          {activeTab === 'all' ? 'Bạn chưa có đơn hàng nào.' : `Không có đơn hàng ở trạng thái "${displayStatus(activeTab)}".`}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order._id} className="border-b pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Đơn hàng: {order._id}</h3>
                  <p className="text-gray-600">Tổng tiền: {order.total.toLocaleString()} VND</p>
                  <p className="text-gray-600">Phương thức: Thanh toán khi nhận hàng</p>
                  <p className="text-gray-600">Trạng thái: {displayStatus(order.status)}</p>
                  <p className="text-gray-600">Họ tên: {order.fullName}</p>
                  <p className="text-gray-600">Số điện thoại: {order.phone}</p>
                  <p className="text-gray-600">Địa chỉ: {order.address}</p>
                  {order.note && <p className="text-gray-600">Ghi chú: {order.note}</p>}
                  {order.statusHistory && (
                    <div className="mt-2">
                      <h4 className="text-lg font-semibold">Lịch sử trạng thái:</h4>
                      <ul className="list-disc pl-5">
                        {order.statusHistory.map((entry, index) => (
                          <li key={index} className="text-gray-600">
                            {displayStatus(entry.status)} - {new Date(entry.timestamp).toLocaleString()}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {order.status === 'shipping' && (
                  <button
                    onClick={() => handleConfirmReceived(order._id)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300"
                  >
                    Đã nhận được hàng
                  </button>
                )}
              </div>
              <div className="mt-2">
                <h4 className="text-lg font-semibold">Sản phẩm:</h4>
                {order.items.map((item) => (
                  <div key={item.productId} className="flex gap-4 items-center">
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded-md"
                      onError={(e) => (e.target.src = 'https://via.placeholder.com/150')}
                    />
                    <div>
                      <p className="text-gray-600">{item.productName}</p>
                      <p className="text-gray-600">Số lượng: {item.quantity}</p>
                      <p className="text-gray-600">Giá: {item.price.toLocaleString()} VND</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrdersUser;