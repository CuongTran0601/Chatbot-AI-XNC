
import React from 'react';

interface HeaderProps {
  onReset?: () => void;
  onToggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onReset, onToggleSidebar }) => {
  return (
    <header className="bg-white/50 backdrop-blur-sm shadow-md sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="p-2 rounded-lg text-gray-600 hover:bg-white/80 hover:text-blue-600 border border-transparent hover:border-gray-200 transition-all"
                title="Lịch sử trò chuyện"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
            )}
            <div className="h-12 w-12 rounded-full flex-shrink-0 hidden sm:block">
                <img 
                    src="https://upload.wikimedia.org/wikipedia/vi/0/02/Vietnam_Immigration_Department_Logo.jpg?20210321225202" 
                    alt="Logo Cục Quản lý Xuất nhập cảnh" 
                    className="w-full h-full object-cover rounded-full" 
                />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-800 leading-tight">Trợ lý ảo XNC</h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Công an Thành phố Hồ Chí Minh</p>
            </div>
          </div>

          {onReset && (
            <button 
              onClick={onReset}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white/80 border border-gray-200 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
              title="Bắt đầu cuộc trò chuyện mới"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="hidden sm:inline">Cuộc trò chuyện mới</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
