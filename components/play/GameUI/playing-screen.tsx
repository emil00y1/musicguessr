"use client";

import { Timeline } from "@/components/timeline";
import { CurrentSong } from "@/components/current-song";
import { RoundResult } from "@/components/round-result";
import {
  SpotifyTrack,
  TimelineItem,
  PlacementSpot,
  RoundResultData,
} from "@/types/types";

interface PlayingScreenProps {
  score: number;
  timeline: TimelineItem[];
  currentSong: SpotifyTrack | null;
  roundResult: RoundResultData | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  selectedSpot: number | null;
  onSelectSpot: (spot: number | null) => void;
  onConfirmPlacement: () => void;
  placementSpots: PlacementSpot[];
}

export default function PlayingScreen({
  score,
  timeline,
  currentSong,
  roundResult,
  isPlaying,
  onPlayPause,
  selectedSpot,
  onSelectSpot,
  onConfirmPlacement,
  placementSpots,
}: PlayingScreenProps): React.ReactElement {
  return (
    <div className="container mx-auto p-4 max-w-screen-xl">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-xl font-bold">musicguessr</h1>
        <div className="text-xl font-semibold">Score: {score}</div>
      </div>

      <Timeline
        timeline={timeline}
        currentSong={currentSong}
        roundResult={roundResult}
        onSelectSpot={onSelectSpot}
        selectedSpot={selectedSpot}
        placementSpots={placementSpots}
        onConfirmPlacement={onConfirmPlacement}
      />

      {currentSong && !roundResult && (
        <CurrentSong
          currentSong={currentSong}
          isPlaying={isPlaying}
          onPlayPause={onPlayPause}
          selectedSpot={selectedSpot}
          placementSpots={placementSpots}
        />
      )}

      {roundResult && <RoundResult result={roundResult} />}
    </div>
  );
}
