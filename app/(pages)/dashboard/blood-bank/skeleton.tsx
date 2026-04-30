import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function DonorCardSkeleton() {
  return (
    <Card className='overflow-hidden'>
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Skeleton className='h-12 w-12 rounded-full' />
            <div>
              <Skeleton className='mb-1 h-5 w-32' />
              <Skeleton className='h-3 w-20' />
            </div>
          </div>
          <Skeleton className='h-6 w-12' />
        </div>
      </CardHeader>
      <CardContent className='pb-3 pt-0'>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-3/4' />
          <div className='grid grid-cols-2 gap-1'>
            <Skeleton className='h-8 w-full' />
            <Skeleton className='h-8 w-full' />
          </div>
          <Skeleton className='h-8 w-full' />
        </div>
      </CardContent>
      <CardFooter className='flex justify-between border-t p-2'>
        <Skeleton className='h-8 w-16' />
        <Skeleton className='h-8 w-16' />
      </CardFooter>
    </Card>
  );
}

export function GridSkeleton() {
  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {[...Array(8)].map((_, index) => (
        // biome-ignore lint: error
        <DonorCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className='rounded-md border'>
      <div className='grid grid-cols-12 gap-4 border-b bg-muted/50 p-4 font-medium'>
        <div className='col-span-4'>Donor</div>
        <div className='col-span-2'>Blood Group</div>
        <div className='col-span-2'>District</div>
        <div className='col-span-2'>Contact</div>
        <div className='col-span-2 text-right'>Actions</div>
      </div>

      {[...Array(5)].map((_, index) => (
        <div
          // biome-ignore lint: error
          key={index}
          className='grid grid-cols-12 gap-4 border-b p-4 last:border-0'
        >
          <div className='col-span-4 flex items-center gap-3'>
            <Skeleton className='h-10 w-10 rounded-full' />
            <div>
              <Skeleton className='mb-1 h-5 w-32' />
              <Skeleton className='h-3 w-48' />
            </div>
          </div>
          <div className='col-span-2 flex items-center'>
            <Skeleton className='h-6 w-12' />
          </div>
          <div className='col-span-2 flex items-center'>
            <Skeleton className='h-4 w-20' />
          </div>
          <div className='col-span-2 flex items-center'>
            <Skeleton className='h-4 w-24' />
          </div>
          <div className='col-span-2 flex items-center justify-end gap-2'>
            <Skeleton className='h-8 w-8 rounded-md' />
            <Skeleton className='h-8 w-8 rounded-md' />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className='mx-auto max-w-7xl px-4'>
      <Skeleton className='mx-auto mb-4 h-10 w-1/3' />
      <Skeleton className='mx-auto mb-8 h-4 w-1/4' />
      <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <Skeleton className='h-10 w-full sm:w-75' />
        <div className='flex items-center gap-2'>
          <Skeleton className='h-10 w-50' />
          <Skeleton className='h-10 w-30' />
        </div>
      </div>
      <GridSkeleton />
    </div>
  );
}
