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
              <div className="h-8 w-56 bg-gray-800/50 rounded" />
              <div className="h-4 w-72 bg-gray-800/50 rounded" />
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-800/50 rounded-xl border border-gray-800/50" />
            ))}
          </div>

          {/* Filter bar */}
          <div className="flex gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 w-32 bg-gray-800/50 rounded-lg" />
            ))}
          </div>

          {/* Sidebar + Grid layout */}
          <div className="flex gap-6">
            {/* Sidebar */}
            <div className="hidden lg:block w-72 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-800/50 rounded-lg" />
              ))}
            </div>
            {/* Challenge cards grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-48 bg-gray-800/50 rounded-xl border border-gray-800/50"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
