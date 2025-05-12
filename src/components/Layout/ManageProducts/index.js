import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';
import {
  faCircleXmark,
  faMagnifyingGlass,
  faArrowLeft,
  faPlus,
  faEye,
  faEdit,
  faTrash,
  faSpinner,
  faBox,
  faTag,
  faDollarSign,
  faHashtag,
  faImage
} from '@fortawesome/free-solid-svg-icons';

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
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
            ...(sessionStorage.getItem('token') && {
              Authorization: `Bearer ${sessionStorage.getItem('token')}`,
            }),
          },
        });

        console.log('Phản hồi API:', response.data);
        // Sort products by createdAt date in descending order (newest first)
        const sortedProducts = (debouncedSearch.trim() ? response.data.data : response.data)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setProducts(sortedProducts);
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
    setProductToDelete(productId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await axios.delete(`http://localhost:3001/v1/products/delete/${productToDelete}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      });

      if (response.data.message === 'Xóa sản phẩm thành công') {
        setProducts(products.filter((product) => product._id !== productToDelete));
        toast.success('Xóa sản phẩm thành công!');
      } else {
        throw new Error(response.data.message || 'Lỗi khi xóa sản phẩm');
      }
    } catch (err) {
      console.error('Lỗi khi xóa sản phẩm:', err);
      let errorMessage = 'Lỗi khi xóa sản phẩm. Vui lòng thử lại!';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!';
        navigate('/login');
      } else if (err.response?.status === 404) {
        errorMessage = 'Không tìm thấy sản phẩm!';
      }
      
      setError(errorMessage);
    } finally {
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const handleEditProduct = (productId) => {
    navigate(`/admin/products/edit/${productId}`);
  };

  const handleViewProduct = (productId) => {
    navigate(`/products/${productId}`);
  };

  const handleBackToDashboard = () => {
    navigate('/admin/dashboard');
  };

  const handleClearSearch = () => {
    setSearchValue('');
    setProducts([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
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
              <h1 className="text-3xl font-bold text-gray-900 text-center">Quản lý sản phẩm</h1>
            </div>

            {/* Search Bar và Nút thêm sản phẩm */}
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => navigate('/admin/add-product')}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-300"
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>Thêm sản phẩm</span>
              </button>

              <div className="relative w-full max-w-md">
                <input
                  value={searchValue}
                  className="w-full p-3 pl-10 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  spellCheck={false}
                  onChange={(e) => setSearchValue(e.target.value)}
                  aria-label="Tìm kiếm sản phẩm"
                />
                {!!searchValue && (
                  <button
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={handleClearSearch}
                  >
                    <FontAwesomeIcon icon={faCircleXmark} />
                  </button>
                )}
                <span className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500">
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                </span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                <FontAwesomeIcon icon={faCircleXmark} />
                <span>{error}</span>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-blue-500" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <FontAwesomeIcon icon={faBox} className="text-6xl text-gray-400 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-600 mb-2">Không có sản phẩm</h2>
                <p className="text-gray-500">
                  {searchValue ? 'Không tìm thấy sản phẩm phù hợp với từ khóa tìm kiếm.' : 'Chưa có sản phẩm nào trong hệ thống.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ảnh</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50 transition duration-150">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-12 w-12 flex-shrink-0">
                              {product.images && product.images.length > 0 ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.productName}
                                  className="h-12 w-12 rounded-lg object-cover"
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/48';
                                  }}
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                  <FontAwesomeIcon icon={faImage} className="text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                              <div className="text-sm text-gray-500 line-clamp-1">{product.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faTag} className="text-blue-500" />
                            <span className="text-sm text-gray-900">{product.type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faDollarSign} className="text-green-500" />
                            <span className="text-sm text-gray-900">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faHashtag} className="text-purple-500" />
                            <span className="text-sm text-gray-900">{product.quantity}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faImage} className="text-yellow-500" />
                            <span className="text-sm text-gray-900">{product.images?.length || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewProduct(product._id)}
                              className="text-blue-600 hover:text-blue-900 transition duration-300"
                              title="Xem chi tiết"
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                            <button
                              onClick={() => handleEditProduct(product._id)}
                              className="text-yellow-600 hover:text-yellow-900 transition duration-300"
                              title="Chỉnh sửa"
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              className="text-red-600 hover:text-red-900 transition duration-300"
                              title="Xóa sản phẩm"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-center mb-4">
              <FontAwesomeIcon icon={faTrash} className="text-4xl text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
              Xác nhận xóa
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-300"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;