import React from "react";
import { Button } from "@/components/ui/button";
import { TimelineItem } from "@/types/types";

interface GameOverProps {
  score: number;
  timeline: TimelineItem[];
  onPlayAgain: () => void;
}

export function GameOver({ score, timeline, onPlayAgain }: GameOverProps) {
  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <h1 className="text-3xl font-bold mb-8">Game Over!</h1>
      <p className="text-2xl font-bold mb-8">Final Score: {score}</p>

      <div className="mb-8 w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Your Timeline:</h2>
        <div className="bg-muted/20 p-4 rounded-lg">
          {timeline.map((item, index) => (
            <div
              key={index}
              className="mb-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow flex justify-between items-center"
            >
              <div>
                <div className="font-semibold">{item.name}</div>
                <div className="text-sm text-muted-foreground">
                  {item.artist}
                </div>
              </div>
              <div className="text-lg font-bold">{item.year}</div>
            </div>
          ))}
        </div>
      </div>

      <Button
        onClick={onPlayAgain}
        size="lg"
        className="bg-purple-600 hover:bg-purple-700 text-white"
      >
        Play Again
      </Button>
    </div>
  );
}
