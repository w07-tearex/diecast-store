import React from 'react';

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      <div className="animate-pulse space-y-12">
        {/* Breadcrumb skeleton */}
        <div className="h-4 w-48 bg-white/5 rounded-full mb-8"></div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar skeleton */}
          <aside className="w-full lg:w-64 space-y-8">
            <div className="h-4 w-32 bg-white/5 rounded-full mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-4 w-full bg-white/5 rounded-full"></div>
              ))}
            </div>
            <div className="h-40 w-full bg-white/5 rounded-2xl border border-white/5"></div>
          </aside>

          {/* Main Content skeleton */}
          <div className="flex-1 space-y-12">
            <div className="flex justify-between items-end border-b border-white/5 pb-8">
              <div className="space-y-4">
                <div className="h-10 w-64 bg-white/10 rounded-xl"></div>
                <div className="h-4 w-48 bg-white/5 rounded-full"></div>
              </div>
              <div className="h-10 w-40 bg-white/5 rounded-xl"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="space-y-4">
                  <div className="aspect-[4/3] w-full bg-white/5 rounded-3xl border border-white/5"></div>
                  <div className="h-4 w-3/4 bg-white/5 rounded-full"></div>
                  <div className="h-6 w-1/2 bg-white/10 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
