import React from 'react';
import { MapPin, Globe, Navigation } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useQuery } from '@tanstack/react-query';

// Fetch geographic analytics data
const fetchGeoAnalytics = async (userId) => {
  if (!userId) return { countries: [], regions: [] };
  
  // Get all recipe IDs for this user
  const { data: userRecipes, error: recipesError } = await supabase
    .from('recipes')
    .select('id')
    .eq('creator_id', userId);
  
  if (recipesError) throw recipesError;
  const recipeIds = (userRecipes || []).map(r => r.id);
  if (!recipeIds.length) return { countries: [], regions: [] };
  
  // Get country analytics - using count aggregation in the select statement
  const { data: countryData, error: countryError } = await supabase
    .from('recipe_views')
    .select('country_name, count(*)')
    .in('recipe_id', recipeIds)
    .not('country_name', 'is', null)
    .order('count', { ascending: false })
    .limit(10);
  
  if (countryError) throw countryError;
  
  // Get region analytics - using count aggregation in the select statement
  const { data: regionData, error: regionError } = await supabase
    .from('recipe_views')
    .select('region, count(*)')
    .in('recipe_id', recipeIds)
    .not('region', 'is', null)
    .order('count', { ascending: false })
    .limit(10);
  
  if (regionError) throw regionError;
  
  return {
    countries: countryData || [],
    regions: regionData || []
  };
};

const GeoAnalyticsWidget = () => {
  const { user } = useAuth();
  
  const {
    data: geoData = { countries: [], regions: [] },
    isLoading,
    error
  } = useQuery({
    queryKey: ['geoAnalytics', user?.id],
    queryFn: () => fetchGeoAnalytics(user?.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow p-4 mb-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-8"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow p-4 mb-4">
        <h3 className="text-lg font-semibold mb-2 flex items-center text-red-600">
          <MapPin className="w-5 h-5 mr-2" />
          Error Loading Geographic Data
        </h3>
        <p className="text-sm text-red-500">{error.message}</p>
      </div>
    );
  }
  
  const hasCountryData = geoData.countries.length > 0;
  const hasRegionData = geoData.regions.length > 0;
  
  if (!hasCountryData && !hasRegionData) {
    return (
      <div className="bg-white rounded-xl shadow p-4 mb-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Globe className="w-5 h-5 mr-2 text-primary-600" />
          Geographic Insights
        </h3>
        <div className="text-center py-4">
          <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No geographic data available yet</p>
          <p className="text-xs text-gray-500 mt-1">Data will appear as your recipes get views</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow p-4 mb-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Globe className="w-5 h-5 mr-2 text-primary-600" />
        Geographic Insights
      </h3>
      
      {hasCountryData && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <MapPin className="w-4 h-4 mr-1 text-primary-600" />
            Top Countries
          </h4>
          <div className="space-y-2">
            {geoData.countries.slice(0, 5).map((country, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{country.country_name}</span>
                <span className="font-medium text-primary-700 text-sm">{country.count} views</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {hasRegionData && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Navigation className="w-4 h-4 mr-1 text-primary-600" />
            Top Regions
          </h4>
          <div className="space-y-2">
            {geoData.regions.slice(0, 3).map((region, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{region.region}</span>
                <span className="font-medium text-primary-700 text-sm">{region.count} views</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GeoAnalyticsWidget;