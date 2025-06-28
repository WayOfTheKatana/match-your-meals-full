import React from 'react';
import { ChefHat, User, LogOut, Monitor, PenTool } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate, useLocation } from 'react-router-dom';

const DashboardHeader = ({ 
  user, 
  userProfile, 
  isCreatorMode, 
  handleSignOut 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  // Determine current mode from URL
  const isCreator = location.pathname.startsWith('/dashboard/creator');
  const handleModeSwitch = () => {
    if (isCreator) {
      navigate('/dashboard/consumer');
    } else {
      navigate('/dashboard/creator');
    }
  };
  return (
    <header className="bg-zinc-900 shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {/* <ChefHat className="w-8 h-8 text-primary-600" /> */}
            <h1 className="text-2xl font-dm-serif text-white">MatchMyMeals</h1>
          </div>
          
          <div className="flex items-center space-x-12">
            {/* Mode Toggle Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleModeSwitch}
              className="text-white hover:bg-white/10 hover:text-white border border-white/20 hover:border-white/30 transition-all duration-200 font-inter"
            >
              {isCreator ? (
                <>
                  <Monitor className="w-4 h-4 mr-2" />
                  Consumer Mode
                </>
              ) : (
                <>
                  <PenTool className="w-4 h-4 mr-2" />
                  Creator Mode
                </>
              )}
            </Button>

            <div className="flex items-center space-x-5">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden md:block font-inter">
                  <p className="text-sm font-medium text-white">
                    {userProfile?.full_name || user?.email || 'User'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {isCreator ? 'Creator' : userProfile?.subscription_status || 'Free Plan'}
                  </p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-gray-400 hover:text-white hover:bg-white/10 font-inter"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;