// Fix: Implement the main App component to create the chat interface.
// This resolves errors related to App.tsx being a missing or invalid module.
import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import ChatMessage from './components/ChatMessage';
import { Message, MessageRole } from './types';
import { streamChatbotResponse } from './services/geminiService';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial-message',
      role: MessageRole.AI,
      content: 'Xin chào! Tôi là Trợ lý ảo tư vấn Xuất nhập cảnh của Công an TP.HCM. Tôi có thể giúp gì cho Anh/Chị?',
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeSuggestions, setActiveSuggestions] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;

    setActiveSuggestions([]);

    const userMessage: Message = {
      id: `${Date.now()}-user-${Math.random()}`,
      role: MessageRole.USER,
      content: messageContent.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const aiMessageId = `${Date.now()}-ai-${Math.random()}`;
    setMessages((prev) => [
      ...prev,
      { id: aiMessageId, role: MessageRole.AI, content: '' },
    ]);

    let fullText = '';
    try {
      const stream = streamChatbotResponse(userMessage.content);
      for await (const chunk of stream) {
        if (chunk.text) {
          fullText += chunk.text;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId ? { ...msg, content: fullText } : msg
            )
          );
        }
      }

      // Post-processing after stream ends
      const suggestionRegex = /<suggestions>([\s\S]*?)<\/suggestions>/;
      const suggestionMatch = fullText.match(suggestionRegex);
      
      let finalContent = fullText;
      let suggestions: string[] = [];

      if (suggestionMatch && suggestionMatch[1]) {
        finalContent = fullText.replace(suggestionRegex, '').trim();
        suggestions = suggestionMatch[1]
          .split('\n')
          .map(s => s.trim())
          .filter(s => s.length > 0);
      }

      // Final update to the message to remove tags and set final content
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? { ...msg, content: finalContent }
            : msg
        )
      );
      setActiveSuggestions(suggestions);

    } catch (error) {
      console.error("Error streaming message:", error);
       setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId 
            ? { ...msg, content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau." } 
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
    setInput('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (activeSuggestions.length > 0) {
      setActiveSuggestions([]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-transparent">
      <Header />
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          {messages.map((msg, index) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isLoading={isLoading && index === messages.length - 1}
            />
          ))}
          <div ref={chatEndRef} />
        </div>
      </main>

      <div className="bg-transparent border-t border-gray-200/50">
        {!isLoading && activeSuggestions.length > 0 && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex flex-wrap gap-2">
                  {activeSuggestions.map((suggestion, index) => (
                      <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-3 py-1.5 text-sm bg-white/60 backdrop-blur-md border border-white/70 rounded-full hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#A98C3F] text-gray-800 font-medium transition-colors"
                      >
                          {suggestion}
                      </button>
                  ))}
              </div>
          </div>
        )}

        <footer className="bg-transparent">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <form onSubmit={handleSendMessage} className="flex items-center py-3">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Đặt câu hỏi cho Trợ lý ảo..."
                className="flex-1 w-full border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[#A98C3F] focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="ml-3 p-2 rounded-full bg-[#A98C3F] text-white disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-[#8e7434] transition-colors flex-shrink-0"
                disabled={isLoading || !input.trim()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;