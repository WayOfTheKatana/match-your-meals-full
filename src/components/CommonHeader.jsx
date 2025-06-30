import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (showMobileMenu) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => document.body.classList.remove('overflow-hidden');
  }, [showMobileMenu]);

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
                className="md:hidden text-white hover:bg-[#B8440E]/20"
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
        </div>
      </header>

      {/* Mobile Navigation - Now uses a Portal to escape stacking context */}
      {showMobileMenu && createPortal(
        <>
          {/* Backdrop with very high z-index */}
          <div
            className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm transition-all duration-300 ease-in-out"
            onClick={() => setShowMobileMenu(false)}
          />
          
          {/* Drawer with maximum z-index */}
          <div 
            className="fixed top-0 right-0 z-[9999] h-full w-full max-w-sm bg-[#D35400] shadow-2xl flex flex-col py-6 px-6 transform transition-transform duration-300 ease-in-out"
            style={{ 
              boxShadow: '-10px 0 40px 0 rgba(0,0,0,0.4)',
              transform: 'translateX(0)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pt-2">
              <span className="text-xl text-white font-dm-serif tracking-normal">MatchMyMeals</span>
              <button 
                onClick={() => setShowMobileMenu(false)} 
                className="p-2 rounded-full hover:bg-[#B8440E]/30 transition-colors duration-200"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-2 flex-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="block text-lg font-medium text-white hover:text-[#e7ccba] hover:bg-[#B8440E]/20 py-3 px-4 rounded-lg transition-all duration-200"
                  onClick={() => setShowMobileMenu(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* User menu for authenticated users */}
              {user ? (
                <div className="mt-6 pt-6 border-t border-white/20">
                  <div className="flex items-center space-x-3 mb-4 px-4">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {userProfile?.full_name || user.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-white/70 text-sm">{user.email}</p>
                    </div>
                  </div>
                  
                  <Link
                    to="/dashboard"
                    className="flex items-center text-white hover:text-[#e7ccba] hover:bg-[#B8440E]/20 py-3 px-4 rounded-lg transition-all duration-200"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <BookOpen className="h-5 w-5 mr-3" />
                    Dashboard
                  </Link>
                  
                  <Link
                    to="/profile"
                    className="flex items-center text-white hover:text-[#e7ccba] hover:bg-[#B8440E]/20 py-3 px-4 rounded-lg transition-all duration-200"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Settings className="h-5 w-5 mr-3" />
                    Settings
                  </Link>
                  
                  <button
                    onClick={() => {
                      handleSignOut();
                      setShowMobileMenu(false);
                    }}
                    disabled={loading}
                    className="flex items-center w-full text-white hover:text-[#e7ccba] hover:bg-[#B8440E]/20 py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    {loading ? 'Signing out...' : 'Sign Out'}
                  </button>
                </div>
              ) : (
                /* Auth buttons for non-authenticated users */
                <div className="mt-auto pt-6 border-t border-white/20 flex flex-col gap-3">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full justify-center text-white border border-white/30 hover:bg-white/10 py-3"
                    onClick={() => {
                      setLoginModalMode('login');
                      setShowLoginModal(true);
                      setShowMobileMenu(false);
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    size="lg"
                    className="w-full bg-white text-[#D35400] font-bold hover:bg-[#e7ccba] py-3"
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
        </>,
        document.body
      )}

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        initialMode={loginModalMode}
      />
    </>
  );
};

export default CommonHeader