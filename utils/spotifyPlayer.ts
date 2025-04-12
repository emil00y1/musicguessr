// utils/spotifyPlayer.ts
import { createClient } from "@/utils/supabase/client";

declare global {
  interface Window {
    Spotify: any;
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

// Types for player state management
export interface SpotifyPlayerState {
  isConnected: boolean;
  deviceId: string | null;
  isPaused: boolean;
  currentTrack: {
    name: string;
    uri: string;
    artist: string;
    albumArt: string | null;
  } | null;
  error: string | null;
}

export interface SpotifyPlayerAPI {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  play: (uri: string) => Promise<boolean>;
  pause: () => Promise<boolean>;
  resume: () => Promise<boolean>;
  getPlayerState: () => SpotifyPlayerState;
  addListener?: (event: string, callback: (state: any) => void) => void;
}

// Export the SpotifyTrack interface from here too so it's all in one place
export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  year: number;
  uri: string;
  albumCover: string | null;
}

// Load the Spotify Web Playback SDK script
export const loadSpotifyScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.Spotify) {
      console.log("Spotify SDK already loaded");
      resolve();
      return;
    }

    // Check if script is already in the DOM but not loaded yet
    const existingScript = document.querySelector(
      'script[src="https://sdk.scdn.co/spotify-player.js"]'
    );
    if (existingScript) {
      console.log("Spotify SDK script tag already exists, waiting for load");
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", (e) =>
        reject(new Error("Failed to load Spotify SDK"))
      );
      return;
    }

    // Add script if not present
    console.log("Adding Spotify SDK script to document");
    window.onSpotifyWebPlaybackSDKReady = () => {
      console.log("Spotify SDK ready callback fired");
      resolve();
    };

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    script.id = "spotify-player-sdk";

    script.onerror = (error) => {
      console.error("Error loading Spotify SDK script:", error);
      reject(new Error("Failed to load Spotify SDK"));
    };

    document.body.appendChild(script);
  });
};

// Function to get Spotify access token
export const getSpotifyToken = async (): Promise<string> => {
  try {
    const supabase = createClient();

    // First verify the user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Not authenticated");
    }

    // Get the session for the provider token
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      throw new Error("No active session");
    }

    // Extract the Spotify access token from provider_token
    const providerToken = data.session.provider_token;

    if (!providerToken) {
      throw new Error("No Spotify token available");
    }

    console.log("Retrieved Spotify token");
    return providerToken;
  } catch (error) {
    console.error("Error getting Spotify token:", error);
    throw error;
  }
};

// Create and manage a Spotify player
export const createSpotifyPlayer = (): Promise<SpotifyPlayerAPI> => {
  let playerState: SpotifyPlayerState = {
    isConnected: false,
    deviceId: null,
    isPaused: true,
    currentTrack: null,
    error: null,
  };

  let player: any = null;

  return new Promise(async (resolve, reject) => {
    try {
      // First make sure the SDK script is loaded
      await loadSpotifyScript();
      console.log("SDK script loaded, creating player");

      // Get initial token
      const token = await getSpotifyToken();
      console.log("Token retrieved for player initialization");

      // Create player
      player = new window.Spotify.Player({
        name: "Hitster Game Player",
        getOAuthToken: async (callback: (token: string) => void) => {
          // This function will be called when the player needs a fresh token
          try {
            const token = await getSpotifyToken();
            console.log("Token refreshed for player");
            callback(token);
          } catch (error) {
            console.error("Error refreshing token:", error);
            playerState.error = "Authentication error";
            callback(""); // Call with empty token to signal error
          }
        },
        volume: 0.5,
      });

      console.log("Player instance created, setting up listeners");

      // Error handling
      player.addListener(
        "initialization_error",
        ({ message }: { message: string }) => {
          console.error("Initialization error:", message);
          playerState.error = message;
        }
      );

      player.addListener(
        "authentication_error",
        ({ message }: { message: string }) => {
          console.error("Authentication error:", message);
          playerState.error =
            "Authentication failed. Spotify Premium is required.";
        }
      );

      player.addListener(
        "account_error",
        ({ message }: { message: string }) => {
          console.error("Account error:", message);
          playerState.error = "Account error. Spotify Premium is required.";
        }
      );

      player.addListener(
        "playback_error",
        ({ message }: { message: string }) => {
          console.error("Playback error:", message);
          playerState.error = `Playback error: ${message}`;
        }
      );

      // Player status updates
      player.addListener("ready", ({ device_id }: { device_id: string }) => {
        console.log("Spotify player ready with device ID:", device_id);
        playerState.deviceId = device_id;
        playerState.isConnected = true;
        playerState.error = null;
      });

      player.addListener(
        "not_ready",
        ({ device_id }: { device_id: string }) => {
          console.log("Spotify player disconnected:", device_id);
          playerState.isConnected = false;
        }
      );

      // Playback status updates
      player.addListener("player_state_changed", (state: any) => {
        if (!state) return;

        playerState.isPaused = state.paused;

        if (state.track_window.current_track) {
          const track = state.track_window.current_track;
          playerState.currentTrack = {
            name: track.name,
            uri: track.uri,
            artist: track.artists.map((a: any) => a.name).join(", "),
            albumArt: track.album.images[0]?.url || null,
          };
        }
      });

      // Connect the player
      console.log("Connecting player...");
      player
        .connect()
        .then((success: boolean) => {
          console.log("Player connect result:", success);
          if (!success) {
            console.error("Failed to connect player");
            playerState.error = "Failed to connect to Spotify";
          }
        })
        .catch((error: any) => {
          console.error("Player connect error:", error);
          playerState.error = "Error connecting to Spotify";
        });

      // Create the API
      const playerAPI: SpotifyPlayerAPI = {
        connect: async () => {
          if (playerState.isConnected) return true;
          try {
            return await player.connect();
          } catch (error) {
            console.error("Player connect error:", error);
            return false;
          }
        },

        disconnect: () => {
          if (player) {
            player.disconnect();
            playerState.isConnected = false;
          }
        },

        play: async (uri: string) => {
          console.log(`Attempting to play: ${uri}`);
          if (!playerState.deviceId) {
            console.error("No device ID available for playback");
            return false;
          }

          try {
            const token = await getSpotifyToken();
            console.log(`Playing on device: ${playerState.deviceId}`);
            const response = await fetch(
              `https://api.spotify.com/v1/me/player/play?device_id=${playerState.deviceId}`,
              {
                method: "PUT",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  uris: [uri],
                }),
              }
            );

            console.log("Play API response status:", response.status);

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              console.error("Error playing track:", errorData);
              playerState.error = `Playback error: ${response.status}`;
              return false;
            }

            return true;
          } catch (error) {
            console.error("Error playing track:", error);
            playerState.error = "Failed to play track";
            return false;
          }
        },

        pause: async () => {
          if (!player) return false;

          try {
            await player.pause();
            return true;
          } catch (error) {
            console.error("Error pausing playback:", error);
            return false;
          }
        },

        resume: async () => {
          if (!player) return false;

          try {
            await player.resume();
            return true;
          } catch (error) {
            console.error("Error resuming playback:", error);
            return false;
          }
        },

        getPlayerState: () => ({ ...playerState }),

        // Add the addListener method
        addListener: (event, callback) => {
          if (player && player.addListener) {
            player.addListener(event, callback);
          }
        },
      };

      resolve(playerAPI);
    } catch (error) {
      console.error("Error creating Spotify player:", error);
      reject(error);
    }
  });
};
