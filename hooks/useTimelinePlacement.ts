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
    // Sort timeline items by year
    const sortedTimeline = [...timeline].sort((a, b) => a.year - b.year);

    const spots: PlacementSpot[] = [];

    // Add spot at beginning
    spots.push({
      position: 0,
      label: `Before ${sortedTimeline[0].name} (${sortedTimeline[0].year})`,
      index: -1,
    });

    // Add spots between songs
    for (let i = 0; i < sortedTimeline.length - 1; i++) {
      const position = (i + 1) / (sortedTimeline.length + 1);
      spots.push({
        position: position,
        label: `Between ${sortedTimeline[i].name} (${sortedTimeline[i].year}) and ${sortedTimeline[i + 1].name} (${sortedTimeline[i + 1].year})`,
        index: i,
      });
    }

    // Add spot at end
    spots.push({
      position: 1,
      label: `After ${sortedTimeline[sortedTimeline.length - 1].name} (${sortedTimeline[sortedTimeline.length - 1].year})`,
      index: sortedTimeline.length - 1,
    });

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
