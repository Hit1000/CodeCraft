export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* NavigationHeader skeleton */}
      <div className="h-16 bg-gray-900/50 border-b border-gray-800/50 animate-pulse" />

      <div className="max-w-[1800px] mx-auto p-4">
        <div className="animate-pulse space-y-4">
          {/* Editor panel */}
          <div className="h-[500px] bg-gray-800/50 rounded-2xl border border-gray-800/50" />
          {/* Output panel */}
          <div className="h-[200px] bg-gray-800/50 rounded-2xl border border-gray-800/50" />
        </div>
      </div>
    </div>
  );
}
