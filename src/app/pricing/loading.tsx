export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* NavigationHeader skeleton */}
      <div className="h-16 bg-gray-900/50 border-b border-gray-800/50 animate-pulse" />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-12">
          {/* Hero heading */}
          <div className="text-center space-y-4 py-8">
            <div className="h-10 w-[500px] bg-gray-800/50 rounded mx-auto" />
            <div className="h-5 w-80 bg-gray-800/50 rounded mx-auto" />
          </div>

          {/* 4 feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-48 bg-gray-800/50 rounded-2xl border border-gray-800/50"
              />
            ))}
          </div>

          {/* Pricing card */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-[#12121a] to-[#1a1a2e] rounded-2xl border border-gray-800/50 p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-800/50" />
                <div className="flex-1 space-y-2">
                  <div className="h-6 w-48 bg-gray-800/50 rounded" />
                  <div className="h-8 w-32 bg-gray-800/50 rounded" />
                </div>
              </div>
              {/* Features grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="h-5 w-24 bg-gray-800/50 rounded" />
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="h-4 w-full bg-gray-800/50 rounded" />
                    ))}
                  </div>
                ))}
              </div>
              {/* CTA button */}
              <div className="h-12 w-48 bg-gray-800/50 rounded-xl mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
