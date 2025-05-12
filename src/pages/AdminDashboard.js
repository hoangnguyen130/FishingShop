import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faComments,
  faTimes,
  faPaperPlane,
  faChartLine,
  faPlus,
  faStore,
  faClipboardList
} from '@fortawesome/free-solid-svg-icons';

const AdminDashboard = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = React.useRef(null);
  const socket = React.useRef(null);

  const adminId = sessionStorage.getItem('userId');

  useEffect(() => {
    socket.current = io('http://localhost:3001');
    socket.current.emit('join_chat', adminId);

    socket.current.on('receive_message', (messageData) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: messageData.sender,
        text: messageData.text,
        timestamp: new Date().toISOString(),
        isRead: false
      }]);
    });

    return () => {
      socket.current.disconnect();
    };
  }, [adminId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      const messageData = {
        id_user1: adminId,
        id_user2: 'support', // Changed to a fixed support channel
        content: [{
          sender: adminId,
          text: message,
          timestamp: new Date().toISOString(),
          read: false
        }]
      };

      const response = await axios.post('http://localhost:3001/v1/messages', messageData);
      
      socket.current.emit('send_message', {
        senderId: adminId,
        receiverId: 'support',
        message: message
      });

      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: adminId,
        text: message,
        timestamp: new Date().toISOString(),
        isRead: false
      }]);
      
      setMessage('');
    } catch (err) {
      setError('Không thể gửi tin nhắn. Vui lòng thử lại sau.');
      console.error('Error sending message:', err);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
          <p className="text-lg text-gray-600">Quản lý cửa hàng của bạn</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Đăng Sản Phẩm */}
          <Link to="/admin/add-product" className="transform hover:scale-105 transition duration-300">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FontAwesomeIcon icon={faPlus} className="text-2xl text-blue-600" />
                </div>
                <span className="text-sm text-gray-500">Quản lý sản phẩm</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Đăng Sản Phẩm</h3>
              <p className="text-gray-600">Thêm sản phẩm mới vào cửa hàng</p>
            </div>
          </Link>

          {/* Quản lý Sản Phẩm */}
          <Link to="/admin/products" className="transform hover:scale-105 transition duration-300">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FontAwesomeIcon icon={faStore} className="text-2xl text-green-600" />
                </div>
                <span className="text-sm text-gray-500">Quản lý sản phẩm</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quản lý Sản Phẩm</h3>
              <p className="text-gray-600">Xem và chỉnh sửa danh sách sản phẩm</p>
            </div>
          </Link>

          {/* Đơn hàng */}
          <Link to="/admin/orders" className="transform hover:scale-105 transition duration-300">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FontAwesomeIcon icon={faClipboardList} className="text-2xl text-purple-600" />
                </div>
                <span className="text-sm text-gray-500">Quản lý đơn hàng</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Đơn hàng</h3>
              <p className="text-gray-600">Xem và xử lý đơn hàng của khách</p>
            </div>
          </Link>

          {/* Thống kê */}
          <Link to="/admin/charts" className="transform hover:scale-105 transition duration-300">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <FontAwesomeIcon icon={faChartLine} className="text-2xl text-yellow-600" />
                </div>
                <span className="text-sm text-gray-500">Phân tích dữ liệu</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Thống kê</h3>
              <p className="text-gray-600">Xem báo cáo và phân tích doanh số</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Chat Section */}
      <div className="fixed bottom-4 right-4">
        {!isChatOpen ? (
          <button
            onClick={() => setIsChatOpen(true)}
            className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            aria-label="Mở chat"
          >
            <FontAwesomeIcon icon={faComments} size="lg" />
          </button>
        ) : (
          <div className="w-[350px] md:w-[400px] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col h-[600px]">
            {/* Header */}
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Hỗ trợ khách hàng</h2>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
                aria-label="Đóng chat"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {loading ? (
                <div className="text-center text-gray-500">Đang tải tin nhắn...</div>
              ) : error ? (
                <div className="text-red-500 text-center">{error}</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500">
                  Chưa có tin nhắn nào
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`mb-4 flex ${msg.sender === adminId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.sender === adminId
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <div className="text-sm">{msg.text}</div>
                      <div className="text-xs mt-1 opacity-75">
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={!message.trim()}
                >
                  <FontAwesomeIcon icon={faPaperPlane} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;