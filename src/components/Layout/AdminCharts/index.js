import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function ChartsAdmin() {
  const [productStats, setProductStats] = useState([]);
  const [revenueStats, setRevenueStats] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format, default to current month
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Lấy danh sách đơn hàng cho thống kê
  const fetchOrders = async (month) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Vui lòng đăng nhập để xem thống kê');
      toast.error('Vui lòng đăng nhập để xem thống kê');
      setTimeout(() => navigate('/sign-in'), 2000);
      return;
    }

    setLoading(true);
    setError('');
    try {
      // Tính ngày bắt đầu và kết thúc của tháng được chọn
      const [year, monthIndex] = month.split('-').map(Number);
      const startDate = new Date(year, monthIndex - 1, 1); // First day of the month
      const endDate = new Date(year, monthIndex, 0); // Last day of the month

      const url = `http://localhost:3001/v1/orders/admin?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
      console.log('Gọi API thống kê:', url);
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Phản hồi API:', response.data);
      if (!Array.isArray(response.data)) {
        throw new Error('Dữ liệu đơn hàng không hợp lệ');
      }

      // Tạo danh sách các ngày trong tháng
      const daysInMonth = endDate.getDate();
      const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

      // Tính toán thống kê sản phẩm bán ra theo ngày
      const productDaily = Array(daysInMonth).fill(0);
      response.data.forEach(order => {
        const orderDate = new Date(order.createdAt);
        const dayIndex = orderDate.getDate() - 1; // 0-based index for array
        if (dayIndex >= 0 && dayIndex < daysInMonth) {
          order.items.forEach(item => {
            if (item.quantity && Number.isInteger(item.quantity) && item.quantity > 0) {
              productDaily[dayIndex] += item.quantity;
            }
          });
        }
      });
      setProductStats(productDaily);

      // Tính toán thống kê doanh thu theo ngày
      const revenueDaily = Array(daysInMonth).fill(0);
      response.data.forEach(order => {
        const orderDate = new Date(order.createdAt);
        const dayIndex = orderDate.getDate() - 1;
        if (dayIndex >= 0 && dayIndex < daysInMonth && typeof order.total === 'number' && order.total > 0) {
          revenueDaily[dayIndex] += order.total;
        }
      });
      setRevenueStats(revenueDaily);
    } catch (err) {
      console.error('Lỗi API:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      let errorMessage = 'Lỗi khi lấy dữ liệu thống kê';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!';
        localStorage.removeItem('token');
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

  // Gọi API khi component mount hoặc tháng thay đổi
  useEffect(() => {
    fetchOrders(selectedMonth);
  }, [selectedMonth, navigate]);

  // Xử lý thay đổi tháng
  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  // Tạo danh sách tháng cho dropdown (12 tháng gần nhất)
  const getMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const value = date.toISOString().slice(0, 7); // YYYY-MM
      const label = date.toLocaleString('vi-VN', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }
    return options;
  };

  // Tạo nhãn ngày (e.g., "1", "2", ..., "31")
  const dayLabels = productStats.length > 0 ? Array.from({ length: productStats.length }, (_, i) => (i + 1).toString()) : [];

  // Dữ liệu cho biểu đồ sản phẩm bán ra
  const productChartData = {
    labels: dayLabels,
    datasets: [
      {
        label: 'Số lượng sản phẩm bán ra',
        data: productStats,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Dữ liệu cho biểu đồ doanh thu
  const revenueChartData = {
    labels: dayLabels,
    datasets: [
      {
        label: 'Doanh thu (VND)',
        data: revenueStats,
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Tùy chọn cho biểu đồ
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} ${context.dataset.label === 'Doanh thu (VND)' ? 'VND' : 'sản phẩm'}`;
          },
        },
      },
      title: {
        display: true,
        text: `Thống kê - ${new Date(selectedMonth).toLocaleString('vi-VN', { month: 'long', year: 'numeric' })}`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Số lượng / Doanh thu',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Ngày',
        },
      },
    },
  };

  if (loading) {
    return <div className="text-center">Đang tải...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 p-6 border border-gray-300 rounded-lg shadow-md">
      <h1 className="text-3xl font-semibold text-center text-blue-600 mb-6">Thống kê doanh thu</h1>
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
      <div className="mb-4">
        <label htmlFor="monthSelect" className="block text-lg font-semibold text-gray-700 mb-2">
          Chọn tháng:
        </label>
        <select
          id="monthSelect"
          value={selectedMonth}
          onChange={handleMonthChange}
          className="w-full p-2 border border-gray-300 rounded-lg"
        >
          {getMonthOptions().map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Tổng số lượng sản phẩm bán ra theo ngày</h3>
          {productStats.length > 0 && productStats.some(val => val > 0) ? (
            <Bar data={productChartData} options={chartOptions} />
          ) : (
            <p className="text-gray-600">Chưa có dữ liệu sản phẩm bán ra.</p>
          )}
        </div>
        <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Tổng doanh thu theo ngày</h3>
          {revenueStats.length > 0 && revenueStats.some(val => val > 0) ? (
            <Bar data={revenueChartData} options={chartOptions} />
          ) : (
            <p className="text-gray-600">Chưa có dữ liệu doanh thu.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChartsAdmin;