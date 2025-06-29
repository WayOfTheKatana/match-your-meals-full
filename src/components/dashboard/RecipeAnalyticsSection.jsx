import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { Loader2, AlertCircle, BarChart3, MapPin, Calendar, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../ui/button';

// Fetch all recipes by the current user
const fetchUserRecipes = async (userId) => {
  const { data, error } = await supabase
    .from('recipes')
    .select('id, title, slug')
    .eq('creator_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
};

// Fetch analytics for all recipes for a specific date
const fetchRecipeAnalyticsForDate = async (userId, date) => {
  // Get all recipe IDs for this user
  const { data: userRecipes, error: recipesError } = await supabase
    .from('recipes')
    .select('id')
    .eq('creator_id', userId);
  if (recipesError) throw new Error(recipesError.message);
  const recipeIds = (userRecipes || []).map(r => r.id);
  if (!recipeIds.length) return [];

  // Query all views for these recipes on the selected date
  const { data: views, error: viewsError } = await supabase
    .from('recipe_views')
    .select('recipe_id, user_id, session_id, viewed_at, country_code, country_name, city, region')
    .in('recipe_id', recipeIds)
    .gte('viewed_at', date + 'T00:00:00.000Z')
    .lte('viewed_at', date + 'T23:59:59.999Z');
  if (viewsError) throw new Error(viewsError.message);

  // Group by recipe and count unique views
  const analytics = {};
  recipeIds.forEach(id => {
    analytics[id] = { 
      totalViews: 0, 
      uniqueUsers: new Set(), 
      sessionViews: new Set(),
      countries: {},
      regions: {}
    };
  });
  
  // Use a set to deduplicate by (user_id or session_id) per recipe
  const uniqueViewKeys = {};
  recipeIds.forEach(id => { uniqueViewKeys[id] = new Set(); });
  
  (views || []).forEach(view => {
    if (!analytics[view.recipe_id]) return;
    
    // Use user_id if available, else session_id
    const key = view.user_id ? `u:${view.user_id}` : `s:${view.session_id}`;
    uniqueViewKeys[view.recipe_id].add(key);
    
    if (view.user_id) analytics[view.recipe_id].uniqueUsers.add(view.user_id);
    if (view.session_id) analytics[view.recipe_id].sessionViews.add(view.session_id);
    
    // Track country data
    if (view.country_name) {
      analytics[view.recipe_id].countries[view.country_name] = 
        (analytics[view.recipe_id].countries[view.country_name] || 0) + 1;
    }
    
    // Track region data
    if (view.region) {
      analytics[view.recipe_id].regions[view.region] = 
        (analytics[view.recipe_id].regions[view.region] || 0) + 1;
    }
  });
  
  Object.keys(analytics).forEach(id => {
    // Set totalViews to the raw count of all view records for this recipe
    analytics[id].totalViews = (views || []).filter(view => view.recipe_id === id).length;
    analytics[id].uniqueUsers = analytics[id].uniqueUsers.size;
    analytics[id].sessionViews = analytics[id].sessionViews.size;
    
    // Convert country and region data to sorted arrays
    analytics[id].countriesList = Object.entries(analytics[id].countries)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
      
    analytics[id].regionsList = Object.entries(analytics[id].regions)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  });
  
  return analytics;
};

// Fetch country analytics for all recipes
// const fetchCountryAnalytics = async (userId) => {
//   // Get all recipe IDs for this user
//   const { data: userRecipes, error: recipesError } = await supabase
//     .from('recipes')
//     .select('id')
//     .eq('creator_id', userId);
//   if (recipesError) throw new Error(recipesError.message);
//   const recipeIds = (userRecipes || []).map(r => r.id);
//   if (!recipeIds.length) return [];

//   // Query all views with country data
//   const { data: views, error: viewsError } = await supabase
//     .from('recipe_views')
//     .select('country_code, country_name, count')
//     .in('recipe_id', recipeIds)
//     .not('country_name', 'is', null)
//     .group('country_code, country_name');
  
//   if (viewsError) throw new Error(viewsError.message);
  
//   return views || [];
// };

// Fixed fetchCountryAnalytics function
const fetchCountryAnalytics = async (userId) => {
  // Get all recipe IDs for this user
  const { data: userRecipes, error: recipesError } = await supabase
    .from('recipes')
    .select('id')
    .eq('creator_id', userId);
  if (recipesError) throw new Error(recipesError.message);
  const recipeIds = (userRecipes || []).map(r => r.id);
  if (!recipeIds.length) return [];

  // Query all views with country data (without .group())
  const { data: views, error: viewsError } = await supabase
    .from('recipe_views')
    .select('country_code, country_name')
    .in('recipe_id', recipeIds)
    .not('country_name', 'is', null);
  
  if (viewsError) throw new Error(viewsError.message);
  
  // Group the results manually
  const countryCount = {};
  (views || []).forEach(view => {
    const key = `${view.country_code}-${view.country_name}`;
    if (!countryCount[key]) {
      countryCount[key] = {
        country_code: view.country_code,
        country_name: view.country_name,
        count: 0
      };
    }
    countryCount[key].count++;
  });
  
  // Convert to array and sort by count
  return Object.values(countryCount)
    .sort((a, b) => b.count - a.count);
};

// Skeleton Loading Components
const AnalyticsTableSkeleton = () => (
  <div className="overflow-x-auto">
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 animate-pulse">
      <div className="min-w-full">
        {/* Table Header */}
        <div className="grid grid-cols-4 bg-gray-50 rounded-t-xl">
          <div className="px-6 py-3">
            <div className="h-6 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="px-6 py-3 text-center">
            <div className="h-6 bg-gray-200 rounded w-20 mx-auto"></div>
          </div>
          <div className="px-6 py-3 text-center">
            <div className="h-6 bg-gray-200 rounded w-24 mx-auto"></div>
          </div>
          <div className="px-6 py-3 text-center">
            <div className="h-6 bg-gray-200 rounded w-24 mx-auto"></div>
          </div>
        </div>
        
        {/* Table Rows */}
        {[...Array(6)].map((_, index) => (
          <div key={index} className={`grid grid-cols-4 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
            <div className="px-6 py-4">
              <div className="h-5 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="px-6 py-4 text-center">
              <div className="h-5 bg-gray-200 rounded w-8 mx-auto"></div>
            </div>
            <div className="px-6 py-4 text-center">
              <div className="h-5 bg-gray-200 rounded w-8 mx-auto"></div>
            </div>
            <div className="px-6 py-4 text-center">
              <div className="h-5 bg-gray-200 rounded w-8 mx-auto"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const DatePickerSkeleton = () => (
  <div className="mb-4 animate-pulse">
    <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
    <div className="h-10 bg-gray-200 rounded w-48"></div>
  </div>
);

const HeaderSkeleton = () => (
  <div className="h-8 bg-gray-200 rounded w-64 mb-8 animate-pulse"></div>
);

const CountryAnalyticsSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 animate-pulse mt-8">
    <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
    <div className="grid grid-cols-2 gap-4">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="h-16 bg-gray-200 rounded"></div>
      ))}
    </div>
  </div>
);

const RecipeAnalyticsSection = () => {
  const { user } = useAuth();
  // Date state (default today)
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  
  const [showCountryAnalytics, setShowCountryAnalytics] = useState(true);

  // Fetch recipes
  const {
    data: recipes = [],
    isLoading: recipesLoading,
    error: recipesError,
  } = useQuery({
    queryKey: ['userRecipes', user?.id],
    queryFn: () => fetchUserRecipes(user.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch analytics for selected date
  const {
    data: analytics = {},
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useQuery({
    queryKey: ['recipeAnalyticsForDate', user?.id, selectedDate],
    queryFn: () => fetchRecipeAnalyticsForDate(user.id, selectedDate),
    enabled: !!user && !!selectedDate,
    staleTime: 1000 * 60 * 5,
  });
  
  // Fetch country analytics
  const {
    data: countryAnalytics = [],
    isLoading: countryAnalyticsLoading,
    error: countryAnalyticsError,
  } = useQuery({
    queryKey: ['countryAnalytics', user?.id],
    queryFn: () => fetchCountryAnalytics(user.id),
    enabled: !!user && showCountryAnalytics,
    staleTime: 1000 * 60 * 5,
  });

  const isLoading = recipesLoading || analyticsLoading;
  const isCountryLoading = countryAnalyticsLoading;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <HeaderSkeleton />
        <DatePickerSkeleton />
        <AnalyticsTableSkeleton />
        <CountryAnalyticsSkeleton />
      </div>
    );
  }

  if (recipesError || analyticsError) {
    return (
      <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
        <span className="text-red-700">{recipesError?.message || analyticsError?.message}</span>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p className="text-lg font-semibold">No published recipes yet.</p>
        <p className="text-sm">Publish recipes to see analytics here!</p>
      </div>
    );
  }

  // Calculate total views across all recipes
  const totalViewsAllRecipes = Object.values(analytics).reduce(
    (sum, recipeAnalytics) => sum + recipeAnalytics.totalViews, 0
  );

  // Get top countries
  const allCountries = {};
  Object.values(analytics).forEach(recipeAnalytics => {
    if (recipeAnalytics.countriesList) {
      recipeAnalytics.countriesList.forEach(country => {
        allCountries[country.name] = (allCountries[country.name] || 0) + country.count;
      });
    }
  });
  
  const topCountries = Object.entries(allCountries)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold mb-4">Recipe Analytics Overview</h2>
      
      {/* Date Picker */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
        <input
          type="date"
          className="border rounded px-3 py-2"
          value={selectedDate}
          max={new Date().toISOString().slice(0, 10)}
          onChange={e => setSelectedDate(e.target.value)}
        />
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <h4 className="text-sm font-medium text-gray-500 mb-1">Total Views</h4>
          <p className="text-3xl font-bold text-primary-600">{totalViewsAllRecipes}</p>
          <p className="text-xs text-gray-500 mt-1">On {new Date(selectedDate).toLocaleDateString()}</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <h4 className="text-sm font-medium text-gray-500 mb-1">Top Recipe</h4>
          <p className="text-xl font-bold text-gray-900 truncate">
            {Object.entries(analytics)
              .sort((a, b) => b[1].totalViews - a[1].totalViews)
              .map(([id, data]) => recipes.find(r => r.id === id)?.title)
              .filter(Boolean)[0] || 'No views'}
          </p>
          <p className="text-xs text-gray-500 mt-1">Most viewed recipe</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <h4 className="text-sm font-medium text-gray-500 mb-1">Top Country</h4>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 text-primary-600 mr-2" />
            <p className="text-xl font-bold text-gray-900">
              {topCountries.length > 0 ? topCountries[0].name : 'No data'}
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {topCountries.length > 0 ? `${topCountries[0].count} views` : 'No location data available'}
          </p>
        </div>
      </div>

      {/* Analytics Table - Modern UI */}
      <div className="overflow-x-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left font-semibold text-gray-700 rounded-tl-2xl">Recipe</th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700">Total Views</th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700">Unique Users</th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700 rounded-tr-2xl">Session Views</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((recipe, idx) => (
                <tr
                  key={recipe.id}
                  className={
                    `transition hover:bg-gray-50 ${idx === recipes.length - 1 ? 'rounded-b-2xl' : ''}`
                  }
                >
                  <td className="px-6 py-4 text-gray-900 font-medium flex items-center space-x-3">
                    {recipe.slug ? (
                      <Link
                        to={`/recipes/${recipe.slug}`}
                        className="text-primary-600 hover:underline font-semibold"
                      >
                        {recipe.title}
                      </Link>
                    ) : (
                      <span>{recipe.title}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-lg text-gray-800">{analytics[recipe.id]?.totalViews || 0}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-lg text-gray-800">{analytics[recipe.id]?.uniqueUsers || 0}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-lg text-gray-800">{analytics[recipe.id]?.sessionViews || 0}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Country Analytics */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-primary-600" />
            Geographic Distribution
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCountryAnalytics(!showCountryAnalytics)}
            className="flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>{showCountryAnalytics ? 'Hide Details' : 'Show Details'}</span>
          </Button>
        </div>
        
        {showCountryAnalytics && (
          <>
            {isCountryLoading ? (
              <CountryAnalyticsSkeleton />
            ) : countryAnalyticsError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{countryAnalyticsError.message}</p>
              </div>
            ) : topCountries.length > 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Top Countries</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {topCountries.map((country, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-primary-600 mr-2" />
                        <span className="font-medium">{country.name}</span>
                      </div>
                      <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs font-medium">
                        {country.count} view{country.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Geographic data is collected anonymously to help you understand where your recipes are most popular.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 text-center">
                <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-600">No geographic data available yet</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RecipeAnalyticsSection;