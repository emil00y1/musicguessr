"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getRandomTracksByDecade, SpotifyTrack } from '@/utils/spotify';
import { createClient } from '@/utils/supabase/client';
import { Loader2, Volume2, VolumeX, AlertTriangle, Play, Pause } from 'lucide-react';
import { createSpotifyPlayer, SpotifyPlayerAPI, SpotifyPlayerState } from '@/utils/spotifyPlayer';

interface TimelineItem extends SpotifyTrack {
  isMarker: boolean;
  placed?: string;
  correctPosition?: string;
}

interface RoundResult {
  isCorrect: boolean;
  pointsEarned: number;
  actualYear: number;
  song: SpotifyTrack;
}

export default function PlayGame() {
  const [gameState, setGameState] = useState<'loading' | 'ready' | 'playing' | 'gameOver'>('loading');
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [currentSong, setCurrentSong] = useState<SpotifyTrack | null>(null);
  const [score, setScore] = useState<number>(0);
  const [songs, setSongs] = useState<SpotifyTrack[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  
  // Spotify player states
  const [playerInitializing, setPlayerInitializing] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [muted, setMuted] = useState<boolean>(false);
  const [isPremiumUser, setIsPremiumUser] = useState<boolean>(false);
  
  const playerRef = useRef<SpotifyPlayerAPI | null>(null);
  const supabase = createClient();
  
  // Initialize Spotify player
  useEffect(() => {
    const initSpotifyPlayer = async () => {
      try {
        setPlayerInitializing(true);
        const player = await createSpotifyPlayer();
        playerRef.current = player;
        
        // Check if player connected successfully
        const initialState = player.getPlayerState();
        
        // Wait for connection (player may still be initializing)
        let attempts = 0;
        const checkConnection = setInterval(() => {
          const state = player.getPlayerState();
          if (state.isConnected) {
            clearInterval(checkConnection);
            setIsPremiumUser(true);
            setPlayerInitializing(false);
          } else if (state.error) {
            clearInterval(checkConnection);
            console.error("Spotify player error:", state.error);
            setPlayerError(state.error);
            setPlayerInitializing(false);
          } else if (attempts >= 20) { // 10 seconds max wait
            clearInterval(checkConnection);
            setPlayerError("Could not connect to Spotify. Premium account required.");
            setPlayerInitializing(false);
          }
          attempts++;
        }, 500);
        
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
  
  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          window.location.href = "/sign-in";
          return;
        }
        
        // Initialize game
        setGameState('ready');
      } catch (error) {
        setError('Authentication error. Please try signing in again.');
        console.error("Auth error:", error);
      }
    };
    
    checkAuth();
  }, []);
  
  // Play current song
  const playSong = async () => {
    if (!currentSong || !playerRef.current) return;
    
    try {
      // Stop any currently playing audio
      if (isPlaying) {
        await playerRef.current.pause();
        setIsPlaying(false);
        return;
      }
      
      // Play the track using its URI
      const success = await playerRef.current.play(currentSong.uri);
      
      if (success) {
        setIsPlaying(true);
        setPlayerError(null);
      } else {
        const state = playerRef.current.getPlayerState();
        setPlayerError(state.error || "Failed to play track");
      }
    } catch (error) {
      console.error("Error playing song:", error);
      setPlayerError("Playback error. Please try again.");
    }
  };
  
  // Pause current song
  const pauseSong = async () => {
    if (!playerRef.current || !isPlaying) return;
    
    try {
      const success = await playerRef.current.pause();
      if (success) {
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Error pausing playback:", error);
    }
  };
  
  // Toggle mute (function is kept for UI consistency but won't directly affect SDK)
  const toggleMute = () => {
    // Note: Web Playback SDK doesn't have a direct mute method
    // We'd need to use the player.setVolume(0) feature for a real implementation
    setMuted(!muted);
  };
  
  const initializeGame = async () => {
    setLoading(true);
    try {
      // Fetch random songs from Spotify API
      const tracks = await getRandomTracksByDecade(1950, 2025, 5);
      
      if (!tracks || tracks.length < 5) {
        throw new Error('Could not fetch enough tracks. Please try again.');
      }
      
      // Sort tracks by year
      const sortedTracks = [...tracks].sort((a, b) => a.year - b.year);
      setSongs(sortedTracks);
      
      // Pick a random song from the middle as the initial marker
      const middleIndex = Math.floor(sortedTracks.length / 2);
      const initialSong = sortedTracks[middleIndex];
      
      // Set up the timeline with the initial marker
      setTimeline([{ 
        ...initialSong,
        isMarker: true 
      }]);
      
      // Remove the initial song from the game songs and prepare the first song to place
      const gameSongs = sortedTracks.filter(song => song.id !== initialSong.id);
      setSongs(gameSongs);
      setCurrentSong(gameSongs[0]);
      setCurrentSongIndex(0);
      
      setGameState('playing');
      setLoading(false);
    } catch (error: any) {
      setError(`Failed to initialize game: ${error.message}`);
      setLoading(false);
      console.error("Game initialization error:", error);
    }
  };
  
  const startGame = () => {
    initializeGame();
  };
  
  const placeSongOnTimeline = (position: 'before' | 'after') => {
    if (!currentSong) return;
    
    // Stop audio playback when placing a song
    if (isPlaying && playerRef.current) {
      playerRef.current.pause();
      setIsPlaying(false);
    }
    
    // Find where the song should actually be placed
    const currentYear = currentSong.year;
    const timelineYears = timeline.map(item => item.year);
    
    // Determine if the player's choice was correct
    let correctPosition: 'before' | 'after' = 'after';
    const anchorYear = timeline[0].year;
    
    if (currentYear < anchorYear) {
      correctPosition = 'before';
    } else {
      correctPosition = 'after';
    }
    
    // Calculate score based on accuracy
    const isCorrect = position === correctPosition;
    const pointsEarned = isCorrect ? 100 : 0;
    
    // Update score
    setScore(prevScore => prevScore + pointsEarned);
    
    // Add song to timeline
    const newTimeline = [...timeline];
    newTimeline.push({
      ...currentSong,
      isMarker: false,
      placed: position,
      correctPosition
    });
    
    // Sort timeline by year
    newTimeline.sort((a, b) => a.year - b.year);
    setTimeline(newTimeline);
    
    // Show round result
    setRoundResult({
      isCorrect,
      pointsEarned,
      actualYear: currentYear,
      song: currentSong
    });
    
    // Move to next song or end game
    const nextIndex = currentSongIndex + 1;
    if (nextIndex < songs.length) {
      setTimeout(() => {
        setCurrentSong(songs[nextIndex]);
        setCurrentSongIndex(nextIndex);
        setRoundResult(null);
        setPlayerError(null);
      }, 3000);
    } else {
      setTimeout(() => {
        setGameState('gameOver');
        setRoundResult(null);
      }, 3000);
    }
  };
  
  const playAgain = () => {
    // Stop any audio playback
    if (playerRef.current && isPlaying) {
      playerRef.current.pause();
      setIsPlaying(false);
    }
    
    setTimeline([]);
    setCurrentSong(null);
    setScore(0);
    setSongs([]);
    setCurrentSongIndex(0);
    setRoundResult(null);
    setPlayerError(null);
    setGameState('ready');
  };
  
  if (gameState === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <h1 className="text-3xl font-bold mb-8 text-red-500">Error</h1>
        <p className="mb-8 text-center max-w-md">{error}</p>
        <Button onClick={() => window.location.reload()} size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
          Try Again
        </Button>
      </div>
    );
  }
  
  if (gameState === 'ready') {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <h1 className="text-3xl font-bold mb-8">Hitster</h1>
        <p className="mb-8 text-center max-w-md">
          Test your music knowledge! Place songs on the timeline based on their release year.
        </p>
        
        {playerInitializing ? (
          <div className="mb-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
            <p>Connecting to Spotify...</p>
          </div>
        ) : playerError ? (
          <Card className="p-4 mb-8 bg-yellow-50 dark:bg-yellow-900/30 border-yellow-500">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
              <div>
                <h3 className="font-semibold">Spotify Premium Required</h3>
                <p className="text-sm mt-1">{playerError}</p>
                <p className="text-sm mt-2">You can still play the game, but songs won't play.</p>
              </div>
            </div>
          </Card>
        ) : null}
        
        <Button 
          onClick={startGame} 
          size="lg" 
          className="bg-purple-600 hover:bg-purple-700 text-white"
          disabled={loading || playerInitializing}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : 'Start Game'}
        </Button>
      </div>
    );
  }
  
  if (gameState === 'gameOver') {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <h1 className="text-3xl font-bold mb-8">Game Over!</h1>
        <p className="text-2xl font-bold mb-8">Final Score: {score}</p>
        
        <div className="mb-8 w-full max-w-2xl">
          <h2 className="text-xl font-semibold mb-4">Your Timeline:</h2>
          <div className="bg-muted/20 p-4 rounded-lg">
            {timeline.map((item, index) => (
              <div key={index} className="mb-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow flex justify-between items-center">
                <div>
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-sm text-muted-foreground">{item.artist}</div>
                </div>
                <div className="text-lg font-bold">{item.year}</div>
              </div>
            ))}
          </div>
        </div>
        
        <Button onClick={playAgain} size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
          Play Again
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-xl font-bold">Hitster</h1>
        <div className="text-xl font-semibold">Score: {score}</div>
      </div>
      
      {/* Timeline visualization */}
      <div className="relative h-[300px] bg-muted/20 rounded-lg p-4 mb-8">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-300 dark:bg-gray-700 transform -translate-y-1/2"></div>
        
        {/* Render timeline markers and placed songs */}
        {timeline.map((item, index) => (
          <div 
            key={item.id}
            className="absolute top-1/2 transform -translate-y-1/2"
            style={{ 
              left: `${(index / (timeline.length - 1 || 1)) * 80 + 10}%`,
              transition: 'all 0.5s ease-in-out'
            }}
          >
            {item.isMarker ? (
              <div className="bg-purple-600 text-white font-bold rounded-full h-16 w-16 flex items-center justify-center text-lg -translate-x-1/2">
                {item.year}
              </div>
            ) : (
              <div className={`bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md w-32 -translate-x-1/2 ${
                item.placed && item.correctPosition && item.placed !== item.correctPosition 
                  ? 'border-2 border-red-500' 
                  : ''
              }`}>
                <div className="text-xs truncate">{item.name}</div>
                <div className="text-xs text-muted-foreground truncate">{item.artist}</div>
                {!item.isMarker && roundResult && roundResult.song.id === item.id && (
                  <div className="text-xs font-semibold mt-1">{item.year}</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Current song to place */}
      {currentSong && !roundResult && (
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Place this song on the timeline</h2>
            {isPremiumUser && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleMute}
                className="h-8 w-8"
                disabled={!isPremiumUser}
              >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            )}
          </div>
          
          <div className="mb-6">
            {isPremiumUser ? (
              <div className="flex flex-col items-center">
                <Button
                  onClick={playSong}
                  className="bg-purple-600 hover:bg-purple-700 text-white flex items-center"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" /> 
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" /> 
                      Play Song
                    </>
                  )}
                </Button>
                
                {playerError && (
                  <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-center">
                    {playerError}
                  </div>
                )}
                
                {currentSong.albumCover && (
                  <div className="mt-4">
                    <img 
                      src={currentSong.albumCover} 
                      alt={`${currentSong.name} album cover`}
                      className="w-32 h-32 object-cover rounded-md mx-auto"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-md text-center">
                <p>Spotify Premium required to play song previews.</p>
                <p className="text-sm mt-2">
                  {currentSong.name} by {currentSong.artist}
                </p>
              </div>
            )}
          </div>
          
          <div className="text-center mb-6">
            <p className="text-muted-foreground">Was this song released before or after {timeline[0].year}?</p>
          </div>
          
          <div className="flex justify-center gap-4">
            <Button 
              onClick={() => placeSongOnTimeline('before')} 
              size="lg"
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Before {timeline[0].year}
            </Button>
            <Button 
              onClick={() => placeSongOnTimeline('after')} 
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              After {timeline[0].year}
            </Button>
          </div>
        </Card>
      )}
      
      {/* Round result */}
      {roundResult && (
        <Card className="p-4 border-2 border-solid mt-4 animate-pulse" style={{
          borderColor: roundResult.isCorrect ? 'green' : 'red'
        }}>
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">
              {roundResult.isCorrect ? 'Correct! +100 points' : 'Wrong!'}
            </h3>
            <p className="mb-4">
              "{roundResult.song.name}" by {roundResult.song.artist} was released in {roundResult.actualYear}.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}