/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments, faTimes, faPaperPlane, faImage, faXmark } from '@fortawesome/free-solid-svg-icons';

const Chat = () => {
  const [isMinimized, setIsMinimized] = useState(true);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [adminInfo, setAdminInfo] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const socket = useRef(null);

  const userId = sessionStorage.getItem('userId');

  useEffect(() => {
    // Fetch admin info
    const fetchAdminInfo = async () => {
      try {
        const response = await axios.get('http://localhost:3001/v1/messages/admin');
        setAdminInfo(response.data);
      } catch (err) {
        console.error('Error fetching admin info:', err);
      }
    };

    fetchAdminInfo();
  }, []);

  useEffect(() => {
    if (!adminInfo?.adminId) return;

    socket.current = io('http://localhost:3001');
    socket.current.emit('join_chat', userId);

    socket.current.on('receive_message', (messageData) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: messageData.sender,
        text: messageData.text,
        timestamp: new Date().toISOString(),
        isRead: false
      }]);
      // Update unread count
      if (messageData.sender === adminInfo.adminId) {
        setUnreadCount(prev => prev + 1);
      }
    });

    socket.current.on('typing', (data) => {
      if (data.userId !== userId) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    });

    fetchMessages();
    fetchUnreadCount();

    return () => {
      socket.current.disconnect();
    };
  }, [userId, adminInfo]);

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/v1/messages/unread/${userId}`);
      setUnreadCount(response.data.unreadCount);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const fetchMessages = async () => {
    if (!adminInfo?.adminId) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3001/v1/messages/${userId}/${adminInfo.adminId}`);
      setMessages(response.data);
      // Reset unread count after fetching messages
      setUnreadCount(0);
    } catch (err) {
      setError('Không thể tải tin nhắn. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Kích thước ảnh không được vượt quá 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Chỉ được upload file ảnh');
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !adminInfo?.adminId) return;

    try {
      const messageData = {
        id_user1: userId,
        id_user2: adminInfo.adminId,
        content: [{
          sender: userId,
          text: message,
          timestamp: new Date().toISOString(),
          read: false
        }]
      };

      const response = await axios.post('http://localhost:3001/v1/messages', messageData);
      
      socket.current.emit('send_message', {
        senderId: userId,
        receiverId: adminInfo.adminId,
        message: message
      });

      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: userId,
        text: message,
        timestamp: new Date().toISOString(),
        isRead: false
      }]);
      
      setMessage('');
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError('Không thể gửi tin nhắn. Vui lòng thử lại sau.');
      console.error('Error sending message:', err);
    }
  };

  const handleTyping = () => {
    socket.current.emit('typing', { userId });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageClick = (imageUrl) => {
    setSelectedPreviewImage(imageUrl);
  };

  const closeImagePreview = () => {
    setSelectedPreviewImage(null);
  };

  return (
    <div className="relative">
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors relative"
          aria-label="Mở chat"
        >
          <FontAwesomeIcon icon={faComments} size="lg" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      ) : (
        <div className="w-[350px] md:w-[400px] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col h-[600px]">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center flex-shrink-0">
            <h2 className="text-lg font-semibold">Hỗ trợ trực tuyến</h2>
            <button
              onClick={() => setIsMinimized(true)}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Đóng chat"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {loading ? (
              <div className="text-center text-gray-500 mt-4">
                Đang tải tin nhắn...
              </div>
            ) : error ? (
              <div className="text-red-500 text-center">{error}</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-4">
                Chào mừng bạn đến với hỗ trợ trực tuyến!
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {msg.image && (
                      <div className="mb-2">
                        <img
                          src={msg.image}
                          alt="Uploaded"
                          className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                          style={{ maxHeight: '200px' }}
                          onClick={() => handleImageClick(msg.image)}
                        />
                      </div>
                    )}
                    <p className="text-sm">{msg.text}</p>
                    <span className="text-xs opacity-75 mt-1 block">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              ))
            )}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3 text-gray-500">
                  Đang gõ...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="p-4 border-t border-b bg-gray-50 flex-shrink-0">
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-32 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleImageClick(imagePreview)}
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                  aria-label="Xóa ảnh"
                >
                  <FontAwesomeIcon icon={faXmark} size="sm" />
                </button>
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleTyping}
                placeholder="Nhập tin nhắn..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition duration-300 cursor-pointer flex items-center"
                title="Thêm ảnh"
              >
                <FontAwesomeIcon icon={faImage} />
              </label>
              <button
                type="submit"
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                aria-label="Gửi tin nhắn"
              >
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </div>
          </form>

          {/* Image Preview Modal */}
          {selectedPreviewImage && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
              <div className="relative max-w-4xl max-h-[90vh] p-4">
                <button
                  onClick={closeImagePreview}
                  className="absolute top-2 right-2 text-white hover:text-gray-300 transition-colors"
                  aria-label="Đóng ảnh"
                >
                  <FontAwesomeIcon icon={faXmark} size="2x" />
                </button>
                <img
                  src={selectedPreviewImage}
                  alt="Preview"
                  className="max-w-full max-h-[80vh] object-contain rounded-lg"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Chat; 