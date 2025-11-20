import React from 'react';
import { Message, MessageRole } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
}

const UserIcon = () => (
    <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
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
        className={`max-w-xl rounded-lg p-3 text-sm md:text-base shadow
         ${
          isUser
            ? 'bg-gray-200 text-black'
            : 'bg-white text-gray-800'
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