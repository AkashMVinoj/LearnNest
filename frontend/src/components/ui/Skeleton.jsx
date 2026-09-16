export const Skeleton = ({ className = '' }) => (
  <div className={`skeleton rounded-lg ${className}`} />
);

export const CourseCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
    <Skeleton className="h-40 w-full rounded-none" />
    <div className="p-5 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-2 w-full mt-4" />
    </div>
  </div>
);