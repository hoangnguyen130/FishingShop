import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faImage,
  faUpload,
  faSpinner,
  faCheck,
  faTimes,
  faBox,
  faTag,
  faInfoCircle,
  faDollarSign,
  faHashtag
} from '@fortawesome/free-solid-svg-icons';

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
  const [loading, setLoading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);
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
      toast.warning('Chỉ được upload tối đa 5 ảnh');
      setError('Chỉ được upload tối đa 5 ảnh');
      return;
    }
    const oversized = selectedFiles.some((file) => file.size > 5 * 1024 * 1024);
    if (oversized) {
      toast.warning('Mỗi ảnh không được vượt quá 5MB');
      setError('Mỗi ảnh không được vượt quá 5MB');
      return;
    }
    const invalidFile = selectedFiles.some((file) => !file.type.startsWith('image/'));
    if (invalidFile) {
      toast.warning('Chỉ được upload file ảnh (jpg, png, v.v.)');
      setError('Chỉ được upload file ảnh (jpg, png, v.v.)');
      return;
    }
    setFiles(selectedFiles);
    setError('');

    // Create preview URLs
    const urls = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const removeImage = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);

    const newUrls = [...previewUrls];
    URL.revokeObjectURL(newUrls[index]);
    newUrls.splice(index, 1);
    setPreviewUrls(newUrls);
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

    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
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
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
          },
        }
      );

      toast.success('Sản phẩm đã được thêm thành công!');
      setFormData({
        productName: '',
        description: '',
        type: '',
        price: '',
        quantity: '',
      });
      setFiles([]);
      setPreviewUrls([]);
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
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <h1 className="text-3xl font-bold text-gray-900 text-center">Thêm sản phẩm mới</h1>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                <FontAwesomeIcon icon={faTimes} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {/* Product Name */}
              <div className="space-y-2">
                <label htmlFor="productName" className="flex items-center gap-2 text-lg font-medium text-gray-700">
                  <FontAwesomeIcon icon={faBox} className="text-blue-500" />
                  Tên sản phẩm
                </label>
                <input
                  type="text"
                  id="productName"
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-required="true"
                  placeholder="Nhập tên sản phẩm (ví dụ: Cần câu Shimano)"
                  maxLength="255"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="description" className="flex items-center gap-2 text-lg font-medium text-gray-700">
                  <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500" />
                  Mô tả
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="4"
                  aria-required="true"
                  placeholder="Nhập mô tả sản phẩm (ví dụ: Cần câu siêu nhẹ, dài 2.4m)"
                  maxLength="1000"
                />
              </div>

              {/* Product Type */}
              <div className="space-y-2">
                <label htmlFor="type" className="flex items-center gap-2 text-lg font-medium text-gray-700">
                  <FontAwesomeIcon icon={faTag} className="text-blue-500" />
                  Loại sản phẩm
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-required="true"
                >
                  <option value="" disabled>Chọn loại sản phẩm</option>
                  <option value="cần câu">Cần câu</option>
                  <option value="đồ câu">Đồ câu</option>
                  <option value="phụ kiện">Phụ kiện</option>
                  <option value="mồi câu">Mồi câu</option>
                </select>
              </div>

              {/* Price and Quantity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="price" className="flex items-center gap-2 text-lg font-medium text-gray-700">
                    <FontAwesomeIcon icon={faDollarSign} className="text-blue-500" />
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
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-required="true"
                    placeholder="Nhập giá sản phẩm"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="quantity" className="flex items-center gap-2 text-lg font-medium text-gray-700">
                    <FontAwesomeIcon icon={faHashtag} className="text-blue-500" />
                    Số lượng
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-required="true"
                    placeholder="Nhập số lượng"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-lg font-medium text-gray-700">
                  <FontAwesomeIcon icon={faImage} className="text-blue-500" />
                  Hình ảnh sản phẩm
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="images"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="images"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faUpload} className="text-3xl text-gray-400" />
                    <span className="text-gray-600">
                      Kéo thả ảnh vào đây hoặc click để chọn
                    </span>
                    <span className="text-sm text-gray-500">
                      (Tối đa 5 ảnh, mỗi ảnh không quá 5MB)
                    </span>
                  </label>
                </div>

                {/* Image Previews */}
                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition duration-300 ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin />
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faCheck} />
                      <span>Đăng sản phẩm</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;