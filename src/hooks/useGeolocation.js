import { useQuery } from '@tanstack/react-query';

export const useGeolocation = () => {
  const fetchGeolocation = async () => {
    try {
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
    retry: 1, // Only retry once to avoid excessive API calls
  });
};