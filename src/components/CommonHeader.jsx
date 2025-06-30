import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import LoginModal from './LoginModal';
import { 
  ChefHat, 
  User, 
  LogOut, 
  Settings, 
  BookOpen,
  Menu,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from './ui/dropdown-menu';

export const CommonHeader = ({ variant = 'default' }) => {
  const { user, userProfile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginModalMode, setLoginModalMode] = useState('login'); // 'login' or 'signup'
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if there's an error, navigate to home since local state is cleared
      navigate('/');
    }
  };

  // Always use homepage-style navigation for cleaner UX
  const navigationItems = [
    { label: 'Features', href: '#features' },
    { label: 'Creator Share', href: '#about' },
    { label: 'FAQs', href: '#faq' },
    { label: 'Explore Recipes', href: '/explore-recipes' },
  ];

  return (
    <>
      <header className={`sticky top-0 z-50 w-full bg-[#D35400] `}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              {/* <div className="flex items-center justify-center w-8 h-8 bg-[#D35400] rounded-lg">
                <ChefHat className="h-6 w-6 text-white" />
              </div> */}
              <span className="text-xl text-white font-dm-serif tracking-normal">MatchMyMeals</span>
            </Link>

            {/* Desktop Navigation - Always homepage style */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="text-medium font-medium text-white hover:text-[#e7ccba] transition-colors duration-200 font-urbanist"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="relative">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="default"
                        size="sm"
                        className="flex items-center space-x-2"
                      >
                        <div className="w-8 h-8 bg-[#D35400] rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <span className="hidden sm:block text-sm font-medium">
                          {userProfile?.full_name || user.email?.split('@')[0] || 'User'}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {userProfile?.full_name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      
                      <DropdownMenuItem 
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Dashboard
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem
                        onClick={() => navigate('/profile')}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem
                        onClick={handleSignOut}
                        disabled={loading}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        {loading ? 'Signing out...' : 'Sign out'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="hidden sm:flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setLoginModalMode('login'); setShowLoginModal(true); }}
                    className="text-white"
                  >
                    Sign In
                  </Button>
                  <Button
                    size="sm"
                    className="bg-[#D35400] hover:bg-[#B8440E] text-white"
                    onClick={() => { setLoginModalMode('signup'); setShowLoginModal(true); }}
                  >
                    Get Started
                  </Button>
                </div>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                {showMobileMenu ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {showMobileMenu && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <nav className="flex flex-col space-y-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="px-2 py-2 text-sm font-medium text-gray-700 hover:text-[#D35400] hover:bg-gray-50 rounded-md transition-colors duration-200"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                
                {!user && (
                  <div className="pt-2 border-t border-gray-200 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        setLoginModalMode('login');
                        setShowLoginModal(true);
                        setShowMobileMenu(false);
                      }}
                    >
                      Sign In
                    </Button>
                    <Button
                      size="sm"
                      className="w-full mt-2 bg-[#D35400] hover:bg-[#B8440E] text-white"
                      onClick={() => {
                        setLoginModalMode('signup');
                        setShowLoginModal(true);
                        setShowMobileMenu(false);
                      }}
                    >
                      Get Started
                    </Button>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        initialMode={loginModalMode}
      />

      {/* Click outside to close mobile menu */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowMobileMenu(false);
          }}
        />
      )}
    </>
  );
};

export default CommonHeader