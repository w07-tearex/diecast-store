import React from 'react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-20">
      <div className="relative w-20 h-20">
        {/* Outer ring */}
        <div className="absolute inset-0 border-4 border-pink-500/20 rounded-full scale-110"></div>
        {/* Spinning ring */}
        <div className="absolute inset-0 border-4 border-pink-500 border-t-transparent border-r-transparent rounded-full animate-spin"></div>
        {/* Inner core */}
        <div className="absolute inset-6 bg-pink-500 rounded-full animate-pulse shadow-[0_0_20px_rgba(236,72,153,0.5)]"></div>
      </div>
      <p className="mt-8 text-zinc-500 font-bold tracking-[0.2em] uppercase text-sm animate-pulse">
        Loading Diecast Details
      </p>
    </div>
  );
}
