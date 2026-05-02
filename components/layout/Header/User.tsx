'use client';

import {
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  UserIcon,
} from 'lucide-react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useConversations } from '@/hooks/use-conversation';
import { clearCsrfToken } from '@/lib/apiClient';
import { cn } from '@/lib/utils';

interface UserDropdownProps {
  fixed?: boolean;
  align?: 'start' | 'center' | 'end';
}

export default function UserDropdown({
  fixed = false,
  align = 'end',
}: UserDropdownProps) {
  const { status, data: session } = useSession();
  const { conversations } = useConversations();

  // Calculate unread messages count
  const unreadMessagesCount =
    conversations?.reduce(
      (
        count: number,
        conversation: {
          // biome-ignore lint: error
          lastMessage: { isRead: any; senderId: string | undefined };
        },
      ) => {
        const hasUnreadMessages =
          conversation.lastMessage &&
          !conversation.lastMessage.isRead &&
          conversation.lastMessage.senderId !== session?.user?.id;

        return hasUnreadMessages ? count + 1 : count;
      },
      0,
    ) || 0;

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';

    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();

    return (
      nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
    ).toUpperCase();
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className='flex items-center gap-2'>
        <Skeleton className='h-10 w-10 rounded-full' />
      </div>
    );
  }

  // Authenticated state
  if (status === 'authenticated' && session?.user) {
    const initials = getInitials(session.user.name);
    const userRole = session.user.role as string | undefined;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            className={cn(
              'relative h-10 w-10 rounded-full border border-transparent transition-colors hover:bg-muted focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring',
              fixed && 'border-border',
            )}
          >
            <Avatar className='h-9 w-9'>
              <AvatarImage
                src={session.user.image || undefined}
                alt={session.user.name || 'User avatar'}
              />
              <AvatarFallback className='text-xs font-medium'>
                {initials}
              </AvatarFallback>
            </Avatar>
            {userRole === 'ADMIN' && (
              <span className='absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground'>
                A
              </span>
            )}

            {/* Unread messages notification dot */}
            {unreadMessagesCount > 0 && (
              <span className='absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white'>
                {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className='w-56'
          align={align}
          forceMount
          sideOffset={8}
        >
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col space-y-1'>
              <p className='text-sm font-medium leading-none'>
                {session.user.name}
              </p>
              <p className='text-xs leading-none text-muted-foreground'>
                {session.user.email}
              </p>
              {userRole && (
                <p className='mt-1 text-xs font-medium text-primary'>
                  {userRole.charAt(0).toUpperCase() +
                    userRole.slice(1).toLowerCase()}
                </p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link
              href='/dashboard'
              className='flex w-full cursor-pointer items-center'
            >
              <LayoutDashboard className='mr-2 h-4 w-4' />
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href='/messages'
              className='flex w-full cursor-pointer items-center justify-between'
            >
              <div className='flex items-center'>
                <MessageSquare className='mr-2 h-4 w-4' />
                Messages
              </div>
              {unreadMessagesCount > 0 && (
                <Badge
                  variant='destructive'
                  className='ml-2 h-5 min-w-[20px] rounded-full px-1'
                >
                  {unreadMessagesCount}
                </Badge>
              )}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href='/edit-profile'
              className='flex w-full cursor-pointer items-center'
            >
              <Settings className='mr-2 h-4 w-4' />
              Edit Account
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href={`/profile?id=${session.user.id}`}
              className='flex w-full cursor-pointer items-center'
            >
              <UserIcon className='mr-2 h-4 w-4' />
              Account Details
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                className='cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive'
                onSelect={(e) => e.preventDefault()}
              >
                <LogOut className='mr-2 h-4 w-4' />
                Log Out
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you sure you want to log out?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  You will be signed out of your account on this device.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    clearCsrfToken();
                    signOut({ redirect: true, callbackUrl: '/' });
                  }}
                  className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                >
                  Log Out
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Unauthenticated state
  return (
    <Link href='/sign-in'>
      <Button className='gap-2'>
        <UserIcon className='h-4 w-4' />
        Sign In
      </Button>
    </Link>
  );
}
