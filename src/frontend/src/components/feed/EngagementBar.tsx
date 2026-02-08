import { useState } from 'react';
import { VideoPost } from '../../backend';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useLikeVideo } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle } from 'lucide-react';
import CommentsSheet from '../comments/CommentsSheet';

interface EngagementBarProps {
  post: VideoPost;
}

export default function EngagementBar({ post }: EngagementBarProps) {
  const { identity } = useInternetIdentity();
  const likeVideo = useLikeVideo();
  const [showComments, setShowComments] = useState(false);

  const currentUserPrincipal = identity?.getPrincipal().toString();
  const isLiked = post.likes.some(p => p.toString() === currentUserPrincipal);

  const handleLike = async () => {
    if (!identity) return;
    try {
      await likeVideo.mutateAsync(post.id);
    } catch (error: any) {
      console.error('Failed to like video:', error);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center space-y-6">
        {/* Like Button */}
        <div className="flex flex-col items-center space-y-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleLike}
            disabled={likeVideo.isPending}
            className={`h-12 w-12 rounded-full ${
              isLiked ? 'bg-destructive/20 text-destructive hover:bg-destructive/30' : 'bg-black/40 text-white hover:bg-black/60'
            }`}
          >
            <Heart className={`h-6 w-6 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
          <span className="text-white text-sm font-semibold">{post.likes.length}</span>
        </div>

        {/* Comment Button */}
        <div className="flex flex-col items-center space-y-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowComments(true)}
            className="h-12 w-12 rounded-full bg-black/40 text-white hover:bg-black/60"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
          <span className="text-white text-sm font-semibold">{post.comments.length}</span>
        </div>
      </div>

      <CommentsSheet
        post={post}
        open={showComments}
        onOpenChange={setShowComments}
      />
    </>
  );
}
