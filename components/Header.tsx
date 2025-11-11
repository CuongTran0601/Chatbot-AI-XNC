
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full flex-shrink-0">
                <img 
                    src="https://upload.wikimedia.org/wikipedia/vi/0/02/Vietnam_Immigration_Department_Logo.jpg?20210321225202" 
                    alt="Logo Cục Quản lý Xuất nhập cảnh" 
                    className="w-full h-full object-cover rounded-full" 
                />
            </div>
            <div className="ml-4">
              <h1 className="text-xl font-bold text-gray-800">Trợ lý ảo tư vấn Xuất nhập cảnh</h1>
              <p className="text-sm text-gray-500">Công an Thành phố Hồ Chí Minh</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;