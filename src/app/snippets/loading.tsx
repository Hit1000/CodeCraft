export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* NavigationHeader skeleton */}
      <div className="h-16 bg-gray-900/50 border-b border-gray-800/50 animate-pulse" />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          {/* Hero section */}
          <div className="text-center space-y-4 py-8">
            <div className="h-4 w-32 bg-gray-800/50 rounded mx-auto" />
            <div className="h-10 w-96 bg-gray-800/50 rounded mx-auto" />
            <div className="h-5 w-72 bg-gray-800/50 rounded mx-auto" />
          </div>

          {/* Search bar */}
          <div className="h-12 bg-gray-800/50 rounded-xl border border-gray-800/50" />

          {/* Filter pills */}
          <div className="flex gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-8 w-20 bg-gray-800/50 rounded-full" />
            ))}
          </div>

          {/* Snippet cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-56 bg-gray-800/50 rounded-2xl border border-gray-800/50"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
