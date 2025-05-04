import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function AdminRegister() {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:3001/v1/auth/admin/register', {
        userName,
        email,
        password,
        // secretKey: 'your_secret_key' // Uncomment if using secret key check
      });
      toast.success('Tạo tài khoản admin thành công!');
      console.log('Phản hồi API:', response.data);
      setUserName('');
      setEmail('');
      setPassword('');
      navigate('/sign-in');
    } catch (err) {
      console.error('Lỗi khi tạo tài khoản admin:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      let errorMessage = 'Lỗi khi tạo tài khoản admin';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 border border-gray-300 rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold text-center text-blue-600 mb-6">Tạo tài khoản admin</h1>
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700">Tên người dùng</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition duration-300 disabled:bg-gray-400"
        >
          {loading ? 'Đang tạo...' : 'Tạo tài khoản admin'}
        </button>
      </form>
    </div>
  );
}

export default AdminRegister;