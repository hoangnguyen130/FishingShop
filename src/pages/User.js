import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faSave, faUser, faEnvelope, faPhone, faMapMarkerAlt, faArrowLeft, faLock } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import avt from '~/assets/imgs/default-avatar.webp';

function UserPage() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    userName: '',
    email: '',
    phone: '',
    address: '',
    avatar: avt
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập để xem thông tin!');
        navigate('/sign-in');
        return;
      }

      // Get userId from token
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const userId = tokenData.userId;

      const response = await axios.get('http://localhost:3001/v1/auth/profile', {
        params: { userId },
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.user) {
        setUserInfo({
          userName: response.data.user.userName || '',
          email: response.data.user.email || '',
          phone: response.data.user.phone || '',
          address: response.data.user.address || '',
          avatar: response.data.user.avatar || avt
        });
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn!');
        navigate('/sign-in');
      } else {
        toast.error('Không thể tải thông tin người dùng!');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Kích thước file không được vượt quá 5MB!');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling

    // Prevent double submission
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập để cập nhật thông tin!');
        navigate('/sign-in');
        return;
      }

      // Get userId from token
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const userId = tokenData.userId;

      const formData = new FormData();
      formData.append('userName', userInfo.userName.trim());
      formData.append('email', userInfo.email.trim());
      if (userInfo.phone) formData.append('phone', userInfo.phone.trim());
      if (userInfo.address) formData.append('address', userInfo.address.trim());
      if (selectedFile) {
        formData.append('avatar', selectedFile);
      }


      const response = await axios.put('http://localhost:3001/v1/auth/profile/update', formData, {
        params: { userId },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Update response:', response.data);

      // Check if response has data
      if (response.data) {
        toast.success('Cập nhật thông tin thành công!');
        setIsEditing(false);
        setSelectedFile(null);
        setPreviewUrl(null);
        
        // Update local state with new user info
        if (response.data.user) {
          setUserInfo(prev => ({
            ...prev,
            ...response.data.user
          }));
        }
      } else {
        throw new Error('Không nhận được dữ liệu từ server');
      }
    } catch (error) {
      console.error('Update error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn!');
        navigate('/sign-in');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Không thể cập nhật thông tin!');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu mới không khớp');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setIsChangingPassword(true);
      const token = sessionStorage.getItem('token');
      
      if (!token) {
        toast.error('Vui lòng đăng nhập lại');
        navigate('/sign-in');
        return;
      }

      const response = await axios.put(
        'http://localhost:3001/v1/auth/change-password',
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        toast.success('Đổi mật khẩu thành công');
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn');
        navigate('/sign-in');
      } else {
        toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại');
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <div className="max-w-4xl mx-auto p-6">
        {/* Back to Home Button */}
        <button
          onClick={() => navigate('/')}
          className="mb-4 flex items-center text-blue-600 hover:text-blue-700 transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          <span>Quay về trang chủ</span>
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-blue-600 px-6 py-8">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img
                  src={previewUrl || userInfo.avatar}
                  alt="Avatar"
                  className="w-32 h-32 rounded-full border-4 border-white object-cover"
                />
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-white text-blue-600 p-2 rounded-full cursor-pointer hover:bg-gray-100 shadow-lg">
                    <FontAwesomeIcon icon={faCamera} />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white mb-2">{userInfo.userName}</h1>
                <p className="text-blue-100">{userInfo.email}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <FontAwesomeIcon icon={faLock} className="mr-2" />
                  Đổi mật khẩu
                </button>
                <button
                  onClick={() => {
                    setIsEditing(!isEditing);
                    if (!isEditing) {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }
                  }}
                  className="px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-gray-100 transition-colors"
                >
                  {isEditing ? 'Hủy' : 'Chỉnh sửa'}
                </button>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username Field */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <FontAwesomeIcon icon={faUser} className="w-4 h-4 mr-2 text-blue-600" />
                  Tên người dùng
                </label>
                <input
                  type="text"
                  name="userName"
                  value={userInfo.userName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  placeholder="Nhập tên người dùng"
                  required
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 mr-2 text-blue-600" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={userInfo.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  placeholder="Nhập email"
                  required
                />
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <FontAwesomeIcon icon={faPhone} className="w-4 h-4 mr-2 text-blue-600" />
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={userInfo.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  placeholder="Nhập số điện thoại"
                />
              </div>

              {/* Address Field */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 mr-2 text-blue-600" />
                  Địa chỉ
                </label>
                <input
                  type="text"
                  name="address"
                  value={userInfo.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  placeholder="Nhập địa chỉ"
                />
              </div>
            </div>

            {/* Submit Button */}
            {isEditing && (
              <div className="flex justify-end pt-4 border-t">
                <button
                  type="submit"
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <FontAwesomeIcon icon={faSave} className="mr-2" />
                  Lưu thay đổi
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Đổi Mật Khẩu</h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập mật khẩu mới"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                >
                  {isChangingPassword ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserPage;
