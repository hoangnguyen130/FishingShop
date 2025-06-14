import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faBox,
  faTruck,
  faCheckCircle,
  faTimesCircle,
  faSpinner,
  faUser,
  faPhone,
  faMapMarkerAlt,
  faStickyNote,
  faMoneyBillWave,
  faExclamationCircle,
  faClipboardList,
  faCheck,
  faBan,
  faQuestionCircle,
  faHistory,
  faArrowLeft,
  faCalendarAlt,
  faFilter,
  faCircleXmark
} from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippyjs/react/headless';
import { Wrapper as PopperWrapper } from '~/components/Layout/Popper';
import { useDebounce } from '~/hooks';

function OrdersUser() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState({ orderId: null, action: null });
  const navigate = useNavigate();
  const inputRef = useRef();
  const debounced = useDebounce(searchValue, 700);

  // Lấy danh sách đơn hàng
  const fetchOrders = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      setError('Vui lòng đăng nhập để xem đơn hàng');
      toast.error('Vui lòng đăng nhập để xem đơn hàng');
      setTimeout(() => navigate('/sign-in'), 2000);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const url = 'http://localhost:3001/v1/orders/user';
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
        sessionStorage.removeItem('token');
        navigate('/sign-in');
      } else if (err.response?.status === 403) {
        errorMessage = 'Bạn không có quyền truy cập!';
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

  // Gọi API khi component mount
  useEffect(() => {
    fetchOrders();
  }, [navigate]);

  // Xử lý tìm kiếm với debounce
  useEffect(() => {
    if (!debounced.trim()) {
      setSearchResult([]);
      return;
    }

    const filteredOrders = orders.filter(order => {
      const searchLower = debounced.toLowerCase();
      return (
        order._id.toLowerCase().includes(searchLower) ||
        (order.fullName && order.fullName.toLowerCase().includes(searchLower)) ||
        (order.phone && order.phone.toLowerCase().includes(searchLower)) ||
        (order.address && order.address.toLowerCase().includes(searchLower)) ||
        order.items.some(item => 
          item.productName && item.productName.toLowerCase().includes(searchLower)
        )
      );
    });
    setSearchResult(filteredOrders);
    setShowResult(true);
  }, [debounced, orders]);

  const handleClear = () => {
    setSearchValue('');
    setSearchResult([]);
    setShowResult(false);
    inputRef.current.focus();
  };

  const handleHideResult = () => {
    setShowResult(false);
  };

  // Xử lý thay đổi ngày
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    if (name === 'startDate') {
      setStartDate(value);
    } else if (name === 'endDate') {
      setEndDate(value);
    }
  };

  // Reset bộ lọc
  const handleResetFilters = () => {
    setSearchValue('');
    setStartDate('');
    setEndDate('');
    setSearchResult([]);
    setShowResult(false);
  };

  // Lọc đơn hàng theo ngày
  const filterOrdersByDate = (orders) => {
    if (!startDate && !endDate) return orders;

    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && end) {
        // Lọc theo khoảng thời gian
        return orderDate >= start && orderDate <= end;
      } else if (start) {
        // Lọc từ ngày bắt đầu
        return orderDate >= start;
      } else if (end) {
        // Lọc đến ngày kết thúc
        return orderDate <= end;
      }
      return true;
    });
  };

  // Lọc đơn hàng theo tab đang chọn
  const filteredOrders = activeTab === 'all'
    ? filterOrdersByDate(orders).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : filterOrdersByDate(orders.filter(order => order.status === activeTab))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Lọc đơn hàng theo kết quả tìm kiếm
  const displayOrders = searchValue
    ? filteredOrders.filter(order => 
        order._id.toLowerCase().includes(searchValue.toLowerCase()) ||
        (order.fullName && order.fullName.toLowerCase().includes(searchValue.toLowerCase())) ||
        (order.phone && order.phone.toLowerCase().includes(searchValue.toLowerCase())) ||
        (order.address && order.address.toLowerCase().includes(searchValue.toLowerCase())) ||
        order.items.some(item => 
          item.productName && item.productName.toLowerCase().includes(searchValue.toLowerCase())
        )
      )
    : filteredOrders;

  // Đếm số đơn hàng theo trạng thái
  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    ordered: orders.filter(o => o.status === 'ordered').length,
    shipping: orders.filter(o => o.status === 'shipping').length,
    completed: orders.filter(o => o.status === 'completed').length,
    canceled: orders.filter(o => o.status === 'canceled').length,
  };

  // Hàm hiển thị trạng thái đơn hàng bằng tiếng Việt và icon
  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { text: 'Chờ xử lý', icon: faSpinner, color: 'text-yellow-600', bg: 'bg-yellow-50' };
      case 'ordered':
        return { text: 'Đã đặt hàng', icon: faBox, color: 'text-blue-600', bg: 'bg-blue-50' };
      case 'shipping':
        return { text: 'Đang giao', icon: faTruck, color: 'text-purple-600', bg: 'bg-purple-50' };
      case 'completed':
        return { text: 'Đã nhận hàng', icon: faCheckCircle, color: 'text-green-600', bg: 'bg-green-50' };
      case 'canceled':
        return { text: 'Đã hủy', icon: faTimesCircle, color: 'text-red-600', bg: 'bg-red-50' };
      default:
        return { text: 'Không xác định', icon: faExclamationCircle, color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập để hủy đơn hàng!');
        navigate('/sign-in');
        return;
      }

      // Tìm đơn hàng cần hủy
      const orderToCancel = orders.find(order => order._id === orderId);
      if (!orderToCancel) {
        toast.error('Không tìm thấy đơn hàng!');
        return;
      }

      // Chuẩn bị dữ liệu sản phẩm cần hoàn trả
      const productsToRestore = orderToCancel.items.map(item => ({
        productId: item.productId.toString(),
        quantity: parseInt(item.quantity, 10)
      }));

      console.log('Sending cancel request with data:', {
        orderId,
        productsToRestore
      });

      const response = await axios.put(
        `http://localhost:3001/v1/orders/cancel/${orderId}`,
        { productsToRestore },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      console.log('Cancel order response:', response.data);

      // Kiểm tra response và cập nhật UI
      if (response.data) {
        // Cập nhật lại danh sách đơn hàng
        const updatedOrders = orders.map(order => 
          order._id === orderId ? { ...order, status: 'canceled' } : order
        );
        setOrders(updatedOrders);
        setError(null);
        // Hiển thị thông báo thành công
        toast.success(response.data.message || 'Hủy đơn hàng thành công!');
        // Đóng modal xác nhận
        setShowConfirmModal(false);
        setConfirmAction({ orderId: null, action: null });
        // Refresh danh sách đơn hàng
        await fetchOrders();
      } else {
        throw new Error('Không nhận được phản hồi từ server');
      }
    } catch (error) {
      console.error('Error canceling order:', error);
      let errorMessage = 'Có lỗi xảy ra khi hủy đơn hàng';
      
      if (error.response) {
        // Server trả về response với status code ngoài range 2xx
        errorMessage = error.response.data?.message || `Lỗi server: ${error.response.status}`;
        console.error('Server error details:', error.response.data);
      } else if (error.request) {
        // Request được gửi nhưng không nhận được response
        errorMessage = 'Không thể kết nối đến server';
        console.error('Network error:', error.request);
      } else {
        // Có lỗi khi setting up request
        errorMessage = error.message;
        console.error('Request setup error:', error);
      }

      if (error.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!';
        sessionStorage.removeItem('token');
        navigate('/sign-in');
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Tính tổng tiền gốc của đơn hàng
  const calculateOriginalTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0);
  };

  // Tính tổng tiền sau giảm giá
  const calculateDiscountedTotal = (items) => {
    return items.reduce((sum, item) => {
      const itemPrice = item.discountPercentage > 0 ? item.discountedPrice : item.originalPrice;
      return sum + (itemPrice * item.quantity);
    }, 0);
  };

  // Tính số tiền được giảm
  const calculateDiscountAmount = (items) => {
    const originalTotal = calculateOriginalTotal(items);
    const discountedTotal = calculateDiscountedTotal(items);
    return originalTotal - discountedTotal;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
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
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition duration-300"
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                  <span>Quay lại trang chủ</span>
                </button>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 absolute left-1/2 transform -translate-x-1/2">Đơn hàng của tôi</h1>
            </div>

            {/* Bộ lọc tìm kiếm */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[300px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tìm kiếm
                  </label>
                  <Tippy
                    interactive
                    visible={showResult && searchResult.length > 0}
                    render={(attrs) => (
                      <div
                        className="w-full bg-white shadow-lg rounded-md mt-2 p-2 max-h-96 overflow-y-auto"
                        tabIndex="-1"
                        {...attrs}
                      >
                        <PopperWrapper>
                          {searchResult.map((order) => (
                            <div
                              key={order._id}
                              className="p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                              onClick={() => {
                                setSearchValue(order._id);
                                setShowResult(false);
                              }}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-medium">Đơn hàng #{order._id.slice(-6)}</span>
                                <span className={`px-2 py-1 rounded-full text-xs ${getStatusInfo(order.status).bg} ${getStatusInfo(order.status).color}`}>
                                  {getStatusInfo(order.status).text}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.fullName} - {order.phone}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                Sản phẩm: {order.items.map(item => item.productName).join(', ')}
                              </div>
                            </div>
                          ))}
                        </PopperWrapper>
                      </div>
                    )}
                    onClickOutside={handleHideResult}
                  >
                    <div className="relative">
                <input
                        ref={inputRef}
                  type="text"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onFocus={() => setShowResult(true)}
                  placeholder="Tìm kiếm theo mã đơn hàng hoặc tên sản phẩm..."
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {!!searchValue && (
                        <button
                          className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          onClick={handleClear}
                        >
                          <FontAwesomeIcon icon={faCircleXmark} />
                        </button>
                      )}
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                    </div>
                  </Tippy>
                </div>
                <div className="flex gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Từ ngày
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="startDate"
                        value={startDate}
                        onChange={handleDateChange}
                        max={endDate || undefined}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <FontAwesomeIcon
                        icon={faCalendarAlt}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Đến ngày
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="endDate"
                        value={endDate}
                        onChange={handleDateChange}
                        min={startDate || undefined}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <FontAwesomeIcon
                        icon={faCalendarAlt}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-300 flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faFilter} />
                  <span>Reset bộ lọc</span>
                </button>
              </div>
            </div>

            {/* Tabs trạng thái */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { key: 'all', label: `Tất cả`, count: statusCounts.all },
                { key: 'pending', label: `Chờ xử lý`, count: statusCounts.pending },
                { key: 'ordered', label: `Đã đặt hàng`, count: statusCounts.ordered },
                { key: 'shipping', label: `Đang giao`, count: statusCounts.shipping },
                { key: 'completed', label: `Đã nhận hàng`, count: statusCounts.completed },
                { key: 'canceled', label: `Đã hủy`, count: statusCounts.canceled },
              ].map(tab => {
                const statusInfo = getStatusInfo(tab.key);
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2 rounded-lg transition duration-300 flex items-center gap-2 ${
                      activeTab === tab.key
                        ? `${statusInfo.bg} ${statusInfo.color}`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <FontAwesomeIcon icon={statusInfo.icon} />
                    <span>{tab.label}</span>
                    <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-gray-200">
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Thông báo lỗi */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Danh sách đơn hàng */}
            {displayOrders.length === 0 ? (
              <div className="text-center py-12">
                <FontAwesomeIcon icon={faClipboardList} className="text-6xl text-gray-400 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-600 mb-2">Không có đơn hàng</h2>
                <p className="text-gray-500">
                  {activeTab === 'all'
                    ? 'Chưa có đơn hàng nào.'
                    : `Không có đơn hàng ở trạng thái "${getStatusInfo(activeTab).text}".`}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {displayOrders.map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  return (
                    <div key={order._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-semibold text-gray-900">
                                Đơn hàng #{order._id.slice(-6)}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-sm ${statusInfo.bg} ${statusInfo.color}`}>
                                <FontAwesomeIcon icon={statusInfo.icon} className="mr-1" />
                                {statusInfo.text}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                              <div className="space-y-2">
                                <div className="flex items-center text-gray-600">
                                  <FontAwesomeIcon icon={faUser} className="w-5 mr-2" />
                                  <span>{order.fullName || 'Ẩn danh'}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <FontAwesomeIcon icon={faPhone} className="w-5 mr-2" />
                                  <span>{order.phone || 'Chưa cập nhật'}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <FontAwesomeIcon icon={faMapMarkerAlt} className="w-5 mr-2" />
                                  <span>{order.address || 'Chưa cập nhật'}</span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center text-gray-600">
                                  <FontAwesomeIcon icon={faMoneyBillWave} className="w-5 mr-2" />
                                  <span>{order.total.toLocaleString()} VND</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <FontAwesomeIcon icon={faMoneyBillWave} className="w-5 mr-2" />
                                  <span>Phương thức: {order.paymentMethod || 'Thanh toán khi nhận hàng'}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <FontAwesomeIcon icon={faCalendarAlt} className="w-5 mr-2" />
                                  <span>Tạo lúc: {new Date(order.createdAt).toLocaleString('vi-VN')}</span>
                                </div>
                                {order.note && (
                                  <div className="flex items-center text-gray-600">
                                    <FontAwesomeIcon icon={faStickyNote} className="w-5 mr-2" />
                                    <span>{order.note}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          {order.status === 'pending' && (
                            <button
                              onClick={() => {
                                setConfirmAction({ orderId: order._id, action: 'cancel' });
                                setShowConfirmModal(true);
                              }}
                              className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center gap-2"
                              disabled={loading}
                            >
                              <FontAwesomeIcon icon={faBan} />
                              {loading ? 'Đang xử lý...' : 'Hủy đơn hàng'}
                            </button>
                          )}
                        </div>

                        {/* Danh sách sản phẩm */}
                        <div className="mt-4 border-t border-gray-200 pt-4">
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">Sản phẩm</h4>
                          <div className="space-y-3">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                <div className="w-16 h-16 flex-shrink-0">
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
                                  <h5 className="font-medium text-gray-900">{item.productName}</h5>
                                  <div className="text-sm text-gray-500">
                                    {item.discountPercentage > 0 ? (
                                      <div className="flex items-center gap-2">
                                        <span className="text-red-600 font-semibold">
                                          {(item.discountedPrice * item.quantity).toLocaleString()} VND
                                        </span>
                                        <span className="text-sm text-gray-400 line-through">
                                          {(item.originalPrice * item.quantity).toLocaleString()} VND
                                        </span>
                                        <span className="text-sm font-bold text-white bg-red-500 px-2 py-0.5 rounded">
                                          -{item.discountPercentage}%
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-gray-900 font-semibold">
                                        {(item.originalPrice * item.quantity).toLocaleString()} VND
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                                </div>
                                <div className="font-semibold text-gray-900">
                                  {item.discountPercentage > 0 
                                    ? (item.discountedPrice * item.quantity).toLocaleString()
                                    : (item.originalPrice * item.quantity).toLocaleString()} VND
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Tổng kết đơn hàng */}
                        <div className="border-t border-gray-200 pt-4">
                          {order.items.some(item => item.discountPercentage > 0) ? (
                            <>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600">Tạm tính:</span>
                                <span className="text-gray-900">{calculateOriginalTotal(order.items).toLocaleString()} VND</span>
                              </div>
                              <div className="flex justify-between items-center text-red-600">
                                <span>Tiền giảm giá:</span>
                                <span>-{calculateDiscountAmount(order.items).toLocaleString()} VND</span>
                              </div>
                              <div className="flex justify-between items-center text-lg font-semibold mt-4 pt-4 border-t border-gray-200">
                                <span className="text-gray-900">Tổng cộng:</span>
                                <span className="text-blue-600">{calculateDiscountedTotal(order.items).toLocaleString()} VND</span>
                              </div>
                            </>
                          ) : (
                            <div className="flex justify-between items-center text-lg font-semibold">
                              <span className="text-gray-900">Tổng cộng:</span>
                              <span className="text-blue-600">{calculateOriginalTotal(order.items).toLocaleString()} VND</span>
                            </div>
                          )}
                        </div>

                        {/* Lịch sử trạng thái */}
                        {order.statusHistory && order.statusHistory.length > 0 && (
                          <div className="mt-6 border-t border-gray-200 pt-4">
                            <div className="flex items-center gap-2 mb-3">
                              <FontAwesomeIcon icon={faHistory} className="text-gray-600" />
                              <h4 className="text-lg font-semibold text-gray-900">Lịch sử trạng thái</h4>
                            </div>
                            <div className="space-y-2">
                              {order.statusHistory.map((entry, index) => {
                                const historyStatusInfo = getStatusInfo(entry.status);
                                return (
                                  <div key={index} className="flex items-center gap-3 text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs ${historyStatusInfo.bg} ${historyStatusInfo.color}`}>
                                      <FontAwesomeIcon icon={historyStatusInfo.icon} className="mr-1" />
                                      {historyStatusInfo.text}
                                    </span>
                                    <span className="text-gray-500">
                                      {new Date(entry.timestamp).toLocaleString()}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-center mb-4">
              <FontAwesomeIcon
                icon={faQuestionCircle}
                className="text-4xl text-blue-500"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
              Xác nhận hủy đơn hàng
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmAction({ orderId: null, action: null });
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-300"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (confirmAction.orderId) {
                    handleCancelOrder(confirmAction.orderId);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrdersUser;