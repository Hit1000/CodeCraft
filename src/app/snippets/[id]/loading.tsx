export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* NavigationHeader skeleton */}
      <div className="h-16 bg-gray-900/50 border-b border-gray-800/50 animate-pulse" />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          {/* Header card */}
          <div className="bg-[#121218] rounded-2xl border border-gray-800/50 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-800/50" />
              <div className="flex-1 space-y-3">
                <div className="h-6 w-64 bg-gray-800/50 rounded" />
                <div className="h-4 w-40 bg-gray-800/50 rounded" />
              </div>
              <div className="h-6 w-20 bg-gray-800/50 rounded-full" />
            </div>
          </div>

          {/* Code editor block */}
          <div className="rounded-2xl border border-gray-800/50 overflow-hidden">
            <div className="h-12 bg-gray-900/80 border-b border-gray-800/50 px-4 flex items-center gap-3">
              <div className="w-5 h-5 bg-gray-800/50 rounded" />
              <div className="flex-1" />
              <div className="h-8 w-20 bg-gray-800/50 rounded" />
            </div>
            <div className="h-[500px] bg-gray-800/50" />
          </div>

          {/* Comments section */}
          <div className="space-y-4">
            <div className="h-6 w-32 bg-gray-800/50 rounded" />
            <div className="h-24 bg-gray-800/50 rounded-xl border border-gray-800/50" />
          </div>
        </div>
      </div>
    </div>
  );
}
