// spotify.ts
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

// Updated interface to include Spotify URI
export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  year: number;
  uri: string;
  previewUrl: string | null;
  albumCover: string | null;
}

console.log("About to retrieve Spotify token");

// Helper function to get Spotify access token
export const getSpotifyToken = async (): Promise<string> => {
  try {
    const supabase = createClient();
    
    // First verify the user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Not authenticated');
    }
    
    // Get the session for the provider token
    const { data, error } = await supabase.auth.getSession();
    
    if (error || !data.session) {
      throw new Error('No active session');
    }
    
    // Extract the Spotify access token from provider_token
    const providerToken = data.session.provider_token;
    
    if (!providerToken) {
      throw new Error('No Spotify token available');
    }
    
    return providerToken;
  } catch (error) {
    console.error('Error getting Spotify token:', error);
    throw error;
  }
};

console.log("Token retrieved, about to create player");

// Updated getRandomTracksByDecade function for spotify.ts
export const getRandomTracksByDecade = async (
  startYear: number, 
  endYear: number, 
  limit = 5
): Promise<SpotifyTrack[]> => {
  try {
    const token = await getSpotifyToken();
    
    // More attempts to ensure we get enough tracks
    const maxAttempts = limit * 4; // Try more years to get enough tracks
    const years: number[] = [];
    
    for (let i = 0; i < maxAttempts; i++) {
      const randomYear = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
      years.push(randomYear);
    }
    
    console.log(`Attempting to fetch tracks for ${years.length} years`);
    
    // Get tracks for each year
    const trackPromises = years.map(year => getTrackFromYear(token, year));
    const tracksResults = await Promise.all(trackPromises);
    
    // Filter out null tracks and tracks without preview URLs
    const validTracks = tracksResults.filter((track): track is SpotifyTrack => 
      track !== null && track.previewUrl !== null
    );
    
    console.log(`Found ${validTracks.length} valid tracks with preview URLs`);
    
    if (validTracks.length < limit) {
      // As a fallback, include tracks without preview URLs
      const tracksWithoutPreviews = tracksResults.filter((track): track is SpotifyTrack => 
        track !== null && track.previewUrl === null
      );
      
      console.log(`Found ${tracksWithoutPreviews.length} additional tracks without preview URLs`);
      
      // Combine and limit to what we need
      const allTracks = [...validTracks, ...tracksWithoutPreviews];
      return allTracks.slice(0, limit);
    }
    
    return validTracks.slice(0, limit);
  } catch (error) {
    console.error('Error getting random tracks:', error);
    throw error;
  }
};

// Updated getTrackFromYear function
const getTrackFromYear = async (token: string, year: number): Promise<SpotifyTrack | null> => {
  try {
    // Use market=from_token to get tracks available in the user's market
    // Add popularity to get more well-known tracks
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=year:${year}%20genre:pop&type=track&limit=50&market=from_token`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      console.error(`Spotify API error ${response.status} for year ${year}`);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.tracks || !data.tracks.items || data.tracks.items.length === 0) {
      console.warn(`No tracks found for year ${year}`);
      return null;
    }
    
    // Prioritize tracks with preview URLs
    const tracksWithPreviews = data.tracks.items.filter(
      (track: any) => track.preview_url && track.preview_url.startsWith('https://')
    );
    
    if (tracksWithPreviews.length > 0) {
      // Get a random track from the filtered results
      const randomIndex = Math.floor(Math.random() * tracksWithPreviews.length);
      const track = tracksWithPreviews[randomIndex];
      
      return {
        id: track.id,
        name: track.name,
        artist: track.artists.map((artist: any) => artist.name).join(', '),
        year: year,
        uri: track.uri,
        previewUrl: track.preview_url,
        albumCover: track.album.images[0]?.url || null
      };
    }
    
    // Fall back to a track without preview if necessary
    const track = data.tracks.items[0];
    return {
      id: track.id,
      name: track.name,
      artist: track.artists.map((artist: any) => artist.name).join(', '),
      year: year,
      uri: track.uri,
      previewUrl: null,
      albumCover: track.album.images[0]?.url || null
    };
  } catch (error) {
    console.error(`Error getting track from year ${year}:`, error);
    return null;
  }
};