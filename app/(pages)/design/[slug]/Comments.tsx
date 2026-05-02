'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { MessageCircle, Send, Trash } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import apiClient from '@/lib/apiClient';
import type { Design } from '@/utils/Interface';

const FormSchema = z.object({
  comment: z
    .string()
    .min(3, {
      message: 'Comment must be at least 3 characters.',
    })
    .max(500, {
      message: 'Comment must not be longer than 500 characters.',
    }),
});

export function Comments({
  data,
  refetch,
}: {
  data: Design;
  refetch: () => void;
}) {
  const { status, data: session } = useSession();
  // biome-ignore lint: error
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      comment: '',
    },
  });

  function onSubmit(CommentData: z.infer<typeof FormSchema>) {
    if (!session?.user?.id) {
      toast.error('You must be logged in to comment.');
      return;
    }

    const payload = {
      comment: CommentData.comment,
      designId: data.id,
    };

    toast.promise(
      apiClient.post('/api/design/single-design/comments', payload),
      {
        loading: 'Submitting your comment...',
        success: () => {
          refetch();
          form.reset();
          return 'Comment submitted successfully!';
        },
        error: 'Failed to submit your comment. Please try again.',
      },
    );
  }

  function handleDelete(commentId: string) {
    toast.promise(
      apiClient.delete(
        `/api/design/single-design/comments?commentId=${commentId}`,
      ),
      {
        loading: 'Deleting comment...',
        success: () => {
          refetch();
          return 'Comment deleted successfully!';
        },
        error: 'Failed to delete comment. Please try again.',
      },
    );
  }

  return (
    <Card id='comment'>
      <CardHeader className='flex flex-row items-center justify-between border-b'>
        <CardTitle>Comments</CardTitle>
        <div className='flex items-center space-x-2 rounded-full bg-secondary px-3 py-1'>
          <MessageCircle size={18} />
          <span className='font-medium'>{data.commentsCount}</span>
        </div>
      </CardHeader>
      <CardContent className='p-0'>
        <ScrollArea className='max-h-125'>
          <div className='space-y-0 divide-y divide-zinc-200/40 dark:divide-zinc-800/40'>
            {data.comments.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-12 text-center'>
                <MessageCircle className='mb-2 h-12 w-12 text-zinc-300 dark:text-zinc-700' />
                <p className='text-lg font-medium text-zinc-900 dark:text-white'>
                  No comments yet
                </p>
                <p className='text-sm text-zinc-500 dark:text-zinc-400'>
                  Be the first to share your thoughts!
                </p>
              </div>
            ) : (
              data.comments.map((comment, index) => (
                <motion.div
                  key={comment.id}
                  id={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className='group flex items-start space-x-4 p-6 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                >
                  <Avatar className='h-10 w-10 border-2 border-zinc-200 dark:border-zinc-700'>
                    <AvatarImage
                      src={comment.user.image}
                      alt={comment.user.name}
                    />
                    <AvatarFallback className='bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200'>
                      {comment.user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex-1'>
                    <div className='flex items-center justify-between'>
                      <Link href={`/profile?id=${comment.userId}`}>
                        <Button variant='link' className='px-0'>
                          {comment.user.name}
                        </Button>
                      </Link>
                      <p className='rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-600'>
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <p className='mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300'>
                      {comment.content}
                    </p>
                  </div>
                  {(session?.user?.role === 'ADMIN' ||
                    comment.userId === session?.user?.id) && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => setCommentToDelete(comment.id)}
                          aria-label='Delete comment'
                        >
                          <Trash size={18} />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirm Deletion</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete this comment? This
                            action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant='outline'
                            onClick={() => setCommentToDelete(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant='destructive'
                            onClick={() => handleDelete(comment.id)}
                          >
                            Delete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className='border-t p-4 md:p-6'>
        {status === 'authenticated' ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='flex w-full items-start space-x-4'
            >
              <Avatar className='h-10 w-10 border-2 border-zinc-200 dark:border-zinc-700'>
                <AvatarImage
                  src={session?.user?.image || undefined}
                  alt={session?.user?.name || 'User Avatar'}
                />
                <AvatarFallback className='bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200'>
                  {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>

              <FormField
                control={form.control}
                name='comment'
                render={({ field }) => (
                  <FormItem className='flex-1'>
                    <FormControl>
                      <Textarea placeholder='Add a comment...' {...field} />
                    </FormControl>
                    <FormMessage className='text-rose-500' />
                  </FormItem>
                )}
              />

              <Button
                type='submit'
                size='icon'
                className='h-10 w-10 rounded-full'
                aria-label='Post comment'
              >
                <Send size={18} />
              </Button>
            </form>
          </Form>
        ) : (
          <Link href='/signin' className='flex w-full justify-center'>
            <Button variant='default' aria-label='Login to comment'>
              Login to Comment
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
