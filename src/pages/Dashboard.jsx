import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import RecipeCreationModal from '../components/RecipeCreationModal';
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
  AlertCircle,
  PenTool,
  Home,
  History,
  Users,
  HelpCircle,
  Grid3X3,
  Bookmark,
  Filter,
  Calendar,
  Award,
  Activity,
  BarChart3,
  DollarSign,
  Eye,
  FileText,
  CheckCircle,
  UserCheck,
  Monitor
} from 'lucide-react';

const Dashboard = () => {
  const { user, userProfile, signOut, isConnected } = useAuth();
  const [isCreatorMode, setIsCreatorMode] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);

  useEffect(() => {
    console.log('Dashboard loaded - User:', user?.email);
    console.log('User Profile:', userProfile);
    console.log('Connected to Supabase:', isConnected);
  }, [user, userProfile, isConnected]);

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleMode = () => {
    setIsCreatorMode(!isCreatorMode);
  };

  const handleCreateRecipe = () => {
    setShowRecipeModal(true);
  };

  const handleSaveRecipe = async (recipeData) => {
    console.log('Saving recipe as draft:', recipeData);
    // TODO: Implement save to Supabase
    setShowRecipeModal(false);
  };

  const handlePublishRecipe = async (recipeData) => {
    console.log('Publishing recipe:', recipeData);
    // TODO: Implement publish to Supabase
    setShowRecipeModal(false);
  };

  // Consumer Mode Data
  const consumerStats = [
    { label: 'Recipes Saved', value: '24', icon: BookOpen, color: 'text-blue-600' },
    { label: 'Favorites', value: '12', icon: Heart, color: 'text-red-500' },
    { label: 'Searches Today', value: '8', icon: Search, color: 'text-green-600' },
    { label: 'Cooking Time', value: '2.5h', icon: Clock, color: 'text-purple-600' }
  ];

  // Creator Mode Data
  const creatorStats = [
    { label: 'Published Recipes', value: '18', icon: FileText, color: 'text-blue-600' },
    { label: 'Total Followers', value: '1.2k', icon: Users, color: 'text-green-600' },
    { label: 'Monthly Views', value: '5.8k', icon: Eye, color: 'text-purple-600' },
    { label: 'Revenue', value: '$234', icon: DollarSign, color: 'text-emerald-600' }
  ];

  const recentRecipes = [
    { name: 'Healthy Quinoa Bowl', time: '25 min', rating: 4.8, image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { name: 'Grilled Salmon', time: '20 min', rating: 4.9, image: 'https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { name: 'Avocado Toast', time: '10 min', rating: 4.7, image: 'https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { name: 'Protein Smoothie', time: '5 min', rating: 4.6, image: 'https://images.pexels.com/photos/775032/pexels-photo-775032.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { name: 'Mediterranean Salad', time: '15 min', rating: 4.8, image: 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=300' }
  ];

  // Creator's published recipes
  const publishedRecipes = [
    { name: 'Ultimate Protein Bowl', time: '30 min', rating: 4.9, views: '2.1k', status: 'Published', image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { name: 'Keto Salmon Delight', time: '25 min', rating: 4.8, views: '1.8k', status: 'Published', image: 'https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { name: 'Morning Energy Toast', time: '15 min', rating: 4.7, views: '1.5k', status: 'Under Review', image: 'https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { name: 'Green Power Smoothie', time: '10 min', rating: 4.6, views: '1.2k', status: 'Published', image: 'https://images.pexels.com/photos/775032/pexels-photo-775032.jpeg?auto=compress&cs=tinysrgb&w=300' }
  ];

  const consumerNavigationItems = [
    { name: 'Home / Feed', icon: Home, active: true },
    { name: 'Saved Recipes', icon: Bookmark },
    { name: 'By Categories', icon: Grid3X3 },
    { name: 'Recipe Search History', icon: History },
    { name: 'Followings', icon: Users },
    { name: 'Help & Support', icon: HelpCircle }
  ];

  const creatorNavigationItems = [
    { name: 'Dashboard Overview', icon: Home, active: true },
    { name: 'Published Recipes', icon: FileText },
    { name: 'Followers', icon: UserCheck },
    { name: 'Recipe Vetting', icon: CheckCircle },
    { name: 'Analytics', icon: BarChart3 },
    { name: 'Revenue', icon: DollarSign },
    { name: 'Help & Support', icon: HelpCircle }
  ];

  const trendingTopics = [
    'Healthy Breakfast Ideas',
    'Quick Dinner Recipes',
    'Vegan Protein Sources',
    'Meal Prep Sunday',
    'Low Carb Snacks'
  ];

  const upcomingEvents = [
    { title: 'Virtual Cooking Class', date: 'Dec 25', time: '2:00 PM' },
    { title: 'Recipe Contest Deadline', date: 'Dec 28', time: '11:59 PM' },
    { title: 'New Year Meal Prep', date: 'Jan 1', time: '10:00 AM' }
  ];

  const creatorInsights = [
    { title: 'Top Performing Recipe', value: 'Ultimate Protein Bowl', change: '+15%' },
    { title: 'Engagement Rate', value: '8.4%', change: '+2.1%' },
    { title: 'New Followers', value: '47', change: '+12%' }
  ];

  const currentStats = isCreatorMode ? creatorStats : consumerStats;
  const currentNavigation = isCreatorMode ? creatorNavigationItems : consumerNavigationItems;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-zinc-900 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <ChefHat className="w-8 h-8 text-primary-600" />
              <h1 className="text-2xl font-serif text-white">MatchMyMeals</h1>
            </div>
            
            <div className="flex items-center space-x-12">
              {/* Mode Toggle Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMode}
                className="text-white hover:bg-white/10 hover:text-white border border-white/20 hover:border-white/30 transition-all duration-200"
              >
                {isCreatorMode ? (
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
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-white">
                      {userProfile?.full_name || user?.email || 'User'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {isCreatorMode ? 'Creator' : userProfile?.subscription_status || 'Free Plan'}
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex max-w-7xl mx-auto">
        {/* Left Sidebar - Navigation */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen sticky top-0">
          <div className="p-4">
            <nav className="space-y-2">
              {currentNavigation.map((item, index) => (
                <button
                  key={index}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    item.active 
                      ? 'bg-primary-50 text-primary-700 border border-primary-200' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${item.active ? 'text-primary-600' : 'text-gray-500'}`} />
                  <span className="text-sm font-medium">{item.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Center Content - Scrollable Feed */}
        <div className="flex-1 max-w-2xl">
          <div className="p-6 space-y-6">
            {/* Connection Status */}
            {!isConnected && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                <div>
                  <p className="text-sm text-yellow-700 font-medium">Database Connection Issue</p>
                  <p className="text-xs text-yellow-600">Some features may not work properly. Please check your Supabase configuration.</p>
                </div>
              </div>
            )}

            {/* Welcome Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h2 className="text-2xl font-serif text-gray-900 mb-2">
                {isCreatorMode ? (
                  <>Welcome to Creator Dashboard, {userProfile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Chef'}! 🎨</>
                ) : (
                  <>Welcome back, {userProfile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Chef'}! 👋</>
                )}
              </h2>
              <p className="text-gray-600 mb-4">
                {isCreatorMode ? (
                  'Manage your recipes, track performance, and grow your audience.'
                ) : (
                  'Ready to discover some amazing recipes today?'
                )}
              </p>
              {user && (
                <p className="text-sm text-gray-500">
                  Logged in as: {user.email} • {isCreatorMode ? 'Creator Mode' : 'Consumer Mode'}
                </p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isCreatorMode ? (
                <>
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <PenTool className="w-8 h-8" />
                      <span className="text-primary-100 text-sm">Create</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">New Recipe</h3>
                    <p className="text-primary-100 mb-4">Share your culinary creation</p>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="bg-white text-primary-600 hover:bg-gray-100"
                      onClick={handleCreateRecipe}
                    >
                      Create Recipe
                    </Button>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border">
                    <div className="flex items-center justify-between mb-4">
                      <BarChart3 className="w-8 h-8 text-blue-500" />
                      <span className="text-gray-400 text-sm">Analytics</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">View Analytics</h3>
                    <p className="text-gray-600 mb-4">Track your performance</p>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>

            {/* Recipe Feed / Creator Content */}
            <div className="bg-white rounded-2xl shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {isCreatorMode ? 'Your Published Recipes' : 'Recipe Feed'}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {!isCreatorMode && (
                      <Button variant="ghost" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="text-primary-600">
                      View All
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {(isCreatorMode ? publishedRecipes : recentRecipes).map((recipe, index) => (
                  <div key={index} className="flex space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="relative overflow-hidden rounded-xl w-24 h-24 flex-shrink-0">
                      <img
                        src={recipe.image}
                        alt={recipe.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-xs font-medium">{recipe.rating}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{recipe.name}</h4>
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <Clock className="w-4 h-4 mr-1" />
                            {recipe.time}
                            {isCreatorMode && recipe.views && (
                              <>
                                <span className="mx-2">•</span>
                                <Eye className="w-4 h-4 mr-1" />
                                {recipe.views} views
                              </>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            {isCreatorMode ? (
                              <>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  recipe.status === 'Published' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {recipe.status}
                                </span>
                                <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
                                  <BarChart3 className="w-4 h-4" />
                                  <span>Analytics</span>
                                </button>
                              </>
                            ) : (
                              <>
                                <button className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                                  <Heart className="w-4 h-4" />
                                  <span>Save</span>
                                </button>
                                <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
                                  <BookOpen className="w-4 h-4" />
                                  <span>View Recipe</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Widgets */}
        <aside className="w-80 bg-white border-l border-gray-200 min-h-screen sticky top-0">
          <div className="p-6 space-y-6">
            {/* Stats Widget */}
            <div className="bg-gray-50 rounded-2xl p-4">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-primary-600" />
                {isCreatorMode ? 'Creator Stats' : 'Your Stats'}
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {currentStats.map((stat, index) => (
                  <div key={index} className="bg-white rounded-xl p-3 text-center">
                    <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-1`} />
                    <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-600">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Creator Insights or Trending Topics */}
            {isCreatorMode ? (
              <div className="bg-gray-50 rounded-2xl p-4">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                  Performance Insights
                </h4>
                <div className="space-y-3">
                  {creatorInsights.map((insight, index) => (
                    <div key={index} className="bg-white rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-medium text-gray-900 text-sm">{insight.title}</h5>
                        <span className="text-xs text-green-600 font-medium">{insight.change}</span>
                      </div>
                      <p className="text-sm text-gray-600">{insight.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-4">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                  Trending Topics
                </h4>
                <div className="space-y-2">
                  {trendingTopics.map((topic, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-white transition-colors text-sm text-gray-700 hover:text-primary-600"
                    >
                      #{topic.replace(/\s+/g, '')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Events Widget */}
            <div className="bg-gray-50 rounded-2xl p-4">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                {isCreatorMode ? 'Creator Events' : 'Upcoming Events'}
              </h4>
              <div className="space-y-3">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="bg-white rounded-lg p-3">
                    <h5 className="font-medium text-gray-900 text-sm mb-1">{event.title}</h5>
                    <div className="flex items-center text-xs text-gray-600">
                      <span>{event.date}</span>
                      <span className="mx-2">•</span>
                      <span>{event.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievement Widget */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-4 border border-yellow-200">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Award className="w-5 h-5 mr-2 text-yellow-600" />
                Recent Achievement
              </h4>
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <p className="font-medium text-gray-900 text-sm">
                  {isCreatorMode ? 'Rising Creator' : 'Recipe Explorer'}
                </p>
                <p className="text-xs text-gray-600">
                  {isCreatorMode ? 'Reached 1K followers!' : 'Saved 25 recipes this month!'}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Recipe Creation Modal */}
      <RecipeCreationModal
        isOpen={showRecipeModal}
        onClose={() => setShowRecipeModal(false)}
        onSave={handleSaveRecipe}
        onPublish={handlePublishRecipe}
      />
    </div>
  );
};

export default Dashboard;