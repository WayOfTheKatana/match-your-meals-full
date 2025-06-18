import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';

const Header = () => {
  return (
    <header className="w-full px-6 py-4 flex items-center justify-between relative z-10" style={{ backgroundColor: '#D35400' }}>
      <div className="flex items-center">
        <Link to="/" className="text-3xl font-serif text-white hover:text-orange-100 transition-colors">
          MatchMyMeals
        </Link>
      </div>
      
      <nav className="hidden md:flex items-center space-x-8">
        <Link to="/" className="text-white hover:text-orange-200 transition-colors font-medium">Home</Link>
        <a href="#" className="text-white hover:text-orange-200 transition-colors font-medium">About MatchMeal</a>
        <a href="#" className="text-white hover:text-orange-200 transition-colors font-medium">Pricing</a>
        <a href="#" className="text-white hover:text-orange-200 transition-colors font-medium">Explore Recipes</a>
      </nav>
      
      <div className="flex items-center space-x-4">
        <Button 
          asChild
          variant="ghost" 
          className="text-white hover:bg-white/10 hover:text-white"
        >
          <Link to="/signup">Signup</Link>
        </Button>
        <Button 
          asChild
          variant="outline" 
          className="border-white text-white hover:bg-white hover:text-primary-600"
        >
          <Link to="/login">Login</Link>
        </Button>
      </div>
    </header>
  );
};

export default Header;