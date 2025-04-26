"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useSpotifyPlayer } from "@/hooks/useSpotifyPlayer";
import { useGameState } from "@/hooks/useGameState";
import { useTimelinePlacement } from "@/hooks/useTimelinePlacement";
import LoadingScreen from "@/components/play/GameUI/loading-screen";
import ErrorScreen from "@/components/play/GameUI/error-screen";
import ReadyScreen from "@/components/play/GameUI/ready-screen";
import PlayingScreen from "@/components/play/GameUI/playing-screen";
import { GameOver } from "@/components/game-over";

export default function PlayGame(): React.ReactElement {
  const supabase = createClient();

  // Custom hooks
  const {
    gameState,
    timeline,
    currentSong,
    score,
    error,
    loading,
    roundResult,
    initializeGame,
    addSongToTimeline,
    completeRound,
    resetGame,
    setGameState,
  } = useGameState();

  const { isPlaying, playerError, playerInitializing, playTrack, pauseTrack } =
    useSpotifyPlayer();

  const { placementSpots, selectedSpot, setSelectedSpot, calculateScore } =
    useTimelinePlacement(timeline);

  // Check authentication
  useEffect(() => {
    const checkAuth = async (): Promise<void> => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          window.location.href = "/sign-in";
          return;
        }

        // Set game to ready state if authenticated
        setGameState("ready");
      } catch (error) {
        console.error("Auth error:", error);
      }
    };

    checkAuth();
  }, [setGameState]);

  // Handle play/pause of current song
  const handlePlayPause = async (): Promise<void> => {
    if (!currentSong) return;

    if (isPlaying) {
      await pauseTrack();
    } else {
      await playTrack(currentSong.uri);
    }
  };

  // Check if placement is chronologically correct
  const isChronologicallyCorrect = (songYear: number, position: number): boolean => {
    // Get the selected spot's position in the timeline
    const selectedSpotPosition = placementSpots[selectedSpot!].position;
    
    // Find the years of songs that would be before and after this position
    let prevSongYear: number | null = null;
    let nextSongYear: number | null = null;
    
    // Sort the timeline by placedPosition to ensure we're checking in visual order
    const sortedTimeline = [...timeline].sort((a, b) => {
      if (a.placedPosition === undefined) return -1;
      if (b.placedPosition === undefined) return 1;
      return a.placedPosition - b.placedPosition;
    });
    
    // Check each song in the timeline to find the ones before and after the selected position
    sortedTimeline.forEach(song => {
      // Skip songs without a placed position
      if (song.placedPosition === undefined) return;
      
      // For songs placed before the selected position, find the most recent one
      if (song.placedPosition < selectedSpotPosition) {
        if (prevSongYear === null || song.year > prevSongYear) {
          prevSongYear = song.year;
        }
      }
      
      // For songs placed after the selected position, find the earliest one
      if (song.placedPosition > selectedSpotPosition) {
        if (nextSongYear === null || song.year < nextSongYear) {
          nextSongYear = song.year;
        }
      }
    });
    
    // Check if the placement violates chronological order
    if (prevSongYear !== null && songYear < prevSongYear) {
      console.log(`Chronological error: Song from ${songYear} cannot come before song from ${prevSongYear}`);
      return false; // Song is older than the most recent song placed earlier
    }
    
    if (nextSongYear !== null && songYear > nextSongYear) {
      console.log(`Chronological error: Song from ${songYear} cannot come after song from ${nextSongYear}`);
      return false; // Song is newer than the earliest song placed later
    }
    
    return true;
  };

  // Handle placing a song on the timeline
  const placeSongOnTimeline = async (): Promise<void> => {
    if (!currentSong || selectedSpot === null) return;

    const selectedPosition = placementSpots[selectedSpot];
    if (!selectedPosition) return;

    // Pause the song when placement is confirmed
    if (isPlaying) {
      await pauseTrack();
    }

    // Check if placement is chronologically correct
    const isCorrect = isChronologicallyCorrect(currentSong.year, selectedPosition.position);

    // Calculate score based on placement accuracy
    const pointsEarned = isCorrect ? calculateScore(currentSong.year) : 0;

    if (isCorrect) {
      // Only add song to timeline if placement is chronologically correct
      addSongToTimeline(currentSong, selectedPosition.position);
    }
    // Note: If not correct, we don't add the song to the timeline at all

    // Complete the round
    completeRound(pointsEarned, isCorrect);
  };

  // Render appropriate screen based on game state
  if (gameState === "loading") {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} />;
  }

  if (gameState === "ready") {
    return (
      <ReadyScreen
        onStart={initializeGame}
        loading={loading}
        playerInitializing={playerInitializing}
        playerError={playerError}
      />
    );
  }

  if (gameState === "gameOver") {
    return (
      <GameOver score={score} timeline={timeline} onPlayAgain={resetGame} />
    );
  }

  // Render playing state
  return (
    <PlayingScreen
      score={score}
      timeline={timeline}
      currentSong={currentSong}
      roundResult={roundResult}
      isPlaying={isPlaying}
      onPlayPause={handlePlayPause}
      selectedSpot={selectedSpot}
      onSelectSpot={setSelectedSpot}
      onConfirmPlacement={placeSongOnTimeline}
      placementSpots={placementSpots}
    />
  );
}
