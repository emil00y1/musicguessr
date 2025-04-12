import React from "react";
import { TimelineItem, PlacementSpot } from "@/types/types";

interface TimelineProps {
  timeline: TimelineItem[];
  currentSong: SpotifyTrack | null;
  roundResult: RoundResultData | null;
  onSelectSpot: (index: number) => void;
  selectedSpot: number | null;
  placementSpots: PlacementSpot[];
}

export function Timeline({
  timeline,
  currentSong,
  roundResult,
  onSelectSpot,
  selectedSpot,
  placementSpots,
}: TimelineProps) {
  return (
    <div className="relative h-[300px] bg-muted/20 rounded-lg p-4 mb-8">
      {/* Main timeline line */}
      <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-300 dark:bg-gray-700 transform -translate-y-1/2"></div>

      {/* Render timeline markers and placed songs */}
      {timeline.map((item, index) => (
        <div
          key={item.id}
          className="absolute top-1/2 transform -translate-y-1/2"
          style={{
            left: `${(index / (timeline.length - 1 || 1)) * 80 + 10}%`,
            transition: "all 0.5s ease-in-out",
          }}
        >
          {item.isMarker ? (
            <div className="bg-purple-600 text-white font-bold rounded-full h-16 w-16 flex items-center justify-center text-lg -translate-x-1/2">
              {item.year}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md w-32 -translate-x-1/2">
              <div className="text-xs truncate">{item.name}</div>
              <div className="text-xs text-muted-foreground truncate">
                {item.artist}
              </div>
              <div className="text-xs font-semibold mt-1">{item.year}</div>
            </div>
          )}
        </div>
      ))}

      {/* Placement spots (only shown when not showing round result) */}
      {!roundResult &&
        currentSong &&
        placementSpots.map((spot, index) => (
          <button
            key={`spot-${index}`}
            className={`absolute top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full ${
              selectedSpot === index
                ? "bg-green-500"
                : "bg-red-500 hover:bg-red-400"
            } flex items-center justify-center -ml-4 cursor-pointer z-10`}
            style={{ left: `${spot.position * 80 + 10}%` }}
            onClick={() => onSelectSpot(index)}
            aria-label={`Place song ${spot.label}`}
          >
            {selectedSpot === index && "✓"}
          </button>
        ))}
    </div>
  );
}
