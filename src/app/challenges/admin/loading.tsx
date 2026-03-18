export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* NavigationHeader skeleton */}
      <div className="h-16 bg-gray-900/50 border-b border-gray-800/50 animate-pulse" />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 w-48 bg-gray-800/50 rounded" />
              <div className="h-4 w-64 bg-gray-800/50 rounded" />
            </div>
            <div className="h-10 w-36 bg-gray-800/50 rounded-lg" />
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-800/50 pb-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 w-28 bg-gray-800/50 rounded-lg" />
            ))}
          </div>

          {/* Search input */}
          <div className="h-10 w-80 bg-gray-800/50 rounded-lg" />

          {/* Table skeleton */}
          <div className="rounded-xl border border-gray-800/50 overflow-hidden">
            {/* Table header */}
            <div className="h-12 bg-gray-900/80 border-b border-gray-800/50 grid grid-cols-7 gap-4 px-4 items-center">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-800/50 rounded" />
              ))}
            </div>
            {/* Table rows */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-14 border-b border-gray-800/30 grid grid-cols-7 gap-4 px-4 items-center"
              >
                {[...Array(7)].map((_, j) => (
                  <div key={j} className="h-4 bg-gray-800/50 rounded" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
