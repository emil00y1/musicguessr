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

  // Handle placing a song on the timeline
  const placeSongOnTimeline = (): void => {
    if (!currentSong || selectedSpot === null) return;

    const selectedPosition = placementSpots[selectedSpot];
    if (!selectedPosition) return;

    // Add song to timeline
    addSongToTimeline(currentSong, selectedPosition.position);

    // Calculate score based on placement
    const pointsEarned = calculateScore(currentSong.year);
    const isCorrect = pointsEarned >= 50; // Define "correct" as 50+ points

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
