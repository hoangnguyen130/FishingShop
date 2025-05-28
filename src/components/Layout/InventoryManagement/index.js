import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faEdit, faTrash, faSearch, faArrowLeft, faStore, faTag, faPercent } from '@fortawesome/free-solid-svg-icons';
import ChatContainer from '../ChatContainer';
import { Link, useNavigate } from 'react-router-dom';

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

function InventoryManagement() {
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
    fetchProductsAndSales();
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

  const fetchProductsAndSales = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = sessionStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập để xem trang này!');
        navigate('/sign-in');
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`
      };

      // Fetch products
      const productsResponse = await axios.get('http://localhost:3001/v1/products/get', { headers });
      const productsData = productsResponse.data;

      // Fetch sales data
      const salesResponse = await axios.get('http://localhost:3001/v1/orders/admin', { headers });
      const salesData = salesResponse.data;

      // Calculate total sales for each product
      const productSales = {};
      salesData.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            if (item.productId) {
              const productId = item.productId.toString();
              if (!productSales[productId]) {
                productSales[productId] = 0;
              }
              productSales[productId] += parseInt(item.quantity, 10);
            }
          });
        }
      });

      // Combine product data with sales data
      const combinedData = productsData.map(product => ({
        ...product,
        soldQuantity: productSales[product._id.toString()] || 0
      })).filter(product => product.soldQuantity < 10);

      setProducts(combinedData);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
        navigate('/sign-in');
      } else {
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        toast.error('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    setProductToDelete(productId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const token = sessionStorage.getItem('token');
      await axios.delete(`http://localhost:3001/v1/products/${productToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Xóa sản phẩm thành công!');
      setShowDeleteModal(false);
      setProductToDelete(null);
      fetchProductsAndSales();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi xóa sản phẩm. Vui lòng thử lại!';
      toast.error(errorMessage);
    }
  };

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
      fetchProductsAndSales(); // Refresh the product list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể áp dụng giảm giá');
    }
  };

  const openDiscountModal = (product) => {
    setSelectedProduct(product);
    setShowDiscountModal(true);
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
              <div className="flex items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Quản lý hàng tồn kho</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Danh sách sản phẩm bán chậm (dưới 10 sản phẩm)
                  </p>
                </div>
              </div>
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Tìm kiếm sản phẩm..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-48">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tất cả loại</option>
                    {productTypes.map((type) => (
                      <option key={type._id} value={type.typeName}>
                        {type.typeName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {loading ? (
              <LoadingSpinner />
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <FontAwesomeIcon icon={faBox} className="text-6xl text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">Không có sản phẩm nào</h3>
                <p className="text-gray-600">Không tìm thấy sản phẩm nào bán chậm (dưới 10 sản phẩm).</p>
              </div>
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
                          Tồn kho
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Đã bán
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tổng
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Loại
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
                                <div className="text-sm font-medium text-gray-900">
                                  {product.productName}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{product.quantity}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-red-500 font-medium">{product.soldQuantity}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {product.quantity + product.soldQuantity}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{product.type}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => openDiscountModal(product)}
                              className="text-green-600 hover:text-green-900 mr-4"
                              title="Áp dụng giảm giá"
                            >
                              <FontAwesomeIcon icon={faTag} />
                            </button>
                            <Link
                              to={`/admin/products/edit/${product._id}`}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </Link>
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Áp dụng giảm giá cho {selectedProduct?.productName}
              </h3>
              <div className="mt-2 px-7 py-3">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phần trăm giảm giá
                  </label>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[10, 20, 30, 50].map((percent) => (
                      <button
                        key={percent}
                        onClick={() => setDiscountPercentage(percent.toString())}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          discountPercentage === percent.toString()
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {percent}%
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Hoặc nhập phần trăm giảm giá"
                    min="1"
                    max="100"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 px-7 py-3">
                <button
                  onClick={() => {
                    setShowDiscountModal(false);
                    setDiscountPercentage('');
                    setSelectedProduct(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Hủy
                </button>
                <button
                  onClick={handleApplyDiscount}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Áp dụng
                </button>
              </div>
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
    </ChatContainer>
  );
}

export default InventoryManagement; 