import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    type: '',
    price: '',
    quantity: '',
  });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 5) {
      setError('Chỉ được upload tối đa 5 ảnh');
      return;
    }
    const oversized = selectedFiles.some((file) => file.size > 5 * 1024 * 1024);
    if (oversized) {
      setError('Mỗi ảnh không được vượt quá 5MB');
      return;
    }
    const invalidFile = selectedFiles.some((file) => !file.type.startsWith('image/'));
    if (invalidFile) {
      setError('Chỉ được upload file ảnh (jpg, png, v.v.)');
      return;
    }
    setFiles(selectedFiles);
    setError('');
  };

  const validateForm = () => {
    const trimmedData = {
      productName: formData.productName.trim(),
      description: formData.description.trim(),
      type: formData.type.trim(),
      price: formData.price,
      quantity: formData.quantity,
    };

    if (!trimmedData.productName) {
      return 'Vui lòng nhập tên sản phẩm';
    }
    if (!trimmedData.description) {
      return 'Vui lòng nhập mô tả';
    }
    if (!trimmedData.type) {
      return 'Vui lòng chọn loại sản phẩm';
    }
    if (!['cần câu', 'đồ câu', 'phụ kiện', 'mồi câu'].includes(trimmedData.type)) {
      return 'Loại sản phẩm phải là "cần câu", "đồ câu", "mồi câu" hoặc "phụ kiện"';
    }
    if (!trimmedData.price || Number(trimmedData.price) <= 0) {
      return 'Giá phải lớn hơn 0';
    }
    if (!trimmedData.quantity || Number(trimmedData.quantity) < 0) {
      return 'Số lượng không được âm';
    }
    if (files.length === 0) {
      return 'Vui lòng upload ít nhất một ảnh';
    }

    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('productName', formData.productName.trim());
      data.append('description', formData.description.trim());
      data.append('type', formData.type.trim());
      data.append('price', Number(formData.price));
      data.append('quantity', Number(formData.quantity));
      files.forEach((file) => {
        data.append('images', file);
      });

      const response = await axios.post(
        `http://localhost:3001/v1/products/create`,
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            // Nếu backend yêu cầu xác thực, bỏ comment và cung cấp token
            // Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setSuccess(response.data.message || 'Sản phẩm đã được thêm thành công!');
      setFormData({
        productName: '',
        description: '',
        type: '',
        price: '',
        quantity: '',
      });
      setFiles([]);
      document.getElementById('images').value = '';
    } catch (err) {
      let errorMessage = 'Lỗi khi thêm sản phẩm. Vui lòng thử lại!';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message.includes('File too large')) {
        errorMessage = 'File ảnh quá lớn (tối đa 5MB)';
      } else if (err.message.includes('Chỉ cho phép upload file ảnh')) {
        errorMessage = 'Chỉ được upload file ảnh';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  const handleBackToDashboard = () => {
    navigate('/admin');
  };
  return (
    
    <div className="max-w-4xl mx-auto mt-8 p-6 border border-gray-300 rounded-lg shadow-md">
      <button
          onClick={handleBackToDashboard}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Trở về
        </button>
      <h1 className="text-3xl font-semibold mb-6 text-center text-blue-600">Đăng Sản Phẩm Mới</h1>

      {error && (
        <div className="text-red-500 mb-4" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="text-green-500 mb-4" role="alert">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-4">
          <label htmlFor="productName" className="block text-lg mb-2">
            Tên sản phẩm
          </label>
          <input
            type="text"
            id="productName"
            name="productName"
            value={formData.productName}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-required="true"
            placeholder="Nhập tên sản phẩm (ví dụ: Cần câu Shimano)"
            maxLength="255"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="block text-lg mb-2">
            Mô tả
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            aria-required="true"
            placeholder="Nhập mô tả sản phẩm (ví dụ: Cần câu siêu nhẹ, dài 2.4m)"
            maxLength="1000"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="type" className="block text-lg mb-2">
            Loại sản phẩm
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-required="true"
          >
            <option value="" disabled>
              Chọn loại sản phẩm
            </option>
            <option value="cần câu">Cần câu</option>
            <option value="đồ câu">Đồ câu</option>
            <option value="phụ kiện">Phụ kiện</option>
            <option value="mồi câu">Mồi câu</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="price" className="block text-lg mb-2">
            Giá (VND)
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-required="true"
            placeholder="Nhập giá sản phẩm (ví dụ: 999.99)"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="quantity" className="block text-lg mb-2">
            Số lượng
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleInputChange}
            min="0"
            step="1"
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-required="true"
            placeholder="Nhập số lượng (ví dụ: 10)"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="images" className="block text-lg mb-2">
            Hình ảnh (Tối đa 5 ảnh)
          </label>
          <input
            type="file"
            id="images"
            name="images"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-required="true"
          />
          {files.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">Đã chọn {files.length} ảnh:</p>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {files.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300 disabled:bg-blue-300"
          disabled={loading}
        >
          {loading ? 'Đang xử lý...' : 'Thêm Sản Phẩm'}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;