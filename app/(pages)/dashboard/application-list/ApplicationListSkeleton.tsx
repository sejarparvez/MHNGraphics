import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function ApplicationCardSkeleton() {
  return (
    <Card className='relative overflow-hidden'>
      <div className='p-4'>
        {/* Header with Image and Actions */}
        <div className='flex items-start justify-between'>
          <div className='flex gap-3'>
            <Skeleton className='h-12 w-12 rounded-full' />
            <div className='space-y-2'>
              <Skeleton className='h-5 w-32' />
              <Skeleton className='h-4 w-24' />
            </div>
          </div>
          <Skeleton className='h-8 w-8 rounded-md' />
        </div>

        {/* Status Badges */}
        <div className='mt-4 flex items-center gap-2'>
          <Skeleton className='h-6 w-20' />
          <Skeleton className='h-6 w-24' />
        </div>

        {/* Info Grid */}
        <div className='mt-4 grid grid-cols-2 gap-2 text-sm'>
          <Skeleton className='h-4 w-12' />
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-4 w-14' />
          <Skeleton className='h-4 w-28' />
          <Skeleton className='h-4 w-16' />
          <div className='flex items-center gap-2'>
            <Skeleton className='h-4 w-4' />
            <Skeleton className='h-4 w-20' />
          </div>
          <Skeleton className='h-4 w-14' />
          <Skeleton className='h-5 w-9' />
        </div>
      </div>
    </Card>
  );
}

// For loading multiple cards
export function ApplicationListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className='grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4'>
      {Array.from({ length: count }).map((_, index) => (
        // biome-ignore lint: error
        <ApplicationCardSkeleton key={index} />
      ))}
    </div>
  );
}
