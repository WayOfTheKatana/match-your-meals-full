// Utility to get or create a unique session ID for analytics tracking
export function getOrCreateSessionId() {
  let sessionId = localStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('session_id', sessionId);
  }
  return sessionId;
}

// Save geolocation data with view
export async function recordRecipeView(recipeId, userId, geolocationData) {
  const sessionId = getOrCreateSessionId();
  
  try {
    const { data, error } = await fetch('/api/record-view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipe_id: recipeId,
        user_id: userId,
        session_id: sessionId,
        country_code: geolocationData?.country_code,
        country_name: geolocationData?.country_name,
        city: geolocationData?.city,
        region: geolocationData?.region,
        latitude: geolocationData?.latitude,
        longitude: geolocationData?.longitude
      }),
    });
    
    if (error) {
      console.error('Error recording view:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error recording view:', error);
    return false;
  }
}