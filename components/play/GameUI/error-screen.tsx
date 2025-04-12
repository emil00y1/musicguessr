"use client";

import { Button } from "@/components/ui/button";

interface ErrorScreenProps {
  error: string;
}

export default function ErrorScreen({
  error,
}: ErrorScreenProps): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <h1 className="text-3xl font-bold mb-8 text-red-500">Error</h1>
      <p className="mb-8 text-center max-w-md">{error}</p>
      <Button
        onClick={() => window.location.reload()}
        size="lg"
        className="bg-purple-600 hover:bg-purple-700 text-white"
      >
        Try Again
      </Button>
    </div>
  );
}
