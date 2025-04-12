"use client";

import { Loader2 } from "lucide-react";

export default function LoadingScreen(): React.ReactElement {
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      <span className="ml-2">Loading...</span>
    </div>
  );
}
