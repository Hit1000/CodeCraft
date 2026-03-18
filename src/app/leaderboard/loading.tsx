export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* NavigationHeader skeleton */}
      <div className="h-16 bg-gray-900/50 border-b border-gray-800/50 animate-pulse" />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          {/* Page header */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gray-800/50" />
            <div className="space-y-2">
              <div className="h-8 w-48 bg-gray-800/50 rounded" />
              <div className="h-4 w-64 bg-gray-800/50 rounded" />
            </div>
          </div>

          {/* Leaderboard table */}
          <div className="rounded-xl border border-gray-800/60 overflow-hidden">
            {/* Table header */}
            <div className="h-12 bg-gray-900/80 border-b border-gray-800/50 grid grid-cols-7 gap-4 px-6 items-center">
              <div className="h-4 w-8 bg-gray-800/50 rounded" />
              <div className="h-4 w-16 bg-gray-800/50 rounded" />
              <div className="h-4 w-16 bg-gray-800/50 rounded" />
              <div className="h-4 w-20 bg-gray-800/50 rounded" />
              <div className="h-4 w-16 bg-gray-800/50 rounded" />
              <div className="h-4 w-16 bg-gray-800/50 rounded" />
              <div className="h-4 w-12 bg-gray-800/50 rounded" />
            </div>
            {/* Table rows */}
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="h-16 border-b border-gray-800/30 grid grid-cols-7 gap-4 px-6 items-center"
              >
                <div className="flex items-center justify-center">
                  <div className="w-8 h-8 bg-gray-800/50 rounded-full" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-800/50 rounded-full" />
                  <div className="h-4 w-24 bg-gray-800/50 rounded" />
                </div>
                <div className="h-4 w-10 bg-gray-800/50 rounded" />
                <div className="flex gap-2">
                  <div className="h-4 w-6 bg-gray-800/50 rounded" />
                  <div className="h-4 w-6 bg-gray-800/50 rounded" />
                  <div className="h-4 w-6 bg-gray-800/50 rounded" />
                </div>
                <div className="h-4 w-12 bg-gray-800/50 rounded" />
                <div className="h-4 w-10 bg-gray-800/50 rounded" />
                <div className="h-6 w-16 bg-gray-800/50 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
