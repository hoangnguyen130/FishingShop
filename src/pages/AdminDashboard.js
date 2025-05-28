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
  faClipboardList,
  faBoxesStacked,
  faTags,
  faSearch,
  faUser
} from '@fortawesome/free-solid-svg-icons';

const AdminDashboard = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = React.useRef(null);
  const socket = React.useRef(null);

  const adminId = sessionStorage.getItem('userId');

  // Fetch users who have chatted with admin
  useEffect(() => {
    const fetchChatUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3001/v1/messages/admin-chat/${adminId}`);
        setUsers(response.data.users || []);
      } catch (err) {
        console.error('Error fetching chat users:', err);
        setError('Không thể tải danh sách người dùng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    fetchChatUsers();
  }, [adminId]);

  // Socket connection
  useEffect(() => {
    socket.current = io('http://localhost:3001');
    socket.current.emit('join_chat', adminId);

    socket.current.on('receive_message', (messageData) => {
      if (selectedUser && messageData.sender === selectedUser._id) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          sender: messageData.sender,
          text: messageData.text,
          timestamp: new Date().toISOString(),
          isRead: false
        }]);
      }
    });

    return () => {
      socket.current.disconnect();
    };
  }, [adminId, selectedUser]);

  // Load messages when selecting a user
  useEffect(() => {
    if (selectedUser) {
      const fetchMessages = async () => {
        try {
          const response = await axios.get(`http://localhost:3001/v1/messages/${adminId}/${selectedUser._id}`, {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem('token')}`
            }
          });
          setMessages(response.data.messages || []);
        } catch (err) {
          console.error('Error fetching messages:', err);
        }
      };
      fetchMessages();
    }
  }, [selectedUser, adminId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedUser) return;

    try {
      const messageData = {
        id_user1: adminId,
        id_user2: selectedUser._id,
        content: [{
          sender: adminId,
          text: message,
          timestamp: new Date().toISOString(),
          read: false
        }]
      };

      await axios.post('http://localhost:3001/v1/messages', messageData);
      
      socket.current.emit('send_message', {
        senderId: adminId,
        receiverId: selectedUser._id,
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

  const formatLastMessage = (lastMessage) => {
    if (!lastMessage) return '';
    const text = lastMessage.text;
    return text.length > 30 ? text.substring(0, 30) + '...' : text;
  };

  const filteredUsers = users.filter(user => 
    user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

          {/* Quản lý sản phẩm giảm giá */}
          <Link to="/admin/discounted-products" className="transform hover:scale-105 transition duration-300">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-pink-100 rounded-lg">
                  <FontAwesomeIcon icon={faTags} className="text-2xl text-pink-600" />
                </div>
                <span className="text-sm text-gray-500">Sản phẩm giảm giá</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quản lý sản phẩm giảm giá</h3>
              <p className="text-gray-600">Xem, chỉnh sửa các sản phẩm đang giảm giá</p>
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

          {/* Hàng tồn kho */}
          <Link to="/admin/inventory" className="transform hover:scale-105 transition duration-300">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <FontAwesomeIcon icon={faBoxesStacked} className="text-2xl text-red-600" />
                </div>
                <span className="text-sm text-gray-500">Quản lý tồn kho</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Hàng tồn kho</h3>
              <p className="text-gray-600">Xem sản phẩm bán chậm và tồn kho</p>
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
          <div className="w-[800px] bg-white rounded-lg shadow-xl overflow-hidden flex h-[600px]">
            {/* Users List */}
            <div className="w-1/3 border-r bg-gray-50">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Người dùng đã nhắn tin</h2>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm người dùng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>
              <div className="overflow-y-auto h-[calc(100%-80px)]">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">
                    Đang tải danh sách người dùng...
                  </div>
                ) : error ? (
                  <div className="p-4 text-center text-red-500">
                    {error}
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    {searchTerm ? 'Không tìm thấy người dùng nào' : 'Chưa có người dùng nào nhắn tin'}
                  </div>
                ) : (
                  filteredUsers.map(user => (
                    <div
                      key={user._id}
                      onClick={() => setSelectedUser(user)}
                      className={`p-4 cursor-pointer hover:bg-gray-100 transition-colors ${
                        selectedUser?._id === user._id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <FontAwesomeIcon icon={faUser} className="text-blue-600" />
                          </div>
                          {user.unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {user.unreadCount}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="font-medium text-gray-900 truncate">{user.userName}</p>
                            {user.lastMessage && (
                              <span className="text-xs text-gray-500">
                                {formatTime(user.lastMessage.timestamp)}
                              </span>
                            )}
                          </div>
                          {user.lastMessage && (
                            <p className="text-sm text-gray-500 truncate">
                              {user.lastMessage.sender === adminId ? 'Bạn: ' : ''}
                              {formatLastMessage(user.lastMessage)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">
                    {selectedUser ? `Chat với ${selectedUser.userName}` : 'Chọn người dùng để chat'}
                  </h2>
                  {selectedUser && (
                    <p className="text-sm text-blue-100">{selectedUser.email}</p>
                  )}
                </div>
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
                {!selectedUser ? (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    Chọn người dùng để bắt đầu chat
                  </div>
                ) : loading ? (
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
                    placeholder={selectedUser ? "Nhập tin nhắn..." : "Chọn người dùng để chat"}
                    disabled={!selectedUser}
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                    disabled={!message.trim() || !selectedUser}
                  >
                    <FontAwesomeIcon icon={faPaperPlane} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;