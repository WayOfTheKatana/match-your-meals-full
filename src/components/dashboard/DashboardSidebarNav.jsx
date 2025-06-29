import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DashboardSidebarNav = ({ currentNavigation, mode = 'consumer' }) => {
  const location = useLocation();
  const basePath = mode === 'creator' ? '/dashboard/creator' : '/dashboard/consumer';
  const [collapsed, setCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };
  
  return (
    <aside className={`bg-white border-r border-gray-200 min-h-screen sticky top-0 transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="p-4 relative">
        {/* Toggle button */}
        <button 
          onClick={toggleSidebar}
          className="absolute -right-3 top-4 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:bg-gray-50 z-10"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          )}
        </button>
        
        <nav className="space-y-2">
          {currentNavigation.map((item, index) => {
            if (item.type === 'heading') {
              // Only show headings when expanded
              return !collapsed ? (
                <div 
                  key={`heading-${index}`} 
                  className={`px-3 ${index > 0 ? 'border-t border-gray-200 mt-3 pt-3' : 'pt-1'}`}
                >
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    {item.label}
                  </h3>
                </div>
              ) : null;
            } else if (item.type === 'link') {
              // Build the dashboard URL for each section
              const to = item.view === 'home' ? basePath : `${basePath}/${item.view}`;
              const isActive = location.pathname === to;
              
              return (
                <Link
                  key={`link-${index}`}
                  to={to}
                  className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-start space-x-3'} px-3 py-1.5 rounded-lg text-left transition-colors no-underline ${
                    isActive 
                      ? 'bg-primary-50 text-primary-700 border border-primary-200' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title={collapsed ? item.name : ''}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-500'}`} />
                  {!collapsed && (
                    <span className="text-sm font-sans truncate">{item.name}</span>
                  )}
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