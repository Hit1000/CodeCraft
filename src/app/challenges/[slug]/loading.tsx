export default function Loading() {
  return (
    <div className="h-screen bg-[#0a0a0f] flex flex-col overflow-hidden">
      {/* ProblemNavbar skeleton */}
      <div className="h-14 bg-gray-900/50 border-b border-gray-800/50 animate-pulse" />

      {/* Split panel layout */}
      <div className="flex-1 flex animate-pulse">
        {/* Left panel - Description */}
        <div className="w-[45%] border-r border-gray-800/50 p-6 space-y-6">
          {/* Tabs */}
          <div className="flex gap-4">
            <div className="h-8 w-28 bg-gray-800/50 rounded-lg" />
            <div className="h-8 w-28 bg-gray-800/50 rounded-lg" />
          </div>
          {/* Content */}
          <div className="space-y-4">
            <div className="h-7 w-64 bg-gray-800/50 rounded" />
            <div className="h-4 w-full bg-gray-800/50 rounded" />
            <div className="h-4 w-3/4 bg-gray-800/50 rounded" />
            <div className="h-4 w-5/6 bg-gray-800/50 rounded" />
            <div className="h-4 w-2/3 bg-gray-800/50 rounded" />
            <div className="h-32 bg-gray-800/50 rounded-xl mt-4" />
          </div>
        </div>

        {/* Right panel - Code editor + test cases */}
        <div className="flex-1 flex flex-col">
          {/* Code panel */}
          <div className="flex-1 bg-gray-800/50" />
          {/* Test case panel */}
          <div className="h-[250px] border-t border-gray-800/50 p-4 space-y-3">
            <div className="h-5 w-24 bg-gray-800/50 rounded" />
            <div className="h-20 bg-gray-800/50 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
