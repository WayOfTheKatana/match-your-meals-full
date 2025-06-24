import React from 'react';

const DashboardSidebarNav = ({ currentNavigation, handleNavigationClick }) => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen sticky top-0">
      <div className="p-4">
        <nav className="space-y-2">
          {currentNavigation.map((item, index) => (
            <button
              key={index}
              onClick={() => handleNavigationClick(item.view)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                item.active 
                  ? 'bg-primary-50 text-primary-700 border border-primary-200' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon className={`w-5 h-5 ${item.active ? 'text-primary-600' : 'text-gray-500'}`} />
              <span className="text-sm font-sans">{item.name}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default DashboardSidebarNav;