import React from 'react';
import CommonHeader from '../components/CommonHeader';
import SearchSection from '../components/SearchSection';

const Home = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700">
        {/* Overlay Pattern */}
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/5 rounded-full blur-xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-white/5 rounded-full blur-xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white/5 rounded-full blur-xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Use CommonHeader instead of Header */}
        <div className="absolute top-0 left-0 right-0 z-20">
          <div className="bg-primary-600/90 backdrop-blur-sm">
            <CommonHeader />
          </div>
        </div>
        
        <main className="flex-1 flex items-center justify-center py-12 pt-24" style={{ background: 'linear-gradient(to bottom, #D35400 60%, #ECF0F1 100%)' }}>
          <SearchSection />
        </main>
      </div>
    </div>
  );
};

export default Home;