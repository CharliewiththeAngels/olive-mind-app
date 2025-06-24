export default function Loading() {
  return (
    <div className="flex flex-col space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2"></div>
        </div>
        <div className="h-9 w-32 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <div className="space-y-4">
        <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
        <div className="h-64 w-full bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  )
}
