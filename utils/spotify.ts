// utils/spotify.ts
import { getSpotifyToken, SpotifyTrack } from "./spotifyPlayer";

// Updated getRandomTracksByDecade function
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
      const randomYear =
        Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
      years.push(randomYear);
    }

    console.log(`Attempting to fetch tracks for ${years.length} years`);

    // Get tracks for each year
    const trackPromises = years.map((year) => getTrackFromYear(token, year));
    const tracksResults = await Promise.all(trackPromises);

    // Filter out null tracks and tracks without preview URLs
    const validTracks = tracksResults.filter(
      (track): track is SpotifyTrack => track !== null
    );

    if (validTracks.length < limit) {
      // As a fallback, include tracks without preview URLs
      const tracksWithoutPreviews = tracksResults.filter(
        (track): track is SpotifyTrack => track !== null
      );

      console.log(
        `Found ${tracksWithoutPreviews.length} additional tracks without preview URLs`
      );

      // Combine and limit to what we need
      const allTracks = [...validTracks, ...tracksWithoutPreviews];
      return allTracks.slice(0, limit);
    }

    return validTracks.slice(0, limit);
  } catch (error) {
    console.error("Error getting random tracks:", error);
    throw error;
  }
};

// Updated getTrackFromYear function
const getTrackFromYear = async (
  token: string,
  year: number
): Promise<SpotifyTrack | null> => {
  try {
    // Use market=from_token to get tracks available in the user's market
    // Add popularity to get more well-known tracks
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=year:${year}%20genre:pop&type=track&limit=50&market=from_token`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
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
      (track: any) =>
        track.preview_url && track.preview_url.startsWith("https://")
    );

    if (tracksWithPreviews.length > 0) {
      // Get a random track from the filtered results
      const randomIndex = Math.floor(Math.random() * tracksWithPreviews.length);
      const track = tracksWithPreviews[randomIndex];

      return {
        id: track.id,
        name: track.name,
        artist: track.artists.map((artist: any) => artist.name).join(", "),
        year: year,
        uri: track.uri,
        albumCover: track.album.images[0]?.url || null,
      };
    }

    // Fall back to a track without preview if necessary
    const track = data.tracks.items[0];
    return {
      id: track.id,
      name: track.name,
      artist: track.artists.map((artist: any) => artist.name).join(", "),
      year: year,
      uri: track.uri,
      albumCover: track.album.images[0]?.url || null,
    };
  } catch (error) {
    console.error(`Error getting track from year ${year}:`, error);
    return null;
  }
};
