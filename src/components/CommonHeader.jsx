import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChefHat, LogOut, User } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';

const CommonHeader = () => {
  const { user, userProfile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="w-full px-6 py-4 flex items-center justify-between relative z-10 bg-white shadow-sm border-b">
      <div className="flex items-center">
        <Link to="/" className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors">
          <ChefHat className="w-8 h-8" />
          <span className="text-2xl font-serif">MatchMyMeals</span>
        </Link>
      </div>
      
      <nav className="hidden md:flex items-center space-x-8">
        <Link to="/" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">Home</Link>
        <a href="#" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">About MatchMeal</a>
        <a href="#" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">Pricing</a>
        {user && (
          <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">Dashboard</Link>
        )}
      </nav>
      
      <div className="flex items-center space-x-4">
        {user ? (
          // Authenticated user state
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">
                  {userProfile?.full_name || user?.email || 'User'}
                </p>
                <p className="text-xs text-gray-500">
                  {userProfile?.subscription_status || 'Free Plan'}
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        ) : (
          // Unauthenticated user state
          <>
            <Button 
              asChild
              variant="ghost" 
              className="text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <Link to="/signup">Signup</Link>
            </Button>
            <Button 
              asChild
              variant="outline" 
              className="border-primary-600 text-primary-600 hover:bg-primary-50 hover:text-primary-700"
            >
              <Link to="/login">Login</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
};

export default CommonHeader;