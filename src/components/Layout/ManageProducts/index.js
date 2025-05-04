import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import slugify from 'slugify';

// Custom debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();

  const debouncedSearch = useDebounce(searchValue, 700);

  // Fetch products (initial load or search)
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const url = debouncedSearch.trim()
          ? 'http://localhost:3001/v1/products/search'
          : 'http://localhost:3001/v1/products/get';
        const response = await axios.get(url, {
          params: debouncedSearch.trim() ? { q: debouncedSearch } : {},
          headers: {
            ...(localStorage.getItem('token') && {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            }),
          },
        });

        console.log('Phản hồi API:', response.data);
        setProducts(debouncedSearch.trim() ? response.data.data : response.data);
      } catch (err) {
        console.error('Lỗi API:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });

        let errorMessage = 'Lỗi khi lấy danh sách sản phẩm. Vui lòng thử lại!';
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.code === 'ECONNREFUSED') {
          errorMessage = 'Không kết nối được tới server. Vui lòng kiểm tra backend!';
        } else if (err.response?.status === 404) {
          errorMessage = 'Endpoint không tồn tại. Kiểm tra URL API!';
        } else if (err.response?.status === 401) {
          errorMessage = 'Token không hợp lệ hoặc thiếu. Vui lòng đăng nhập lại!';
          navigate('/login');
        } else if (err.response?.status === 500) {
          errorMessage = 'Lỗi server: Kiểm tra cấu hình backend!';
        } else if (err.message.includes('CORS')) {
          errorMessage = 'Lỗi CORS: Backend không cho phép request từ frontend!';
        }
        setError(errorMessage);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [debouncedSearch, navigate]);

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

    try {
      await axios.delete('http://localhost:3001/delete', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        data: { productId },
      });
      setProducts(products.filter((product) => product._id !== productId));
      alert('Xóa sản phẩm thành công!');
    } catch (err) {
      console.error('Lỗi khi xóa sản phẩm:', err);
      setError('Lỗi khi xóa sản phẩm. Vui lòng thử lại!');
    }
  };

  const handleEditProduct = (productId) => {
    navigate(`/admin/products/edit/${productId}`);
  };

  const handleViewProduct = (productId) => {
    navigate(`/products/${productId}`);
  };

  const handleBackToDashboard = () => {
    navigate('/admin');
  };

  const handleClearSearch = () => {
    setSearchValue('');
    setProducts([]);
  };

  return (
    <div className="max-w-6xl mx-auto mt-8 p-6 border border-gray-300 rounded-lg shadow-md">
      <button
        onClick={handleBackToDashboard}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300 mb-4"
      >
        Trở về
      </button>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-center text-blue-600">Quản Lý Sản Phẩm</h1>
        <button
          onClick={() => navigate('/admin/add-product')}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300"
        >
          Thêm Sản Phẩm
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-md mb-6">
        <input
          value={searchValue}
          className="w-full p-2 pl-10 pr-16 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          spellCheck={false}
          onChange={(e) => setSearchValue(e.target.value)}
          aria-label="Tìm kiếm sản phẩm"
        />
        {!!searchValue && (
          <button
            className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={handleClearSearch}
          >
            <FontAwesomeIcon icon={faCircleXmark} />
          </button>
        )}
        <span className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </span>
      </div>

      {error && (
        <div className="text-red-500 mb-4 p-4 bg-red-100 rounded-lg" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-600 py-4">Đang tải dữ liệu...</div>
      ) : products.length === 0 ? (
        <div className="text-center text-gray-600 py-4">Không có sản phẩm nào.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-blue-100">
                <th className="border border-gray-300 p-3 text-left text-sm font-semibold">Tên sản phẩm</th>
                <th className="border border-gray-300 p-3 text-left text-sm font-semibold">Mô tả</th>
                <th className="border border-gray-300 p-3 text-left text-sm font-semibold">Loại</th>
                <th className="border border-gray-300 p-3 text-left text-sm font-semibold">Giá (VND)</th>
                <th className="border border-gray-300 p-3 text-left text-sm font-semibold">Số lượng</th>
                <th className="border border-gray-300 p-3 text-left text-sm font-semibold">Ảnh</th>
                <th className="border border-gray-300 p-3 text-left text-sm font-semibold">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-3 text-sm">{product.productName}</td>
                  <td className="border border-gray-300 p-3 text-sm">
                    {product.description.length > 50
                      ? `${product.description.slice(0, 50)}...`
                      : product.description}
                  </td>
                  <td className="border border-gray-300 p-3 text-sm">{product.type}</td>
                  <td className="border border-gray-300 p-3 text-sm">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                  </td>
                  <td className="border border-gray-300 p-3 text-sm">{product.quantity}</td>
                  <td className="border border-gray-300 p-3">
                    {product.images && product.images.length > 0 ? (
                      <div className="flex gap-2">
                        {product.images.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Product ${index}`}
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/64';
                              console.error('Failed to load image:', url);
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500">Không có ảnh</span>
                    )}
                  </td>
                  <td className="border border-gray-300 p-3 flex gap-2">
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition duration-300 text-sm"
                      onClick={() => handleViewProduct(product._id)}
                    >
                      Xem
                    </button>
                    <button
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition duration-300 text-sm"
                      onClick={() => handleEditProduct(product._id)}
                    >
                      Sửa
                    </button>
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-300 text-sm"
                      onClick={() => handleDeleteProduct(product._id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;