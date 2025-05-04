import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(1); // Số lượng thêm vào giỏ hàng
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch chi tiết sản phẩm từ API
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`http://localhost:3001/v1/products/get/${id}`);
        console.log('Phản hồi API sản phẩm:', response.data);
        setProduct(response.data.product);
      } catch (err) {
        console.error('Lỗi API:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          code: err.code,
        });

        let errorMessage = 'Lỗi khi lấy chi tiết sản phẩm. Vui lòng thử lại!';
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response?.status === 401) {
          errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!';
          localStorage.removeItem('token');
          navigate('/sign-in');
        } else if (err.response?.status === 404) {
          errorMessage = 'Không tìm thấy sản phẩm. Vui lòng thử sản phẩm khác!';
        } else if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
          errorMessage = 'Không kết nối được tới server. Vui lòng kiểm tra backend!';
        }
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  // Hàm xử lý thay đổi số lượng
  const handleQuantityChange = (e) => {
    const value = Number(e.target.value);
    if (value >= 1) {
      setCartQuantity(value);
    } else {
      toast.error('Số lượng phải lớn hơn hoặc bằng 1!');
    }
  };

  // Hàm thêm sản phẩm vào giỏ hàng
  const handleAddToCart = async () => {
    if (!product) {
      toast.error('Không có sản phẩm để thêm!');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng!');
      navigate('/sign-in');
      return;
    }

    try {
      console.log('Gửi request thêm giỏ hàng:', {
        productId: product.productId,
        quantity: cartQuantity,
        token,
      });
      const response = await axios.post(
        'http://localhost:3001/v1/products/cart/add',
        {
          productId: product.productId,
          quantity: cartQuantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Phản hồi API giỏ hàng:', response.data);
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

  // Hàm quay lại trang chủ
  const handleBack = () => {
    navigate('/');
  };

  // Hàm điều hướng đến giỏ hàng
  const handleGoToCart = () => {
    navigate('/cart');
  };

  if (loading) {
    return <div className="text-center text-gray-600 mt-20">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-20 p-6 border border-gray-300 rounded-lg shadow-md">
        <div className="text-red-500 text-center" role="alert">{error}</div>
        <div className="text-center mt-4">
          <button
            onClick={handleBack}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto mt-20 p-6 border border-gray-300 rounded-lg shadow-md">
        <div className="text-gray-600 text-center">Không tìm thấy sản phẩm.</div>
        <div className="text-center mt-4">
          <button
            onClick={handleBack}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 border border-gray-300 rounded-lg shadow-md">
      <h1 className="text-3xl font-semibold text-center text-blue-600 mb-6">{product.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ảnh sản phẩm */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Hình ảnh sản phẩm</h2>
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-auto h-auto object-cover rounded-md"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/150';
                console.error('Failed to load image:', product.image);
              }}
            />
          ) : (
            <div className="text-gray-600">Không có ảnh.</div>
          )}
        </div>

        {/* Thông tin sản phẩm */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Thông tin chi tiết</h2>
          <div className="space-y-4">
            <p>
              <span className="font-semibold">Tên sản phẩm:</span> {product.name}
            </p>
            <p>
              <span className="font-semibold">Mô tả:</span> {product.description || 'Không có mô tả.'}
            </p>
            <p>
              <span className="font-semibold">Giá:</span> {product.price.toLocaleString()} VND
            </p>
            <div className="flex items-center gap-2">
              <label className="text-gray-600">Số lượng:</label>
              <input
                type="number"
                min="1"
                value={cartQuantity}
                onChange={handleQuantityChange}
                className="w-16 p-1 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-6 flex justify-center gap-4">
        <button
          onClick={handleBack}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Quay lại
        </button>
        <button
          onClick={handleAddToCart}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300"
        >
          Thêm vào giỏ hàng
        </button>
        <button
          onClick={handleGoToCart}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition duration-300"
        >
          Đi đến giỏ hàng
        </button>
      </div>
    </div>
  );
}

export default ProductDetail;