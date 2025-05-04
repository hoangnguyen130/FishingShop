import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Giả định hàm kiểm tra quyền admin (thay bằng logic thực tế, e.g., kiểm tra JWT)
  const isAdmin = () => {
    const token = localStorage.getItem('token'); // Ví dụ: Lấy token từ localStorage
    return token; // Thay bằng logic xác thực thực tế
  };

  // useEffect(() => {
  //   if (!isAdmin()) {
  //     navigate('/login');
  //   }
  // }, [navigate]);

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 border border-gray-300 rounded-lg shadow-md">
      <h1 className="text-3xl font-semibold mb-6 text-center text-blue-600">Admin Dashboard</h1>

      <div className="space-y-4">
        <Link to="/admin/add-product">
          <button className="w-full mb-4 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300">
            Đăng Sản Phẩm
          </button>
        </Link>

        <Link to="/admin/products">
          <button className="w-full mb-4 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition duration-300">
            Quản lý Sản Phẩm
          </button>
        </Link>

        <Link to="/admin/orders">
          <button className="w-full mb-4 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition duration-300">
            Đơn hàng
          </button>
        </Link>
        <Link to="/admin/charts">
          <button className="w-full mb-4 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition duration-300">
            Thống kê
          </button>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;