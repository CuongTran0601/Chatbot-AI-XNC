
import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatMessage from './components/ChatMessage';
import { Message, MessageRole, ChatSession } from './types';
import { streamChatbotResponse } from './services/geminiService';

const STORAGE_KEY_SESSIONS = 'xnc_chat_sessions_v2';
const STORAGE_KEY_OLD_MESSAGES = 'xnc_chat_history'; // Keep for migration

const DEFAULT_MESSAGE: Message = {
  id: 'initial-message',
  role: MessageRole.AI,
  content: 'Xin chào! Tôi là Trợ lý ảo tư vấn Xuất nhập cảnh của Công an TP.HCM. Tôi có thể giúp gì cho Anh/Chị?',
};

const App: React.FC = () => {
  // State for all chat sessions
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const savedSessions = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (savedSessions) {
        return JSON.parse(savedSessions);
      }

      // Migration logic: Check if old single-chat history exists
      const oldMessages = localStorage.getItem(STORAGE_KEY_OLD_MESSAGES);
      if (oldMessages) {
        const parsedOldMessages = JSON.parse(oldMessages);
        // Only migrate if it's not just the default message
        if (parsedOldMessages.length > 1 || parsedOldMessages[0]?.content !== DEFAULT_MESSAGE.content) {
            const migratedSession: ChatSession = {
                id: Date.now().toString(),
                timestamp: Date.now(),
                messages: parsedOldMessages
            };
            localStorage.removeItem(STORAGE_KEY_OLD_MESSAGES); // Clear old data
            return [migratedSession];
        }
      }

      // Initialize with one default session
      const initialSessionId = Date.now().toString();
      return [{
        id: initialSessionId,
        timestamp: Date.now(),
        messages: [DEFAULT_MESSAGE]
      }];
    } catch (error) {
      console.error('Error initializing chat history:', error);
      return [{
        id: Date.now().toString(),
        timestamp: Date.now(),
        messages: [DEFAULT_MESSAGE]
      }];
    }
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    try {
        const savedSessions = localStorage.getItem(STORAGE_KEY_SESSIONS);
        if(savedSessions) {
            const parsed: ChatSession[] = JSON.parse(savedSessions);
            // Sort desc to find latest
             parsed.sort((a, b) => b.timestamp - a.timestamp);
            return parsed[0]?.id || '';
        }
         return ''; 
    } catch {
        return '';
    }
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Ensure currentSessionId is set correctly on mount if empty
  useEffect(() => {
      if (!currentSessionId && sessions.length > 0) {
          // Default to the one with highest timestamp (newest)
          const sorted = [...sessions].sort((a, b) => b.timestamp - a.timestamp);
          setCurrentSessionId(sorted[0].id);
      }
  }, [sessions, currentSessionId]);

  // Save to localStorage whenever sessions change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, currentSessionId, isLoading]);

  // Helper to get current messages
  const currentMessages = sessions.find(s => s.id === currentSessionId)?.messages || [];

  const handleNewChat = () => {
    const newSessionId = Date.now().toString();
    const newSession: ChatSession = {
      id: newSessionId,
      timestamp: Date.now(),
      messages: [DEFAULT_MESSAGE],
    };
    
    setSessions(prev => [...prev, newSession]);
    setCurrentSessionId(newSessionId);
    setSuggestions([]);
    setIsSidebarOpen(false);
  };

  const handleDeleteSession = (sessionIdToDelete: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa cuộc trò chuyện này không?")) {
        const updatedSessions = sessions.filter(session => session.id !== sessionIdToDelete);

        if (updatedSessions.length === 0) {
            // If all deleted, create a new default session
            const newSessionId = Date.now().toString();
            const newSession = {
                id: newSessionId,
                timestamp: Date.now(),
                messages: [DEFAULT_MESSAGE]
            };
            setSessions([newSession]);
            setCurrentSessionId(newSessionId);
        } else {
            setSessions(updatedSessions);
            // If we deleted the active session, switch to the newest available
            if (sessionIdToDelete === currentSessionId) {
                const sorted = [...updatedSessions].sort((a, b) => b.timestamp - a.timestamp);
                setCurrentSessionId(sorted[0].id);
            }
        }
    }
  };

  const handleSelectSession = (id: string) => {
    setCurrentSessionId(id);
    setSuggestions([]); // Optionally we could store suggestions per session, but clearing is safer UI
    setIsSidebarOpen(false);
  };

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading || !currentSessionId) return;

    setSuggestions([]); // Clear previous suggestions

    const userMessage: Message = {
      id: `${Date.now()}-user-${Math.random()}`,
      role: MessageRole.USER,
      content: messageContent.trim(),
    };

    // Optimistic update for user message
    setSessions(prev => prev.map(session => {
        if (session.id === currentSessionId) {
            return {
                ...session,
                messages: [...session.messages, userMessage]
            };
        }
        return session;
    }));

    setInput('');
    setIsLoading(true);

    const aiMessageId = `${Date.now()}-ai-${Math.random()}`;
    const placeholderAiMessage: Message = { id: aiMessageId, role: MessageRole.AI, content: '' };

    // Add placeholder AI message
    setSessions(prev => prev.map(session => {
        if (session.id === currentSessionId) {
            return {
                ...session,
                messages: [...session.messages, placeholderAiMessage]
            };
        }
        return session;
    }));

    let fullText = '';
    try {
      const stream = streamChatbotResponse(userMessage.content);
      for await (const chunk of stream) {
        if (chunk.text) {
          fullText += chunk.text;
          // Update streaming content
          setSessions(prev => prev.map(session => {
            if (session.id === currentSessionId) {
                return {
                    ...session,
                    messages: session.messages.map(msg => 
                        msg.id === aiMessageId ? { ...msg, content: fullText } : msg
                    )
                };
            }
            return session;
          }));
        }
      }
    } catch (error) {
      console.error("Error streaming message:", error);
      setSessions(prev => prev.map(session => {
        if (session.id === currentSessionId) {
            return {
                ...session,
                messages: session.messages.map(msg => 
                    msg.id === aiMessageId ? { ...msg, content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau." } : msg
                )
            };
        }
        return session;
      }));
    } finally {
      setIsLoading(false);
      
      // Extract suggestions and update state
      const suggestionRegex = /<suggestions>([\s\S]*?)<\/suggestions>/;
      const match = fullText.match(suggestionRegex);

      if (match && match[1]) {
        const suggestionText = match[1].trim();
        const newSuggestions = suggestionText.split('\n').filter(s => s.trim() !== '');
        setSuggestions(newSuggestions);

        // Remove the suggestions block from the displayed message
        const cleanedText = fullText.replace(suggestionRegex, '').trim();
        setSessions(prev => prev.map(session => {
            if (session.id === currentSessionId) {
                return {
                    ...session,
                    messages: session.messages.map(msg => 
                        msg.id === aiMessageId ? { ...msg, content: cleanedText } : msg
                    )
                };
            }
            return session;
        }));
      }
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex flex-col h-screen bg-transparent relative">
      <Header 
        onReset={handleNewChat} 
        onToggleSidebar={() => setIsSidebarOpen(true)}
      />
      
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
      />

      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          {currentMessages.map((msg, index) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isLoading={isLoading && index === currentMessages.length - 1}
            />
          ))}
          <div ref={chatEndRef} />
        </div>
      </main>

      <footer className="p-4 border-t border-gray-200/50 bg-white/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          {suggestions.length > 0 && !isLoading && (
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-gray-600 mr-2">Gợi ý:</p>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setSuggestions([])}
                 className="p-2 bg-gray-100 border border-gray-300 text-gray-600 hover:bg-gray-200 hover:text-gray-900 hover:border-gray-400 rounded-full shadow-sm transition-all flex-shrink-0"
                title="Đóng gợi ý"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
            </div>
          )}
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Đặt câu hỏi cho Trợ lý ảo..."
              className="flex-1 w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/70 text-black"
              disabled={isLoading}
               onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e as unknown as React.FormEvent);
                }
              }}
            />
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold disabled:bg-gray-400 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading || !input.trim()}
            >
              Gửi
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
};

export default App;
