import React, { useState, useEffect } from 'react';
import { Search, Mic, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

const SearchSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [currentRecipeIndex, setCurrentRecipeIndex] = useState(0);

  const trendingRecipes = [
    "Tuna with Salads Epic Recipe",
    "Tuna With Salmon Recipe",
    "Vanilla Milkshake Post-workout Recipe"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRecipeIndex((prevIndex) => 
        (prevIndex + 1) % trendingRecipes.length
      );
    }, 3000); // Change recipe every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const handleVoiceSearch = () => {
    setIsListening(!isListening);
    // Voice search functionality will be implemented later
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className="flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto">
      {/* Badge */}
      <div className="mb-8 animate-fade-in">
        <span className="inline-flex items-center px-4 py-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm text-white text-sm font-medium">
          AI Powered Recipe Search
        </span>
      </div>

      {/* Main Heading */}
      <div className="mb-12 animate-slide-up">
        <h1 className="text-5xl md:text-7xl font-serif text-white mb-4 leading-tight">
          Find Your Perfect
        </h1>
        <h1 className="text-5xl md:text-7xl font-serif text-white mb-4 leading-tight">
          Recipe in <span className="italic font-light">Seconds</span>
        </h1>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-2xl mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="relative flex items-center bg-white rounded-full shadow-lg overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl focus-within:shadow-xl focus-within:scale-[1.02]">
          <div className="flex items-center pl-4 pr-4">
            <Mic 
              className={`w-5 h-5 cursor-pointer transition-colors duration-300 ${
                isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-primary-600'
              }`}
              onClick={handleVoiceSearch}
            />
          </div>
          
          <Input
            type="text"
            placeholder={isFocused ? "" : "pre-workout banana milkshake and suggest me post workout"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="flex-1 border-0 outline-none focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-700 placeholder:text-gray-400 h-12 text-sm lg:w-[450px] placeholder:opacity-100 focus:placeholder:opacity-0"
          />
          
          <Button 
            className="m-2 h-10 w-10 rounded-full bg-primary-600 hover:bg-primary-700 p-0 transition-all duration-300 ease-in-out hover:scale-105"
            onClick={() => console.log('Search:', searchQuery)}
          >
            <Search className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Trending Section */}
      <div className="flex items-center space-x-4 text-white/80 animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium">Trending recipes</span>
        </div>
        <div className="relative h-6 w-64 overflow-hidden">
          <div 
            className="absolute inset-0 transition-transform duration-700 ease-in-out"
            style={{ 
              transform: `translateY(-${currentRecipeIndex * 100}%)` 
            }}
          >
            {trendingRecipes.map((recipe, index) => (
              <div
                key={index}
                className="h-6 flex items-center justify-start"
              >
                <span className="text-sm whitespace-nowrap">
                  {recipe}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchSection;