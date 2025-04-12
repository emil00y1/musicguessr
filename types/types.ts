export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  year: number;
  uri: string;
  albumCover?: string | null;
}

export interface TimelineItem extends SpotifyTrack {
  isMarker: boolean;
  placedPosition?: number;
}

export interface PlacementSpot {
  position: number; // Visual position (0-1)
  label: string; // Description (e.g., "Before 1981", "Between 1981 and 1995")
  index: number; // Index in the timeline
}

export interface RoundResultData {
  isCorrect: boolean;
  pointsEarned: number;
  feedback: string;
  song: SpotifyTrack;
  correctYear: number;
}
