import React from 'react';

const MessageList = ({ messages }) => {
  const userId = sessionStorage.getItem('userId')
  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <p className="text-gray-500">No messages yet.</p>
      </div>
    );
  }
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((message, index) =>
        message.content?.[0] ? (
          <div
            key={index}
            className={`flex ${message.content[0].sender === userId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`p-3 rounded-lg ${
                message.content[0].sender !== userId ? 'bg-gray-700 text-gray-300' : 'bg-blue-500 text-white'
              }`}
            >
              <p>{message.content[0].text}</p>
              <p className="text-xs text-gray-400">{message.content[0].timestamp}</p>
            </div>
          </div>
        ) :  (
          <div key={index} className={`flex ${message.sender === userId ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`p-3 rounded-lg ${
                message.sender !== userId ? 'bg-gray-700 text-gray-300' : 'bg-blue-500 text-white'
              }`}
            >
              <p>{message.text}</p>
              <p className="text-xs text-gray-400">{message.timestamp}</p>
            </div>
          </div>
        ),
      )}
    </div>
  );
};

export default MessageList;
