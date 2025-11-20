
import React from 'react';
import { ChatSession } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
}) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Sort sessions: newest first
  const sortedSessions = [...sessions].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div
        className={`fixed inset-y-0 left-0 w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-blue-50">
          <h2 className="text-lg font-bold text-gray-800">Lịch sử trò chuyện</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 text-gray-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* New Chat Button in Sidebar */}
        <div className="p-4">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Cuộc trò chuyện mới
          </button>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {sortedSessions.length === 0 ? (
            <div className="text-center text-gray-500 mt-10 text-sm">
              Chưa có lịch sử trò chuyện
            </div>
          ) : (
            sortedSessions.map((session) => (
              <div
                key={session.id}
                className={`group flex items-center justify-between w-full px-3 py-2 rounded-lg border transition-all ${
                  currentSessionId === session.id
                    ? 'bg-blue-50 border-blue-200 shadow-sm'
                    : 'bg-white border-transparent hover:bg-gray-100'
                }`}
              >
                <button
                  onClick={() => {
                    onSelectSession(session.id);
                    onClose();
                  }}
                  className="flex-1 text-left min-w-0 mr-2 focus:outline-none"
                >
                  <div className={`font-medium text-sm mb-0.5 ${currentSessionId === session.id ? 'text-blue-700' : 'text-gray-700'}`}>
                    {formatDate(session.timestamp)}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {session.messages.find(m => m.role === 'user')?.content || "Cuộc trò chuyện mới"}
                  </div>
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                  title="Xóa cuộc trò chuyện"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-400">Dữ liệu được lưu trên trình duyệt của bạn</p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
