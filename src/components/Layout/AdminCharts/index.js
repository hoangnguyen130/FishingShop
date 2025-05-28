import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faMoneyBillWave,
  faShoppingCart,
  faChartLine,
  faFilter,
  faArrowLeft,
  faBox
} from '@fortawesome/free-solid-svg-icons';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function AdminCharts() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timeRange, setTimeRange] = useState('week'); // 'week', 'month', 'year'
  const navigate = useNavigate();

  // Lấy danh sách đơn hàng
  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('Vui lòng đăng nhập để xem thống kê');
      }

      const response = await axios.get('http://localhost:3001/v1/orders/admin', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Lọc chỉ lấy đơn hàng đã hoàn thành
      const completedOrders = response.data.filter(order => order.status === 'completed');
      setOrders(completedOrders);
      console.log(completedOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      let errorMessage = 'Lỗi khi lấy dữ liệu thống kê';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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
    setStartDate('');
    setEndDate('');
    setTimeRange('week');
  };

  // Lọc đơn hàng theo ngày
  const filterOrdersByDate = (orders) => {
    if (!startDate && !endDate) return orders;

    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && end) {
        return orderDate >= start && orderDate <= end;
      } else if (start) {
        return orderDate >= start;
      } else if (end) {
        return orderDate <= end;
      }
      return true;
    });
  };

  // Tính toán doanh thu theo thời gian
  const calculateRevenueByTime = () => {
    const filteredOrders = filterOrdersByDate(orders);
    const now = new Date();
    let labels = [];
    let data = [];

    if (timeRange === 'week') {
      // Thống kê theo ngày trong tuần
      labels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      data = Array(7).fill(0);
      
      filteredOrders.forEach(order => {
        const orderDate = new Date(order.createdAt);
        const dayOfWeek = orderDate.getDay();
        data[dayOfWeek] += order.total;
      });
    } else if (timeRange === 'month') {
      // Thống kê theo ngày trong tháng
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
      data = Array(daysInMonth).fill(0);
      
      filteredOrders.forEach(order => {
        const orderDate = new Date(order.createdAt);
        const dayOfMonth = orderDate.getDate() - 1;
        data[dayOfMonth] += order.total;
      });
    } else if (timeRange === 'year') {
      // Thống kê theo tháng trong năm
      labels = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
      data = Array(12).fill(0);
      
      filteredOrders.forEach(order => {
        const orderDate = new Date(order.createdAt);
        const month = orderDate.getMonth();
        data[month] += order.total;
      });
    }

    return { labels, data };
  };

  // Tính toán số lượng đơn hàng theo thời gian
  const calculateOrdersByTime = () => {
    const filteredOrders = filterOrdersByDate(orders);
    const now = new Date();
    let labels = [];
    let data = [];

    if (timeRange === 'week') {
      labels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      data = Array(7).fill(0);
      
      filteredOrders.forEach(order => {
        const orderDate = new Date(order.createdAt);
        const dayOfWeek = orderDate.getDay();
        data[dayOfWeek]++;
      });
    } else if (timeRange === 'month') {
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
      data = Array(daysInMonth).fill(0);
      
      filteredOrders.forEach(order => {
        const orderDate = new Date(order.createdAt);
        const dayOfMonth = orderDate.getDate() - 1;
        data[dayOfMonth]++;
      });
    } else if (timeRange === 'year') {
      labels = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
      data = Array(12).fill(0);
      
      filteredOrders.forEach(order => {
        const orderDate = new Date(order.createdAt);
        const month = orderDate.getMonth();
        data[month]++;
      });
    }

    return { labels, data };
  };

  // Tính toán số lượng sản phẩm đã bán theo thời gian
  const calculateSoldProductsByTime = () => {
    const filteredOrders = filterOrdersByDate(orders);
    const now = new Date();
    let labels = [];
    let data = [];

    if (timeRange === 'week') {
      labels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      data = Array(7).fill(0);
      
      filteredOrders.forEach(order => {
        const orderDate = new Date(order.createdAt);
        const dayOfWeek = orderDate.getDay();
        order.items.forEach(item => {
          data[dayOfWeek] += item.quantity;
        });
      });
    } else if (timeRange === 'month') {
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
      data = Array(daysInMonth).fill(0);
      
      filteredOrders.forEach(order => {
        const orderDate = new Date(order.createdAt);
        const dayOfMonth = orderDate.getDate() - 1;
        order.items.forEach(item => {
          data[dayOfMonth] += item.quantity;
        });
      });
    } else if (timeRange === 'year') {
      labels = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
      data = Array(12).fill(0);
      
      filteredOrders.forEach(order => {
        const orderDate = new Date(order.createdAt);
        const month = orderDate.getMonth();
        order.items.forEach(item => {
          data[month] += item.quantity;
        });
      });
    }

    return { labels, data };
  };

  // Tính toán thống kê tổng quan
  const calculateOverview = () => {
    const filteredOrders = filterOrdersByDate(orders);
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = filteredOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalSoldProducts = filteredOrders.reduce((sum, order) => {
      return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      totalSoldProducts
    };
  };

  // Tính toán top sản phẩm bán chạy
  const calculateTopSellingProducts = () => {
    const filteredOrders = filterOrdersByDate(orders);
    const productSales = {};

    // Tính tổng số lượng bán của từng sản phẩm
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            name: item.productName,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.price * item.quantity;
      });
    });

    // Chuyển đổi thành mảng và sắp xếp theo số lượng bán
    const sortedProducts = Object.entries(productSales)
      .map(([id, data]) => ({
        id,
        name: data.name,
        quantity: data.quantity,
        revenue: data.revenue
      }))
      .filter(product => product.quantity >= 10) // Chỉ lấy sản phẩm bán từ 10 trở lên
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10); // Lấy top 10 sản phẩm

    return {
      labels: sortedProducts.map(p => p.name),
      quantities: sortedProducts.map(p => p.quantity),
      revenues: sortedProducts.map(p => p.revenue)
    };
  };

  // Cấu hình biểu đồ doanh thu
  const revenueData = {
    labels: calculateRevenueByTime().labels,
    datasets: [
      {
        label: 'Doanh thu (VND)',
        data: calculateRevenueByTime().data,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1
      }
    ]
  };

  // Cấu hình biểu đồ số lượng đơn hàng
  const ordersData = {
    labels: calculateOrdersByTime().labels,
    datasets: [
      {
        label: 'Số lượng đơn hàng',
        data: calculateOrdersByTime().data,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1
      }
    ]
  };

  // Cấu hình biểu đồ số lượng sản phẩm đã bán
  const soldProductsData = {
    labels: calculateSoldProductsByTime().labels,
    datasets: [
      {
        label: 'Số lượng sản phẩm đã bán',
        data: calculateSoldProductsByTime().data,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1
      }
    ]
  };

  // Cấu hình biểu đồ top sản phẩm bán chạy
  const topProductsData = {
    labels: calculateTopSellingProducts().labels,
    datasets: [
      {
        label: 'Số lượng đã bán',
        data: calculateTopSellingProducts().quantities,
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        borderColor: 'rgb(153, 102, 255)',
        borderWidth: 1
      }
    ]
  };

  // Cấu hình options cho biểu đồ top sản phẩm
  const topProductsOptions = {
    indexAxis: 'y',
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Top 10 sản phẩm bán chạy'
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Số lượng đã bán'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Sản phẩm'
          }
        }
    }
  };

  const overview = calculateOverview();

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
            {/* Nút quay lại */}
            <div className="mb-6">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition duration-300"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                <span>Quay lại Dashboard</span>
              </button>
            </div>

            {/* Tiêu đề chính */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 text-center">Thống kê</h1>
            </div>

            {/* Bộ lọc thời gian */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-wrap gap-4 items-end">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Khoảng thời gian
                  </label>
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="week">Tuần</option>
                    <option value="month">Tháng</option>
                    <option value="year">Năm</option>
                  </select>
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

            {/* Thông báo lỗi */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Thống kê tổng quan */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {overview.totalRevenue.toLocaleString()} VND
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <FontAwesomeIcon icon={faMoneyBillWave} className="text-green-600 text-xl" />
            </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tổng số đơn hàng</p>
                    <p className="text-2xl font-semibold text-gray-900">{overview.totalOrders}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <FontAwesomeIcon icon={faShoppingCart} className="text-blue-600 text-xl" />
                    </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Giá trị đơn hàng trung bình</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {overview.averageOrderValue.toLocaleString()} VND
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <FontAwesomeIcon icon={faChartLine} className="text-purple-600 text-xl" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tổng số sản phẩm đã bán</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {overview.totalSoldProducts.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <FontAwesomeIcon icon={faBox} className="text-red-600 text-xl" />
                    </div>
                </div>
              </div>
            </div>

            {/* Biểu đồ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">Doanh thu</h2>
                <Line data={revenueData} />
              </div>
              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">Số lượng đơn hàng</h2>
                <Bar data={ordersData} />
              </div>
              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">Số lượng sản phẩm đã bán</h2>
                <Bar data={soldProductsData} />
              </div>
              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">Top 10 sản phẩm bán chạy</h2>
                <Bar data={topProductsData} options={topProductsOptions} />
              </div>
            </div>

            {/* Bảng chi tiết top sản phẩm */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">Chi tiết top sản phẩm bán chạy</h2>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sản phẩm
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số lượng đã bán
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doanh thu
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {calculateTopSellingProducts().labels.map((name, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {calculateTopSellingProducts().quantities[index].toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {calculateTopSellingProducts().revenues[index].toLocaleString()} VND
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminCharts;