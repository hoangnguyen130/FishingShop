import React from 'react';
import Chat from '../Chat';

const ChatContainer = ({ children }) => {
  return (
    <div className="relative min-h-screen">
      <div className="pb-32 md:pb-24">
        {children}
      </div>
      <div className="fixed bottom-4 right-4 z-50">
        <Chat />
      </div>
    </div>
  );
};

export default ChatContainer; 