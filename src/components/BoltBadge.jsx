import React from 'react';

const BoltBadge = () => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <a 
        href="https://bolt.new" 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <img 
          src="/black_circle_360x360.png" 
          alt="Powered by Bolt.new" 
          className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 animate-spin-slow"
        />
      </a>
    </div>
  );
};

export default BoltBadge;