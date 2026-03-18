export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* NavigationHeader skeleton */}
      <div className="h-16 bg-gray-900/50 border-b border-gray-800/50 animate-pulse" />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-800/50" />
              <div className="space-y-2">
                <div className="h-7 w-56 bg-gray-800/50 rounded" />
                <div className="h-4 w-72 bg-gray-800/50 rounded" />
              </div>
            </div>
            <div className="h-10 w-36 bg-gray-800/50 rounded-lg" />
          </div>

          {/* Form / proposal cards */}
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-gray-800/50 rounded-xl border border-gray-800/50 p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="h-6 w-6 bg-gray-700/50 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-48 bg-gray-700/50 rounded" />
                    <div className="h-4 w-32 bg-gray-700/50 rounded" />
                  </div>
                  <div className="h-6 w-20 bg-gray-700/50 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
