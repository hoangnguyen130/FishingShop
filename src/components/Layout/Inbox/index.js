import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

import ContactList from './ContactList';
import MessageList from './MessageList';
import ChatInput from './ChatInput';


const InboxLayout = () => {
  const [activeContact, setActiveContact] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  const socket = useRef(null); // Dùng để lưu kết nối Socket.IO

  const userId = sessionStorage.getItem('userId')

    
  useEffect(() => {
    // Kết nối với server Socket.IO
    socket.current = io('http://localhost:3001');
    
    // Tham gia phòng chat cho người dùng hiện tại
    socket.current.emit('join_chat', userId);

    // Lắng nghe tin nhắn mới
    socket.current.on('receive_message', (messageData) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: messageData.id_user1, text: messageData.text, timestamp: new Date().toISOString() },
      ]);
    })
    // Fetching contacts data
    axios
      .get(`http://localhost:3001/v1/contacts/${userId}`)
      .then((response) => {
        setContacts(response.data);
      })
      .catch((error) => console.error('Error fetching contacts:', error));
    return () => {
      socket.current.disconnect();
    }
  }, [userId]);

  const handleSelectContact = (contactId) => {
    setActiveContact(contactId);


    // Tham gia phòng chat cho liên hệ đã chọn
    socket.current.emit('join_chat', contactId);

    // Fetch messages from backend
    axios
      .get(`http://localhost:3001/v1/messages/${userId}/${contactId}`)
      .then((response) => {
        setMessages(response.data);
      })
      .catch((error) => console.error('Error fetching messages:', error));
  };

  const handleSendMessage = (newMessage) => {
    if (!activeContact) return;

    const messageData = {
      id_user1: userId,
      id_user2: activeContact,
      content: [
        {
          sender: userId,
          text: newMessage,
          timestamp: new Date().toISOString(),
        },
      ],
    };


    // Send message to backend
    axios
      .post('http://localhost:3001/v1/messages', messageData)
      .then((response) => {

        socket.current.emit('send_message', response.data);

        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: userId, text: newMessage, timestamp: new Date().toISOString() },
          ]);

        setMessage('')
      })
      .catch((error) => console.error('Error sending message:', error));
  };

  return (
    <div className="flex h-screen">
      <div className="bg-black text-white w-72 p-4">
        <ContactList contacts={contacts} onSelectContact={handleSelectContact} />
      </div>

      <div className="flex-1 bg-black text-white border-l border-gray-700 flex flex-col">
        {activeContact ? (
          <>
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="font-semibold text-lg">Chat</h2>
            </div>
            <MessageList messages={messages} />
            <ChatInput message={message} setMessage={setMessage} onSendMessage={handleSendMessage} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p className="select-none">Select a contact to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InboxLayout;
