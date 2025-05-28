import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faSearch, faArrowLeft, faTag, faPercent } from '@fortawesome/free-solid-svg-icons';
import ChatContainer from '../ChatContainer';

const LoadingSpinner = () => (
  <div className="text-center text-gray-600">
    <svg
      className="animate-spin h-8 w-8 mx-auto text-blue-500"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
      ></path>
    </svg>
    <p className="mt-2">Đang tải dữ liệu...</p>
  </div>
);

const ManageDiscountedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [productTypes, setProductTypes] = useState([]);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchProductTypes();
  }, []);

  const fetchProductTypes = async () => {
    try {
      const response = await axios.get('http://localhost:3001/v1/products/types');
      setProductTypes(response.data.data || []);
    } catch (err) {
      console.error('Error fetching product types:', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:3001/v1/products/get');
      if (!Array.isArray(response.data)) {
        throw new Error('Dữ liệu sản phẩm không hợp lệ!');
      }
      // Only show discounted products
      const discounted = response.data.filter(p => p.discountPercentage && p.discountPercentage > 0);
      setProducts(discounted);
      if (discounted.length === 0) {
        setError('Không có sản phẩm giảm giá nào để hiển thị.');
        toast.warn('Không có sản phẩm giảm giá nào để hiển thị.');
      }
    } catch (err) {
      setError('Lỗi khi lấy danh sách sản phẩm. Vui lòng thử lại!');
      toast.error('Lỗi khi lấy danh sách sản phẩm. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async (id) => {
    setProductToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:3001/v1/products/delete/${productToDelete}`);
      toast.success('Đã xóa sản phẩm!');
      setShowDeleteModal(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (err) {
      toast.error('Lỗi khi xóa sản phẩm. Vui lòng thử lại!');
    }
  };

  const getImageSrc = (images) => {
    if (Array.isArray(images) && images.length > 0) return images[0];
    if (typeof images === 'string') return images;
    return 'https://via.placeholder.com/150';
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || product.typeName === selectedType;
    return matchesSearch && matchesType;
  });

  const handleApplyDiscount = async () => {
    if (!selectedProduct || !discountPercentage) {
      toast.error('Vui lòng nhập phần trăm giảm giá');
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3001/v1/products/discount',
        {
          productId: selectedProduct._id,
          discountPercentage: parseInt(discountPercentage)
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Áp dụng giảm giá thành công!');
      setShowDiscountModal(false);
      setDiscountPercentage('');
      setSelectedProduct(null);
      fetchProducts(); // Refresh the product list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể áp dụng giảm giá');
    }
  };

  const openDiscountModal = (product) => {
    setSelectedProduct(product);
    setShowDiscountModal(true);
  };

  return (
    <ChatContainer>
      <div className="flex mt-20">
        <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto bg-gray-100">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition duration-300 mb-4"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                <span>Quay lại Dashboard</span>
              </button>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Quản lý sản phẩm giảm giá</h1>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
                </div>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tất cả loại sản phẩm</option>
                  {productTypes.map((type) => (
                    <option key={type._id} value={type.typeName}>
                      {type.typeName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="text-red-500 mb-4 text-sm sm:text-base" role="alert">
                {error}
              </div>
            )}

            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sản phẩm
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Giá gốc
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Giá giảm
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phần trăm giảm
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredProducts.map((product) => (
                        <tr key={product._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={getImageSrc(product.images)}
                                  alt={product.productName}
                                  onError={(e) => (e.target.src = 'https://via.placeholder.com/150')}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.price.toLocaleString()} VND
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 font-bold">
                            {product.discountedPrice ? product.discountedPrice.toLocaleString() : ''} VND
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">
                            -{product.discountPercentage}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => openDiscountModal(product)}
                              className="mr-3 text-green-500 hover:text-green-700 bg-green-100 p-2 rounded-full"
                              title="Sửa giảm giá"
                            >
                              <FontAwesomeIcon icon={faPercent} size="lg" />
                            </button>
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="text-red-500 hover:text-red-700 bg-red-100 p-2 rounded-full"
                              title="Xóa"
                            >
                              <FontAwesomeIcon icon={faTrash} size="lg" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Discount Modal */}
            {showDiscountModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h2 className="text-xl font-bold mb-4">Sửa phần trăm giảm giá</h2>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {[10, 20, 30, 50].map((discount) => (
                      <button
                        key={discount}
                        onClick={() => setDiscountPercentage(discount.toString())}
                        className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                      >
                        {discount}%
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    placeholder="Nhập phần trăm giảm giá"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowDiscountModal(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg mr-2"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleApplyDiscount}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                    >
                      Áp dụng
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h2 className="text-xl font-bold mb-4">Xác nhận xóa</h2>
                  <p className="mb-4">Bạn có chắc chắn muốn xóa sản phẩm này không?</p>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg mr-2"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={confirmDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ChatContainer>
  );
};

export default ManageDiscountedProducts; 