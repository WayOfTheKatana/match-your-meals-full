import { useQuery } from '@tanstack/react-query';

export const useGeolocation = () => {
  const fetchGeolocation = async () => {
    try {
      // Use a more reliable free geolocation API with higher rate limits
      const response = await fetch('https://ipapi.co/json/');
      
      if (!response.ok) {
        throw new Error(`Geolocation API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching geolocation:', error);
      throw error;
    }
  };

  return useQuery({
    queryKey: ['geolocation'],
    queryFn: fetchGeolocation,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    retry: 3, // Retry up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff with max 30s delay
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnReconnect: false, // Don't refetch when reconnecting
  });
};