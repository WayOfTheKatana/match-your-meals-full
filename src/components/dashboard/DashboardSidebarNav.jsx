import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const DashboardSidebarNav = ({ currentNavigation, mode = 'consumer' }) => {
  const location = useLocation();
  const basePath = mode === 'creator' ? '/dashboard/creator' : '/dashboard/consumer';
  
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen sticky top-0">
      <div className="p-4">
        <nav className="space-y-2">
          {currentNavigation.map((item, index) => {
            if (item.type === 'heading') {
              // Render heading with horizontal line for all except the first heading
              return (
                <div 
                  key={`heading-${index}`} 
                  className={`pt-1 px-3 ${index > 0 ? 'border-t border-gray-200 mt-2' : ''}`}
                >
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    {item.label}
                  </h3>
                </div>
              );
            } else if (item.type === 'link') {
              // Build the dashboard URL for each section
              const to = item.view === 'home' ? basePath : `${basePath}/${item.view}`;
              const isActive = location.pathname === to;
              
              return (
                <Link
                  key={`link-${index}`}
                  to={to}
                  className={`w-full flex items-center space-x-3 px-3 py-1.5 rounded-lg text-left transition-colors no-underline ${
                    isActive 
                      ? 'bg-primary-50 text-primary-700 border border-primary-200' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-500'}`} />
                  <span className="text-sm font-sans">{item.name}</span>
                </Link>
              );
            }
            return null;
          })}
        </nav>
      </div>
    </aside>
  );
};

export default DashboardSidebarNav;