"use client";

import { useState, useEffect } from "react";
import { TimelineItem, PlacementSpot } from "@/types/types";

interface UseTimelinePlacementReturn {
  placementSpots: PlacementSpot[];
  selectedSpot: number | null;
  setSelectedSpot: (spot: number | null) => void;
  calculateScore: (correctYear: number) => number;
}

export function useTimelinePlacement(
  timeline: TimelineItem[]
): UseTimelinePlacementReturn {
  const [placementSpots, setPlacementSpots] = useState<PlacementSpot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<number | null>(null);

  // Generate placement spots when timeline changes
  useEffect(() => {
    if (timeline.length > 0) {
      generatePlacementSpots();
    }
  }, [timeline]);

  // Calculate placement spots on the timeline
  const generatePlacementSpots = (): void => {
    // Sort the timeline by placedPosition to ensure correct visual ordering
    const sortedTimeline = [...timeline].sort((a, b) => {
      if (a.placedPosition === undefined) return -1;
      if (b.placedPosition === undefined) return 1;
      return a.placedPosition - b.placedPosition;
    });
    
    const spots: PlacementSpot[] = [];

    if (sortedTimeline.length === 1) {
      // If there's only one song (initial song), place spots on either side
      const initialSong = sortedTimeline[0];
      
      // Add spot before the initial song
      spots.push({
        position: 0, // First column in the grid
        label: `Before ${initialSong.name} (${initialSong.year})`,
        index: -1,
      });
      
      // Add spot after the initial song
      spots.push({
        position: 1, // Third column in the grid (after the song)
        label: `After ${initialSong.name} (${initialSong.year})`,
        index: 0,
      });
    } else {
      // For multiple songs, create spots at beginning, between songs, and at end
      
      // Add spot at beginning
      spots.push({
        position: 0, // First column in the grid
        label: `Before ${sortedTimeline[0].name} (${sortedTimeline[0].year})`,
        index: -1,
      });

      // Add spots between songs
      for (let i = 0; i < sortedTimeline.length - 1; i++) {
        // Get the actual positions of the current and next songs
        // Use the index as fallback if placedPosition is undefined
        const currentSongPos = sortedTimeline[i].placedPosition !== undefined ? 
                              sortedTimeline[i].placedPosition : i;
        const nextSongPos = sortedTimeline[i + 1].placedPosition !== undefined ? 
                           sortedTimeline[i + 1].placedPosition : i + 1;
        
        // Position this spot between the two songs
        // If there's a gap between positions, we need to place the spot at the correct position
        // Ensure we have a number by using the index as fallback
        const spotPosition = (currentSongPos !== undefined) ? currentSongPos + 1 : i + 1;
        
        spots.push({
          position: spotPosition,
          label: `Between ${sortedTimeline[i].name} (${sortedTimeline[i].year}) and ${sortedTimeline[i + 1].name} (${sortedTimeline[i + 1].year})`,
          index: i,
        });
      }

      // Add spot at end
      const lastItem = sortedTimeline[sortedTimeline.length - 1];
      const lastPosition = lastItem.placedPosition !== undefined ? 
                          lastItem.placedPosition : sortedTimeline.length - 1;
      
      // Ensure we have a number by using the length as fallback
      const endPosition = (lastPosition !== undefined) ? lastPosition + 1 : sortedTimeline.length;
      
      spots.push({
        position: endPosition, // Position after the last song
        label: `After ${lastItem.name} (${lastItem.year})`,
        index: sortedTimeline.length - 1,
      });
    }

    setPlacementSpots(spots);
  };

  // Calculate score based on correct placement
  const calculateScore = (correctYear: number): number => {
    if (selectedSpot === null || timeline.length === 0) return 0;

    const selectedPosition = placementSpots[selectedSpot];
    if (!selectedPosition) return 0;

    // Sort timeline by year to determine correct placement
    const sortedTimeline = [...timeline].sort((a, b) => a.year - b.year);

    // Determine where the song should have been placed
    let correctSpotIndex = -1;

    // If it should be before the first song
    if (correctYear < sortedTimeline[0].year) {
      correctSpotIndex = 0;
    }
    // If it should be after the last song
    else if (correctYear > sortedTimeline[sortedTimeline.length - 1].year) {
      correctSpotIndex = placementSpots.length - 1;
    }
    // If it should be somewhere in the middle
    else {
      for (let i = 0; i < sortedTimeline.length - 1; i++) {
        if (
          correctYear >= sortedTimeline[i].year &&
          correctYear <= sortedTimeline[i + 1].year
        ) {
          correctSpotIndex = i + 1; // +1 because first spot is "before first song"
          break;
        }
      }
    }

    // Calculate score based on distance from correct spot
    // Perfect placement = 100 points
    // Each spot away = -20 points (min 10 points)
    const distance = Math.abs(selectedSpot - correctSpotIndex);
    const points = Math.max(10, 100 - distance * 20);

    return points;
  };

  return {
    placementSpots,
    selectedSpot,
    setSelectedSpot,
    calculateScore,
  };
}
