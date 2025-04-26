import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause } from "lucide-react";
import { SpotifyTrack, PlacementSpot } from "@/types/types";

interface CurrentSongProps {
  currentSong: SpotifyTrack;
  isPlaying: boolean;
  onPlayPause: () => void;
  selectedSpot: number | null;
  onConfirmPlacement?: () => void;
  placementSpots: PlacementSpot[];
}

export function CurrentSong({
  currentSong,
  isPlaying,
  onPlayPause,
  selectedSpot,
  onConfirmPlacement,
  placementSpots,
}: CurrentSongProps) {
  

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          Place this song on the timeline
        </h2>
      </div>

      {/* Song playback controls */}
      <div className="mb-6">
        <div className="flex flex-col items-center">        
          <Button
            onClick={onPlayPause}
            className="bg-purple-600 hover:bg-purple-700 text-white flex items-center mt-4"
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
      </div>
       
      </div>

      {/* Instructions */}
      <div className="text-center">
        <p className="text-muted-foreground">
          Click a spot on the timeline where you think this song belongs
        </p>   
      </div>
    </Card>
  );
}
