export default function Skeleton({className = ''}: { className?: string }) {
    return <div className={`animate-pulse rounded-md bg-gray-200/60 dark:bg-neutral-800 ${className}`}/>
}
