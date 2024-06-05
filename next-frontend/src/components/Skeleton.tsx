type SkeletonProps = {
  className?: string
}

const Skeleton = ({ className }: SkeletonProps) => {
  return <div className={`[:where(&)]:rounded animate-pulse bg-gray-100 ${className}`} />
}

export default Skeleton
