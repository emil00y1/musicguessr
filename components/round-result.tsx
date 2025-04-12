import React from "react";
import { Card } from "@/components/ui/card";
import { RoundResultData } from "@/types/types";

interface RoundResultProps {
  result: RoundResultData | null;
}

export function RoundResult({ result }: RoundResultProps) {
  if (!result) return null;

  return (
    <Card
      className="p-4 border-2 border-solid mt-4 animate-pulse"
      style={{
        borderColor: result.isCorrect ? "green" : "red",
      }}
    >
      <div className="text-center">
        <h3 className="text-xl font-bold mb-2">
          {result.isCorrect
            ? `Correct! +${result.pointsEarned} points`
            : `Not quite! +${result.pointsEarned} points`}
        </h3>
        <p className="mb-4">
          "{result.song.name}" by {result.song.artist} was released in{" "}
          {result.song.year}.
        </p>
        <p>{result.feedback}</p>
      </div>
    </Card>
  );
}
