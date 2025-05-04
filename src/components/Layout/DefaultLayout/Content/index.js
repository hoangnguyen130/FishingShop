import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faShoppingCart } from '@fortawesome/free-solid-svg-icons';

function Content() {
  const [products, setProducts] = useState({
    canCau: [],
    doCau: [],
    phuKien: [],
    moiCau: [],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch dữ liệu sản phẩm từ API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get('http://localhost:3001/v1/products/get');

        if (!Array.isArray(response.data)) {
          throw new Error('Dữ liệu sản phẩm không hợp lệ!');
        }

        // Phân loại sản phẩm theo type
        const canCau = response.data.filter((product) => product.type === 'cần câu');
        const doCau = response.data.filter((product) => product.type === 'đồ câu');
        const phuKien = response.data.filter((product) => product.type === 'phụ kiện');
        const moiCau = response.data.filter((product) => product.type === 'mồi câu');

        setProducts({
          canCau,
          doCau,
          phuKien,
          moiCau,
        });

        // Kiểm tra nếu tất cả danh mục rỗng
        if (canCau.length === 0 && doCau.length === 0 && phuKien.length === 0 && moiCau.length === 0) {
          setError('Không có sản phẩm nào để hiển thị.');
          toast.warn('Không có sản phẩm nào để hiển thị.');
        }
      } catch (err) {
        console.error('Lỗi API:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });

        let errorMessage = 'Lỗi khi lấy danh sách sản phẩm. Vui lòng thử lại!';
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response?.status === 401) {
          errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!';
          localStorage.removeItem('token');
          navigate('/sign-in');
        } else if (err.response?.status === 404) {
          errorMessage = 'Endpoint không tồn tại. Kiểm tra URL API!';
        } else if (err.code === 'ECONNREFUSED') {
          errorMessage = 'Không kết nối được tới server. Vui lòng kiểm tra backend!';
        } else if (err.message.includes('CORS')) {
          errorMessage = 'Lỗi CORS: Backend không cho phép request từ frontend!';
        }
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [navigate]);

  // Hàm điều hướng đến trang chi tiết sản phẩm
  const handleProductClick = (id) => {
    navigate(`/products/${id}`);
  };

  // Hàm thêm sản phẩm vào giỏ hàng
  const handleAddToCart = async (productId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng!');
      navigate('/sign-in');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:3001/v1/products/cart/add',
        {
          productId,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Phản hồi API thêm vào giỏ hàng:', response.data);
      toast.success('Đã thêm sản phẩm vào giỏ hàng!');
    } catch (err) {
      console.error('Lỗi khi thêm vào giỏ hàng:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        code: err.code,
      });

      let errorMessage = 'Lỗi khi thêm vào giỏ hàng. Vui lòng thử lại!';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
        if (err.response.data.message.includes('productId không hợp lệ')) {
          errorMessage = 'Sản phẩm không hợp lệ. Vui lòng kiểm tra lại!';
        }
      } else if (err.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!';
        localStorage.removeItem('token');
        navigate('/sign-in');
      } else if (err.response?.status === 404) {
        errorMessage = 'Sản phẩm không tồn tại!';
      } else if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
        errorMessage = 'Không kết nối được tới server. Vui lòng kiểm tra backend!';
      }
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex pt-20">
      <div className="w-64 text-black p-6 fixed top-16 left-0 h-full z-50 transition-transform transform hover:translate-x-0 duration-300 ease-in-out">
        <h2 className="text-2xl font-semibold mb-8 text-center text-black">Menu</h2>
        <ul className="w-full space-y-4">
          <li className="w-full">
            <a href="#home" className="text-lg w-full hover:text-blue-400 transition duration-200 transform hover:scale-105 text-black py-2 px-4 rounded-md">
              Trang chủ
            </a>
          </li>
          <li>
            <a href="#cancau" className="text-lg hover:text-blue-400 transition duration-200 transform hover:scale-105 text-black py-2 px-4 rounded-md">
              Cần câu chính hãng
            </a>
          </li>
          <li>
            <a href="#docau" className="text-lg hover:text-blue-400 transition duration-200 transform hover:scale-105 text-black py-2 px-4 rounded-md">
              Đồ câu cá
            </a>
          </li>
          <li>
            <a href="#phukien" className="text-lg hover:text-blue-400 transition duration-200 transform hover:scale-105 text-black py-2 px-4 rounded-md">
              Phụ kiện
            </a>
          </li>
          <li>
            <a href="#moicau" className="text-lg hover:text-blue-400 transition duration-200 transform hover:scale-105 text-black py-2 px-4 rounded-md">
              Mồi câu
            </a>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 pl-80 overflow-y-auto bg-gray-100">
        {error && (
          <div className="text-red-500 mb-4" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-600">Đang tải dữ liệu...</div>
        ) : (
          <>
            <div id="cancau" className="mb-8">
              <h2 className="text-3xl font-semibold text-gray-800 mb-6">Cần câu chính hãng</h2>
              {products.canCau.length === 0 ? (
                <div className="text-center text-gray-600">Không có sản phẩm nào.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.canCau.map((product) => (
                    <div
                      key={product._id}
                      className="bg-white p-6 rounded-lg shadow-xl hover:scale-105 transform transition duration-300 hover:shadow-2xl relative cursor-pointer"
                    >
                      <img
                        onClick={() => handleProductClick(product._id)}
                        src={Array.isArray(product.images) ? product.images[0] : product.images}
                        alt={product.productName}
                        className="w-full h-48 object-cover rounded-md mb-4"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150';
                          console.error('Failed to load image:', product.images);
                        }}
                      />
                      <h3
                        onClick={() => handleProductClick(product._id)}
                        className="min-h-14 text-xl font-semibold text-gray-800 cursor-pointer hover:text-blue-500"
                        
                      >
                        {product.productName}
                      </h3>
                      <div className='flex'>
                        <p className="pr-12 text-xl font-bold text-blue-500 mt-2">{product.price.toLocaleString()} VND</p>
                        <button
                          onClick={() => handleAddToCart(product._id)}
                          className=" text-black hover:text-red-600 transition duration-300"
                          title="Thêm vào giỏ hàng"
                        >
                          <FontAwesomeIcon icon={faCartShopping} size="2xl"/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div id="docau" className="mb-8">
              <h2 className="text-3xl font-semibold text-gray-800 mb-6">Đồ câu cá</h2>
              {products.doCau.length === 0 ? (
                <div className="text-center text-gray-600">Không có sản phẩm nào.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.doCau.map((product) => (
                    <div
                      key={product._id}
                      className="bg-white p-6 rounded-lg shadow-xl hover:scale-105 transform transition duration-300 hover:shadow-2xl relative cursor-pointer"
                    >
                      <img
                        onClick={() => handleProductClick(product._id)}
                        src={Array.isArray(product.images) ? product.images[0] : product.images}
                        alt={product.productName}
                        className="w-full h-48 object-cover rounded-md mb-4"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150';
                          console.error('Failed to load image:', product.images);
                        }}
                      />
                      <h3
                        onClick={() => handleProductClick(product._id)}
                        className="min-h-14 text-xl font-semibold text-gray-800 cursor-pointer hover:text-blue-500"
                      >
                        {product.productName}
                      </h3>
                      <div className='flex'>
                        <p className="pr-14 text-xl font-bold text-blue-500 mt-2">{product.price.toLocaleString()} VND</p>
                        <button
                          onClick={() => handleAddToCart(product._id)}
                          className="text-black hover:text-red-600 transition duration-300"
                          title="Thêm vào giỏ hàng"
                        >
                          <FontAwesomeIcon icon={faShoppingCart} size="2xl" />
                        </button>
                      </div>
                      </div>
                  ))}
                </div>
              )}
            </div>

            <div id="phukien" className="mb-8">
              <h2 className="text-3xl font-semibold text-gray-800 mb-6">Phụ kiện</h2>
              {products.phuKien.length === 0 ? (
                <div className="text-center text-gray-600">Không có sản phẩm nào.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.phuKien.map((product) => (
                    <div
                      key={product._id}
                      className="bg-white p-6 rounded-lg shadow-xl hover:scale-105 transform transition duration-300 hover:shadow-2xl relative cursor-pointer"
                    >
                      <img
                        onClick={() => handleProductClick(product._id)}
                        src={Array.isArray(product.images) ? product.images[0] : product.images}
                        alt={product.productName}
                        className="w-full h-48 object-cover rounded-md mb-4"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150';
                          console.error('Failed to load image:', product.images);
                        }}
                      />
                      <h3
                        onClick={() => handleProductClick(product._id)}
                        className="min-h-14 text-xl font-semibold text-gray-800 cursor-pointer hover:text-blue-500"
                      >
                        {product.productName}
                      </h3>
                      <div className='flex'>
                        <p className="pr-14 text-xl font-bold text-blue-500 mt-2">{product.price.toLocaleString()} VND</p>
                        <button
                          onClick={() => handleAddToCart(product._id)}
                          className="text-black hover:text-red-600 transition duration-300"
                          title="Thêm vào giỏ hàng"
                        >
                          <FontAwesomeIcon icon={faShoppingCart} size="2xl" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div id="moicau" className="mb-8">
              <h2 className="text-3xl font-semibold text-gray-800 mb-6">Mồi câu</h2>
              {products.moiCau.length === 0 ? (
                <div className="text-center text-gray-600">Không có sản phẩm nào.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.moiCau.map((product) => (
                    <div
                      key={product._id}
                      className="bg-white p-6 rounded-lg shadow-xl hover:scale-105 transform transition duration-300 hover:shadow-2xl relative cursor-pointer"
                    >
                      <img
                        onClick={() => handleProductClick(product._id)}
                        src={Array.isArray(product.images) ? product.images[0] : product.images}
                        alt={product.productName}
                        className="w-full h-48 object-cover rounded-md mb-4"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150';
                          console.error('Failed to load image:', product.images);
                        }}
                      />
                      <h3
                        onClick={() => handleProductClick(product._id)}
                        className="min-h-14 text-xl font-semibold text-gray-800 cursor-pointer hover:text-blue-500"
                      >
                        {product.productName}
                      </h3>
                      <div className='flex'>
                        <p className="pr-14 text-xl font-bold text-blue-500 mt-2">{product.price.toLocaleString()} VND</p>
                        <button
                          onClick={() => handleAddToCart(product._id)}
                          className="text-black hover:text-red-600 transition duration-300"
                          title="Thêm vào giỏ hàng"
                        >
                          <FontAwesomeIcon icon={faShoppingCart} size="2xl" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Content;