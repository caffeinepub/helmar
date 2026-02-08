import { Principal } from '@dfinity/principal';
import { useFollowUser, useGetFollowers } from '../../hooks/useQueries';
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
  const { data: followers } = useGetFollowers(userId);

  const currentUserPrincipal = identity?.getPrincipal().toString();
  const isFollowing = followers?.some(f => f.toString() === currentUserPrincipal) || false;

  const handleFollow = async () => {
    try {
      await followUser.mutateAsync(userId);
    } catch (error: any) {
      console.error('Failed to follow user:', error);
    }
  };

  return (
    <Button
      onClick={handleFollow}
      disabled={followUser.isPending || isFollowing}
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
