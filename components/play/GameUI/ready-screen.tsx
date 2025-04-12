"use client";

import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";

interface ReadyScreenProps {
  onStart: () => void;
  loading: boolean;
  playerInitializing: boolean;
  playerError: string | null;
}

export default function ReadyScreen({
  onStart,
  loading,
  playerInitializing,
  playerError,
}: ReadyScreenProps): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <h1 className="text-3xl font-bold mb-8">Hitster</h1>
      <p className="mb-8 text-center max-w-md">
        Test your music knowledge! Place songs on the timeline based on their
        release year.
      </p>

      {playerInitializing ? (
        <div className="mb-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p>Connecting to Spotify...</p>
        </div>
      ) : playerError ? (
        <div className="p-4 mb-8 bg-yellow-50 dark:bg-yellow-900/30 border-yellow-500 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
            <div>
              <h3 className="font-semibold">Spotify Connection Issue</h3>
              <p className="text-sm mt-1">{playerError}</p>
              <p className="text-sm mt-2">
                You can still play the game, but songs won't play.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <Button
        onClick={onStart}
        size="lg"
        className="bg-purple-600 hover:bg-purple-700 text-white"
        disabled={loading || playerInitializing}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          "Start Game"
        )}
      </Button>
    </div>
  );
}
