export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* NavigationHeader skeleton */}
      <div className="h-16 bg-gray-900/50 border-b border-gray-800/50 animate-pulse" />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          {/* Back link */}
          <div className="h-5 w-24 bg-gray-800/50 rounded" />

          {/* Title */}
          <div className="h-8 w-56 bg-gray-800/50 rounded" />

          {/* Form sections */}
          <div className="space-y-6">
            {/* Title field */}
            <div className="space-y-2">
              <div className="h-4 w-16 bg-gray-800/50 rounded" />
              <div className="h-10 bg-gray-800/50 rounded-lg" />
            </div>
            {/* Description field */}
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-800/50 rounded" />
              <div className="h-32 bg-gray-800/50 rounded-lg" />
            </div>
            {/* Two-column fields */}
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-20 bg-gray-800/50 rounded" />
                  <div className="h-10 bg-gray-800/50 rounded-lg" />
                </div>
              ))}
            </div>
            {/* Test cases area */}
            <div className="space-y-2">
              <div className="h-4 w-20 bg-gray-800/50 rounded" />
              <div className="h-40 bg-gray-800/50 rounded-lg" />
            </div>
            {/* Submit button */}
            <div className="h-12 w-32 bg-gray-800/50 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
