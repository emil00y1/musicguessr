"use client";

import { useState } from "react";
import { getRandomTracksByDecade } from "@/utils/spotify";
import { SpotifyTrack } from "@/utils/spotifyPlayer";
import { TimelineItem, RoundResultData } from "@/types/types";

// Game state type
type GameStateType = "loading" | "ready" | "playing" | "gameOver";

interface UseGameStateReturn {
  gameState: GameStateType;
  timeline: TimelineItem[];
  currentSong: SpotifyTrack | null;
  songs: SpotifyTrack[];
  currentSongIndex: number;
  score: number;
  error: string | null;
  loading: boolean;
  roundResult: RoundResultData | null;
  initializeGame: () => Promise<void>;
  addSongToTimeline: (song: SpotifyTrack, position: number) => void;
  completeRound: (pointsEarned: number, isCorrect: boolean) => void;
  resetGame: () => void;
  setGameState: (state: GameStateType) => void;
}

export function useGameState(): UseGameStateReturn {
  const [gameState, setGameState] = useState<GameStateType>("loading");
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [currentSong, setCurrentSong] = useState<SpotifyTrack | null>(null);
  const [songs, setSongs] = useState<SpotifyTrack[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [roundResult, setRoundResult] = useState<RoundResultData | null>(null);

  const initializeGame = async (): Promise<void> => {
    setLoading(true);
    try {
      // Fetch random songs from Spotify API
      const tracks = await getRandomTracksByDecade(1950, 2025, 10);

      if (!tracks || tracks.length < 5) {
        throw new Error("Could not fetch enough tracks. Please try again.");
      }

      // Sort tracks by year
      const sortedTracks = [...tracks].sort((a, b) => a.year - b.year);

      // Pick a random song from the middle as the initial marker
      const middleIndex = Math.floor(sortedTracks.length / 2);
      const initialSong = sortedTracks[middleIndex];

      // Create a timeline with the initial song (not as a marker)
      setTimeline([
        {
          id: initialSong.id,
          name: initialSong.name,
          artist: initialSong.artist,
          year: initialSong.year,
          uri: initialSong.uri,
          albumCover: initialSong.albumCover,
          isMarker: false, // Changed from true to false to display as a song
          placedPosition: 0, // Set initial position to 0 to ensure proper placement
        },
      ]);

      // Filter out the initial song from the game songs
      const gameSongs = sortedTracks.filter(
        (song) => song.id !== initialSong.id
      );

      setSongs(gameSongs);
      setCurrentSong(gameSongs[0]);
      setCurrentSongIndex(0);
      setGameState("playing");
    } catch (error: any) {
      setError(`Failed to initialize game: ${error.message}`);
      console.error("Game initialization error:", error);
    } finally {
      setLoading(false);
    }
  };

  const addSongToTimeline = (song: SpotifyTrack, position: number): void => {
    const newTimeline = [...timeline];
    
    // Shift positions of existing songs that are at or after the insertion point
    for (const item of newTimeline) {
      if (item.placedPosition !== undefined && item.placedPosition >= position) {
        item.placedPosition += 1;
      }
    }
    
    // Add the new song at the specified position
    newTimeline.push({
      id: song.id,
      name: song.name,
      artist: song.artist,
      year: song.year,
      uri: song.uri,
      albumCover: song.albumCover,
      isMarker: false,
      placedPosition: position,
    });

    // Sort the timeline by placedPosition to ensure correct visual ordering
    const sortedTimeline = newTimeline.sort((a, b) => {
      // Handle undefined placedPosition (should be rare, but just in case)
      if (a.placedPosition === undefined) return -1;
      if (b.placedPosition === undefined) return 1;
      
      // Sort by placedPosition
      return a.placedPosition - b.placedPosition;
    });

    setTimeline(sortedTimeline);
  };

  const completeRound = (pointsEarned: number, isCorrect: boolean): void => {
    if (!currentSong) return;

    // Update score
    setScore((prevScore) => prevScore + pointsEarned);

    let feedback = "";
    if (isCorrect) {
      if (pointsEarned >= 80) {
        feedback = `Perfect! You correctly placed "${currentSong.name}" from ${currentSong.year}.`;
      } else if (pointsEarned >= 50) {
        feedback = `Great job! You correctly placed "${currentSong.name}" from ${currentSong.year}.`;
      } else {
        feedback = `Good try! "${currentSong.name}" was released in ${currentSong.year}.`;
      }
    } else {
      feedback = `Incorrect! "${currentSong.name}" is from ${currentSong.year}. Try the next song.`;
    }

    // Set round result with all required fields including feedback
    setRoundResult({
      song: currentSong,
      correctYear: currentSong.year,
      pointsEarned,
      isCorrect,
      feedback,
    });

    // Move to next song or end game after a delay
    const nextIndex = currentSongIndex + 1;
    setTimeout(() => {
      if (nextIndex < songs.length) {
        setCurrentSongIndex(nextIndex);
        setCurrentSong(songs[nextIndex]);
        setRoundResult(null);
      } else {
        // End game
        setGameState("gameOver");
      }
    }, nextIndex < songs.length ? 3000 : 5000);
  };

  const resetGame = (): void => {
    setTimeline([]);
    setCurrentSong(null);
    setScore(0);
    setSongs([]);
    setCurrentSongIndex(0);
    setRoundResult(null);
    setGameState("ready");
  };

  return {
    gameState,
    timeline,
    currentSong,
    songs,
    currentSongIndex,
    score,
    error,
    loading,
    roundResult,
    initializeGame,
    addSongToTimeline,
    completeRound,
    resetGame,
    setGameState,
  };
}
