"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md text-center space-y-4">
          <h2 className="text-xl font-bold">Critical Application Error</h2>
          <p className="text-sm text-slate-400">
            A critical error occurred while loading the application.
          </p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Reload Vilo AI
          </button>
        </div>
      </body>
    </html>
  );
}
