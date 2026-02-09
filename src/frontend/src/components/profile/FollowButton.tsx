import { Principal } from '@dfinity/principal';
import { useFollowUser, useUnfollowUser, useGetFollowers } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck } from 'lucide-react';

interface FollowButtonProps {
  userId: Principal;
  className?: string;
}

export default function FollowButton({ userId, className }: FollowButtonProps) {
  const { identity } = useInternetIdentity();
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();
  const { data: followers } = useGetFollowers(userId);

  const currentUserPrincipal = identity?.getPrincipal().toString();
  const isFollowing = followers?.some(f => f.toString() === currentUserPrincipal) || false;

  const handleClick = async () => {
    try {
      if (isFollowing) {
        await unfollowUser.mutateAsync(userId);
      } else {
        await followUser.mutateAsync(userId);
      }
    } catch (error: any) {
      console.error('Failed to update follow status:', error);
    }
  };

  const isPending = followUser.isPending || unfollowUser.isPending;

  return (
    <Button
      onClick={handleClick}
      disabled={isPending}
      variant={isFollowing ? 'outline' : 'default'}
      className={className}
    >
      {isFollowing ? (
        <>
          <UserCheck className="h-4 w-4 mr-2" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  );
}
