"use client";

import { useState, useEffect, useRef } from "react";
import {
  createSpotifyPlayer,
  SpotifyPlayerAPI,
  SpotifyPlayerState,
} from "@/utils/spotifyPlayer";

interface UseSpotifyPlayerReturn {
  player: SpotifyPlayerAPI | null;
  isPlaying: boolean;
  playerError: string | null;
  playerInitializing: boolean;
  playTrack: (uri: string) => Promise<void>;
  pauseTrack: () => Promise<void>;
}

export function useSpotifyPlayer(): UseSpotifyPlayerReturn {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [playerInitializing, setPlayerInitializing] = useState<boolean>(true);
  const playerRef = useRef<SpotifyPlayerAPI | null>(null);

  useEffect(() => {
    const initSpotifyPlayer = async (): Promise<void> => {
      try {
        setPlayerInitializing(true);
        const player = await createSpotifyPlayer();
        playerRef.current = player;

        // Add event listeners for state changes
        if (player.addListener) {
          player.addListener("ready", () => {
            setPlayerInitializing(false);
          });

          player.addListener("not_ready", () => {
            setPlayerError("Spotify player is not ready");
          });

          player.addListener("player_state_changed", (state: any) => {
            setIsPlaying(!state.paused);
          });
        }
      } catch (error) {
        console.error("Error initializing Spotify player:", error);
        setPlayerError("Failed to initialize Spotify player");
        setPlayerInitializing(false);
      }
    };

    initSpotifyPlayer();

    // Cleanup
    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
      }
    };
  }, []);

  const playTrack = async (uri: string): Promise<void> => {
    if (!playerRef.current) {
      setPlayerError("Spotify player not initialized");
      return;
    }

    try {
      const success = await playerRef.current.play(uri);
      if (!success) {
        setPlayerError("Failed to play track");
      }
    } catch (error) {
      console.error("Error playing track:", error);
      setPlayerError("Failed to play track");
    }
  };

  const pauseTrack = async (): Promise<void> => {
    if (!playerRef.current) {
      setPlayerError("Spotify player not initialized");
      return;
    }

    try {
      const success = await playerRef.current.pause();
      if (!success) {
        setPlayerError("Failed to pause track");
      }
    } catch (error) {
      console.error("Error pausing track:", error);
      setPlayerError("Failed to pause track");
    }
  };

  return {
    player: playerRef.current,
    isPlaying,
    playerError,
    playerInitializing,
    playTrack,
    pauseTrack,
  };
}
