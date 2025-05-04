import React from 'react';

const ChatInput = ({ message, setMessage, onSendMessage }) => {
  const handleChange = (e) => setMessage(e.target.value);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Ngăn ngừa việc tạo dòng mới khi nhấn Enter
      onSendMessage(message);
    }
  };

  return (
    <div className="p-4 border-t border-gray-700">
      <textarea
        className="w-full p-3 bg-gray-800 text-white rounded-md focus:outline-none"
        rows="3"
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type a message"
      ></textarea>
      <button
        onClick={handleSend}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Send
      </button>
    </div>
  );
};

export default ChatInput;
