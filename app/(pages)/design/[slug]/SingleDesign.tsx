'use client';

import DOMPurify from 'isomorphic-dompurify';
import { AlertCircle, Info, Maximize2, X, ZoomIn, ZoomOut } from 'lucide-react';
import Image from 'next/image';
import type React from 'react';
import { use, useEffect, useRef, useState } from 'react';
import { getImageDimensions } from '@/components/helper/image/GetImageDimensions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useIncrementViews, useSingleDesign } from '@/services/design';
import type { Design } from '@/utils/Interface';
import type { ImageDimensions } from '@/utils/imageDimensions';
import { Author, AuthorSkeleton, Tags, TagsSkeleton } from './AuthorAndTags';
import { Comments } from './Comments';
import { DesignDetails, DesignDetailsSkeleton } from './DesignDetails';
import RelatedDesign from './RelatedDesign';

type Params = Promise<{ slug: string }>;

export default function SingleDesign(props: { params: Params }) {
  const [imageDimensions, setImageDimensions] =
    useState<ImageDimensions | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [controlsVisible, setControlsVisible] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [isPng, setIsPng] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const params = use(props.params);

  const slug = params.slug;
  const id = slug.split('_')[1];

  const { isLoading, data, isError, refetch } = useSingleDesign({
    id,
  });
  const { mutate: incrementViews } = useIncrementViews();

  useEffect(() => {
    if (data?.image) {
      setIsPng(data.image.toLowerCase().endsWith('.png'));
      getImageDimensions(data.image)
        .then((dimensions) => setImageDimensions(dimensions))
        .catch((error) =>
          // biome-ignore lint: error
          console.error('Failed to fetch image dimensions:', error),
        );
    }
  }, [data?.image]);

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    refetch();
  };

  // Reset zoom and position when entering fullscreen
  useEffect(() => {
    if (isFullscreen) {
      setZoomLevel(1);
      setImagePosition({ x: 0, y: 0 });
      setShowInfo(false);
      setControlsVisible(true);
    }
  }, [isFullscreen]);

  // Handle zoom in/out
  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
    // Reset position if zooming out to 1 or below
    if (zoomLevel <= 1.25) {
      setImagePosition({ x: 0, y: 0 });
    }
  };

  // Handle image dragging
  const handleImageDrag = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y,
      });
    }
  };

  const handleImageMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      e.preventDefault();
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleImageRelease = () => {
    setIsDragging(false);
  };

  // Handle controls visibility
  const handleMouseMove = () => {
    setControlsVisible(true);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    controlsTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
  };

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const toggleInfo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowInfo(!showInfo);
  };

  const closeFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFullscreen(false);
  };
  useEffect(() => {
    if (id && data?.id) {
      incrementViews(id);
    }
  }, [id, data?.id, incrementViews]);

  if (isError) {
    return (
      <div className='flex h-[calc(100vh-4rem)] items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardContent className='flex flex-col items-center space-y-4 p-6'>
            <AlertCircle className='h-12 w-12 text-red-500' />
            <h2 className='text-xl font-semibold'>Error Loading Design</h2>
            <p className='text-center text-muted-foreground'>
              We couldn&apos;t load the design. Please try again.
            </p>
            <Button
              onClick={handleRetry}
              disabled={retryCount >= 3}
              className='w-full'
            >
              {retryCount >= 3 ? 'Too many attempts' : 'Retry'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { image, name: designName, description }: Design = data || {};

  return (
    <>
      {/* Fullscreen Image View */}
      {isFullscreen && (
        // biome-ignore lint: error
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black'
          onClick={() => setIsFullscreen(false)}
          onMouseMove={handleMouseMove}
        >
          {/* biome-ignore lint: error */}
          <div
            className='relative h-full w-full'
            onClick={(e) => e.stopPropagation()}
            onMouseDown={handleImageDrag}
            onMouseMove={handleImageMove}
            onMouseUp={handleImageRelease}
            onMouseLeave={handleImageRelease}
          >
            {data?.image && (
              <div
                className={`absolute inset-0 flex items-center justify-center overflow-hidden ${
                  isPng ? 'checkerboard' : ''
                }`}
                style={{
                  cursor:
                    zoomLevel > 1
                      ? isDragging
                        ? 'grabbing'
                        : 'grab'
                      : 'default',
                }}
              >
                <div
                  style={{
                    transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${zoomLevel})`,
                    transition: isDragging
                      ? 'none'
                      : 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                >
                  <Image
                    src={data.image || '/placeholder.svg'}
                    alt={data.name || 'Design image'}
                    width={1500}
                    height={1500}
                    className='max-h-screen object-contain'
                    onContextMenu={(e) => e.preventDefault()}
                    priority
                  />
                </div>
              </div>
            )}

            {/* Fullscreen Controls */}
            {controlsVisible && (
              <>
                <div className='absolute bottom-8 left-1/2 flex -translate-x-1/2 transform items-center gap-6 rounded-full bg-black/40 px-8 py-4 backdrop-blur-md'>
                  <button
                    type='button'
                    onClick={handleZoomOut}
                    className='rounded-full p-2 text-white/90 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50'
                    disabled={zoomLevel <= 0.5}
                  >
                    <ZoomOut className='h-6 w-6' />
                  </button>
                  <span className='min-w-15 text-center text-sm font-medium text-white'>
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    type='button'
                    onClick={handleZoomIn}
                    className='rounded-full p-2 text-white/90 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50'
                    disabled={zoomLevel >= 3}
                  >
                    <ZoomIn className='h-6 w-6' />
                  </button>
                </div>

                <button
                  type='button'
                  onClick={closeFullscreen}
                  className='absolute right-8 top-8 rounded-full bg-black/40 p-3 text-white/90 backdrop-blur-md transition-colors hover:bg-white/10 hover:text-white'
                >
                  <X className='h-6 w-6' />
                  <span className='sr-only'>Close fullscreen</span>
                </button>

                <button
                  type='button'
                  onClick={toggleInfo}
                  className='absolute left-8 top-8 rounded-full bg-black/40 p-3 text-white/90 backdrop-blur-md transition-colors hover:bg-white/10 hover:text-white'
                >
                  <Info className='h-6 w-6' />
                  <span className='sr-only'>Image information</span>
                </button>

                {showInfo && (
                  <div className='absolute left-8 top-24 max-w-xs rounded-lg bg-black/40 p-4 text-white backdrop-blur-md'>
                    <h3 className='mb-2 text-lg font-semibold'>{data?.name}</h3>
                    <div className='space-y-1 text-sm'>
                      <p>By: {data?.author?.name}</p>
                      {imageDimensions && (
                        <p>
                          Dimensions: {imageDimensions.width} ×{' '}
                          {imageDimensions.height}
                        </p>
                      )}
                      <p>Likes: {data?.likeCount}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <div className='bg-background'>
        {/* Content section with 2-column layout */}
        <div className='container mx-auto px-4 py-8'>
          <div className='grid gap-8 lg:grid-cols-12 lg:gap-12'>
            {/* Main content - Image */}
            <div className='lg:col-span-8'>
              <div className='relative overflow-hidden rounded-xl bg-linear-to-b from-muted/50 to-background'>
                {isLoading ? (
                  <Skeleton className='h-120 w-full rounded-xl md:h-160' />
                ) : (
                  <div className='group relative overflow-hidden rounded-xl bg-secondary shadow-xl'>
                    <div className='absolute right-4 top-4 z-10'>
                      <Button
                        variant='secondary'
                        size='sm'
                        className='bg-background/80 backdrop-blur-xs hover:bg-background'
                        onClick={() => setIsFullscreen(true)}
                      >
                        <Maximize2 className='mr-2 h-4 w-4' />
                        Full Screen
                      </Button>
                    </div>
                    <div
                      className={`flex items-center justify-center bg-secondary p-4 md:h-152 ${
                        isPng ? 'checkerboard' : ''
                      }`}
                    >
                      <Image
                        onContextMenu={(e) => e.preventDefault()}
                        src={image || '/placeholder.svg'}
                        alt={designName || 'Design image'}
                        className='h-full w-full object-contain'
                        height={1000}
                        width={1000}
                        priority
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Author and title */}
              <div className='mt-8 space-y-6'>
                {isLoading ? (
                  <AuthorSkeleton />
                ) : (
                  <Author
                    author={data.author}
                    title={data.name}
                    authorId={data.authorId}
                  />
                )}
              </div>

              {/* Description */}
              {isLoading ? (
                <Skeleton className='mt-6 h-24 w-full' />
              ) : description && description.length > 11 ? (
                <Card className='mt-6 overflow-hidden border-0 bg-muted/30 shadow-xs'>
                  <CardContent className='p-6'>
                    <div
                      className='prose max-w-none dark:prose-invert'
                      // biome-ignore lint/security/noDangerouslySetInnerHtml: this is fine
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(description || ''),
                      }}
                    />
                  </CardContent>
                </Card>
              ) : null}

              {/* Tags */}
              <div className='mt-8'>
                {isLoading ? <TagsSkeleton /> : <Tags tags={data.tags} />}
              </div>

              {/* Comments block */}
              <div className='mt-8'>
                {isLoading ? (
                  <Skeleton className='h-48 w-full' />
                ) : (
                  <Comments data={data} refetch={refetch} />
                )}
              </div>
            </div>

            {/* Sidebar Design Details */}
            <div className='lg:col-span-4'>
              <div className='sticky top-20'>
                <Card className='overflow-hidden border-0 bg-muted/30 shadow-xs'>
                  <CardContent className='space-y-6 p-6'>
                    {isLoading ? (
                      <DesignDetailsSkeleton />
                    ) : (
                      <DesignDetails
                        data={data}
                        imageDimensions={imageDimensions}
                        params={params}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Related Design */}
          <div className='mt-16'>
            {isLoading ? (
              <Skeleton className='h-48 w-full' />
            ) : (
              <RelatedDesign postId={data.id} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
