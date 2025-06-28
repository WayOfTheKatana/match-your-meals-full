import React from 'react';
import { Zap } from 'lucide-react';

const BoltBadge = () => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <a 
        href="https://bolt.new" 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-full shadow-lg hover:bg-gray-800 transition-colors group"
      >
        <Zap className="w-4 h-4 text-yellow-400 group-hover:animate-pulse" />
        <span className="text-sm font-medium">Built on Bolt.new</span>
      </a>
    </div>
  );
};

export default BoltBadge;