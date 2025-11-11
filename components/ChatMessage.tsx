
import React from 'react';
import { Message, MessageRole } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
}

const UserIcon = () => (
  <img
    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
    src="https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg"
    alt="Ảnh đại diện người dùng"
  />
);

const AiIcon = () => (
    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
        <img 
            src="https://upload.wikimedia.org/wikipedia/vi/0/02/Vietnam_Immigration_Department_Logo.jpg?20210321225202" 
            alt="AI Avatar" 
            className="w-full h-full object-cover rounded-full" 
        />
    </div>
);

const LoadingIndicator = () => (
  <div className="flex items-center space-x-2">
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
  </div>
);

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLoading = false }) => {
  const isUser = message.role === MessageRole.USER;

  return (
    <div className={`flex items-start gap-3 my-4 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && <AiIcon />}
      <div
        className={`max-w-xl rounded-xl p-4 text-sm md:text-base
         ${
          isUser
            ? 'bg-[#E9D484] text-gray-800 rounded-br-none'
            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
            
        }`}
      >
        {isUser ? (
          <p>{message.content}</p>
        ) : isLoading && !message.content ? (
          <LoadingIndicator />
        ) : (
          <MarkdownRenderer content={message.content} />
        )}
      </div>
      {isUser && <UserIcon />}
    </div>
  );
};

export default ChatMessage;