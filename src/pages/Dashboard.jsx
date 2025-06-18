import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { 
  User, 
  Settings, 
  Heart, 
  BookOpen, 
  Search, 
  TrendingUp,
  Clock,
  Star,
  ChefHat,
  LogOut,
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const { user, userProfile, signOut, isConnected } = useAuth();

  useEffect(() => {
    console.log('Dashboard loaded - User:', user?.email);
    console.log('User Profile:', userProfile);
    console.log('Connected to Supabase:', isConnected);
  }, [user, userProfile, isConnected]);

  const handleSignOut = async () => {
    await signOut();
  };

  const stats = [
    { label: 'Recipes Saved', value: '24', icon: BookOpen, color: 'text-blue-600' },
    { label: 'Favorites', value: '12', icon: Heart, color: 'text-red-500' },
    { label: 'Searches Today', value: '8', icon: Search, color: 'text-green-600' },
    { label: 'Cooking Time', value: '2.5h', icon: Clock, color: 'text-purple-600' }
  ];

  const recentRecipes = [
    { name: 'Healthy Quinoa Bowl', time: '25 min', rating: 4.8, image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { name: 'Grilled Salmon', time: '20 min', rating: 4.9, image: 'https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { name: 'Avocado Toast', time: '10 min', rating: 4.7, image: 'https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg?auto=compress&cs=tinysrgb&w=300' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <ChefHat className="w-8 h-8 text-primary-600" />
              <h1 className="text-2xl font-serif text-gray-900">MatchMyMeals</h1>
            </div>
            
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
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Connection Status */}
        {!isConnected && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
            <div>
              <p className="text-sm text-yellow-700 font-medium">Database Connection Issue</p>
              <p className="text-xs text-yellow-600">Some features may not work properly. Please check your Supabase configuration.</p>
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-serif text-gray-900 mb-2">
            Welcome back, {userProfile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Chef'}! 👋
          </h2>
          <p className="text-gray-600">
            Ready to discover some amazing recipes today?
          </p>
          {user && (
            <p className="text-sm text-gray-500 mt-1">
              Logged in as: {user.email}
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Search className="w-8 h-8" />
              <span className="text-primary-100 text-sm">Quick Action</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Find New Recipes</h3>
            <p className="text-primary-100 mb-4">Search by ingredients or voice</p>
            <Button variant="secondary" size="sm" className="bg-white text-primary-600 hover:bg-gray-100">
              Start Searching
            </Button>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <Heart className="w-8 h-8 text-red-500" />
              <span className="text-gray-400 text-sm">Favorites</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Favorites</h3>
            <p className="text-gray-600 mb-4">View saved recipes</p>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <Settings className="w-8 h-8 text-gray-600" />
              <span className="text-gray-400 text-sm">Settings</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Preferences</h3>
            <p className="text-gray-600 mb-4">Dietary restrictions & more</p>
            <Button variant="outline" size="sm">
              Manage
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Recent Recipes */}
        <div className="bg-white rounded-2xl shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Recent Recipes</h3>
              <Button variant="ghost" size="sm" className="text-primary-600">
                View All
              </Button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentRecipes.map((recipe, index) => (
                <div key={index} className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-xl mb-3">
                    <img
                      src={recipe.image}
                      alt={recipe.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs font-medium">{recipe.rating}</span>
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{recipe.name}</h4>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    {recipe.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;