'use client';

import { CircleCheckBig, Download, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import React from 'react';
import { HiHeart, HiOutlineHeart } from 'react-icons/hi';
import { SiCanva } from 'react-icons/si';
import { toast } from 'sonner';
import { convertToReadableDate } from '@/components/helper/date/convertDateString';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useUpdateDesignLike } from '@/services/design';
import type { Design } from '@/utils/Interface';
import type { ImageDimensions } from '@/utils/imageDimensions';
import DownloadMenuItem from './DownloadMenuItem';
import Share from './Share';

interface DesignDetailsProps {
  data: Design;
  imageDimensions: ImageDimensions | null;
  params: { slug: string };
}

interface LikeButtonProps {
  likes: { userId: string }[];
  // biome-ignore lint: error
  session: any;
}

const useIsLiked = (
  likes: { userId: string }[],
  userId: string | undefined,
) => {
  return React.useMemo(() => {
    return likes.some((like) => like.userId === userId);
  }, [likes, userId]);
};

const LikeButton = ({ likes, session }: LikeButtonProps) => {
  const userId = session?.user?.id;
  const isLiked = useIsLiked(likes, userId);

  return (
    <>
      {isLiked ? (
        <HiHeart size={24} className='text-red-500' />
      ) : (
        <HiOutlineHeart size={24} />
      )}
    </>
  );
};

export function DesignDetails({
  data,
  imageDimensions,
  params,
}: DesignDetailsProps) {
  const { data: session } = useSession();
  const { mutateAsync } = useUpdateDesignLike();

  const handleLike = async () => {
    if (!session?.user) {
      toast.error('You must be logged in to like this design');
      return;
    }
    try {
      await mutateAsync({ postId: data.id, userId: session.user.id });
      // biome-ignore lint: error
    } catch (error) {
      toast.error('Failed to update like.');
    }
  };

  return (
    <>
      <div className='mb-6 rounded-lg border border-emerald-200/50 bg-emerald-50/50 dark:bg-emerald-900/50 p-4 backdrop-blur-xs'>
        <p className='flex flex-wrap items-center gap-2 text-sm text-emerald-800 dark:text-emerald-300'>
          <CircleCheckBig className='h-5 w-5 text-emerald-500' />
          <span>Free for use under the Oylkka </span>
          <Link
            className='font-medium text-emerald-700 underline hover:text-emerald-800'
            href='/content-license'
          >
            Content License
          </Link>
        </p>
      </div>

      <div className='space-y-6'>
        <div className='flex flex-col gap-3 sm:flex-row sm:justify-between'>
          <Button className='w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto'>
            <SiCanva className='mr-2' />
            <span>Edit Image</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className='w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto'>
                <Download className='mr-2 h-5 w-5' /> Download
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <p className='p-2 text-sm text-muted-foreground'>File Size</p>
              {imageDimensions && (
                <>
                  <DownloadMenuItem
                    imageDimensions={imageDimensions}
                    originalImage={data.image}
                    targetHeight={500}
                    label='Small'
                  />
                  <DownloadMenuItem
                    imageDimensions={imageDimensions}
                    originalImage={data.image}
                    targetHeight={1000}
                    label='Medium'
                  />
                  <DownloadMenuItem
                    imageDimensions={imageDimensions}
                    originalImage={data.image}
                    targetHeight={1500}
                    label='Large'
                  />
                  <DownloadMenuItem
                    imageDimensions={imageDimensions}
                    originalImage={data.image}
                    targetHeight={imageDimensions.height}
                    label='Original'
                  />
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className='grid grid-cols-3 gap-3'>
          <Button
            variant='outline'
            className='flex items-center justify-center gap-2 rounded-lg border-muted bg-background hover:bg-muted/20'
            onClick={handleLike}
          >
            <LikeButton likes={data.likes} session={session} />
            <span>{data.likeCount}</span>
          </Button>

          <Link href='#comment' className='w-full'>
            <Button
              variant='outline'
              className='flex w-full items-center justify-center gap-2 rounded-lg border-muted bg-background hover:bg-muted/20'
            >
              <MessageSquare className='h-5 w-5' />
              <span>{data.commentsCount}</span>
            </Button>
          </Link>

          <Share params={params} />
        </div>
      </div>

      <div className='space-y-4 rounded-lg bg-muted/30 p-4'>
        <h3 className='font-medium'>Design Information</h3>
        <div className='space-y-2 text-sm'>
          <div className='flex items-center justify-between border-b border-border/40 py-2'>
            <span className='text-muted-foreground'>Views:</span>{' '}
            <span className='font-medium'>{data.viewCount}</span>
          </div>
          <div className='flex items-center justify-between border-b border-border/40 py-2'>
            <span className='text-muted-foreground'>Likes:</span>{' '}
            <span className='font-medium'>{data.likeCount}</span>
          </div>
          <div className='flex items-center justify-between border-b border-border/40 py-2'>
            <span className='text-muted-foreground'>Comments:</span>{' '}
            <span className='font-medium'>{data.commentsCount}</span>
          </div>
          <div className='flex items-center justify-between border-b border-border/40 py-2'>
            <span className='text-muted-foreground'>Resolution:</span>{' '}
            <span className='font-medium'>
              {imageDimensions
                ? `${imageDimensions.width} × ${imageDimensions.height}`
                : 'Loading...'}
            </span>
          </div>
          <div className='flex items-center justify-between border-b border-border/40 py-2'>
            <span className='text-muted-foreground'>Media type:</span>{' '}
            <span className='font-medium'>JPG</span>
          </div>
          <div className='flex items-center justify-between py-2'>
            <span className='text-muted-foreground'>Published:</span>
            <span className='font-medium'>
              {convertToReadableDate(data.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export function DesignDetailsSkeleton() {
  return (
    <>
      <Skeleton className='h-16 w-full rounded-lg' />

      <div className='space-y-6'>
        <div className='flex justify-between gap-3'>
          <Skeleton className='h-10 w-full grow' />
          <Skeleton className='h-10 w-full grow' />
        </div>

        <div className='grid grid-cols-3 gap-3'>
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-10 w-full' />
        </div>
      </div>

      <Skeleton className='h-48 w-full rounded-lg' />
    </>
  );
}
