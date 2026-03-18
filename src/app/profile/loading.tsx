export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* NavigationHeader skeleton */}
      <div className="h-16 bg-gray-900/50 border-b border-gray-800/50 animate-pulse" />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          {/* Profile header */}
          <div className="bg-gradient-to-br from-[#12121a] to-[#1a1a2e] rounded-3xl border border-gray-800/50 p-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gray-800/50" />
              <div className="flex-1 space-y-3">
                <div className="h-6 w-48 bg-gray-800/50 rounded" />
                <div className="h-4 w-32 bg-gray-800/50 rounded" />
              </div>
            </div>
            {/* Stats row */}
            <div className="grid grid-cols-4 gap-4 mt-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-800/50 rounded-xl" />
              ))}
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex gap-4">
            <div className="h-10 w-32 bg-gray-800/50 rounded-lg" />
            <div className="h-10 w-32 bg-gray-800/50 rounded-lg" />
          </div>

          {/* Content cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-800/50 rounded-2xl border border-gray-800/50" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
