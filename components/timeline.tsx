import React from "react";
import { TimelineItem, PlacementSpot, SpotifyTrack, RoundResultData } from "@/types/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TimelineProps {
  timeline: TimelineItem[];
  currentSong: SpotifyTrack | null;
  roundResult: RoundResultData | null;
  onSelectSpot: (index: number) => void;
  selectedSpot: number | null;
  placementSpots: PlacementSpot[];
  onConfirmPlacement?: () => void;
}

export function Timeline({
  timeline,
  currentSong,
  roundResult,
  onSelectSpot,
  selectedSpot,
  placementSpots,
  onConfirmPlacement,
}: TimelineProps) {
  // Sort timeline by placedPosition
  const sortedTimeline = [...timeline].sort((a, b) => {
    if (a.placedPosition === undefined) return -1;
    if (b.placedPosition === undefined) return 1;
    return a.placedPosition - b.placedPosition;
  });
  
  // Find the maximum position value to determine grid size
  let maxPosition = 0;
  sortedTimeline.forEach(item => {
    if (item.placedPosition !== undefined && item.placedPosition > maxPosition) {
      maxPosition = item.placedPosition;
    }
  });
  
  // Calculate total columns needed for the grid
  // We need (maxPosition + 1) columns for songs and (maxPosition + 2) columns for placement spots
  const totalColumns = (maxPosition + 1) * 2 + 1;
  
  return (
    <div className="relative h-[300px] bg-muted/20 rounded-lg p-4 mb-8">
      {/* Main timeline line */}
      <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-300 dark:bg-gray-700 transform -translate-y-1/2 z-0"></div>

      {/* Grid container */}
      <div 
        className="grid h-full items-center relative grid-rows-1"
        style={{ gridTemplateColumns: `repeat(${totalColumns}, 1fr)` }}
      >
        {/* Render placement spots */}
        {!roundResult && currentSong && placementSpots.map((spot, index) => {
          // Calculate the grid column for this placement spot
          // Placement spots are in odd-numbered columns (1, 3, 5, etc.)
          const columnStart = spot.position * 2 + 1;
          
          return (
            <div 
              key={`spot-${index}`} 
              className="flex justify-center items-center"
              style={{ gridColumn: columnStart }}
            >
              <button
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center cursor-pointer z-10",
                  selectedSpot === index
                    ? "bg-green-500"
                    : "bg-red-500 hover:bg-red-400"
                )}
                onClick={() => onSelectSpot(index)}
                aria-label={`Place song ${spot.label}`}
              >
                {selectedSpot === index && "✓"}
              </button>
            </div>
          );
        })}

        {/* Render timeline items (songs) */}
        {sortedTimeline.map((item, index) => {
          // Calculate the grid column for this song
          // Songs are in even-numbered columns (2, 4, 6, etc.)
          // If placedPosition is defined, use it to determine the column
          // Otherwise, fall back to the index (for the initial song)
          const position = item.placedPosition !== undefined ? item.placedPosition : index;
          const columnStart = position * 2 + 2;
          
          return (
            <div
              key={item.id}
              className="flex justify-center items-center row-[1]"
              style={{ gridColumn: columnStart }}
            >
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md w-32 z-10">
                <div className="text-xs truncate">{item.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {item.artist}
                </div>
                <div className="text-xs font-semibold mt-1">{item.year}</div>
              </div>
            </div>
          );
        })}
      </div>
        
      {/* Confirm placement button */}
      {!roundResult && selectedSpot !== null && onConfirmPlacement && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <Button
            onClick={onConfirmPlacement}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Confirm Placement
          </Button>
        </div>
      )}
    </div>
  );
}
