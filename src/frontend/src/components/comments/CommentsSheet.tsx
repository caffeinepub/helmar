import { useState } from 'react';
import { VideoPost } from '../../backend';
import { useAddComment, useGetUserProfile } from '../../hooks/useQueries';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommentsSheetProps {
  post: VideoPost;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CommentItem({ comment }: { comment: VideoPost['comments'][0] }) {
  const { data: authorProfile } = useGetUserProfile(comment.author);
  const authorName = authorProfile?.username || 'Anonymous';
  const authorInitial = authorName.charAt(0).toUpperCase();
  const avatarUrl = authorProfile?.profilePicture?.getDirectURL();

  return (
    <div className="flex space-x-3 py-3">
      <Avatar className="h-8 w-8">
        {avatarUrl && <AvatarImage src={avatarUrl} />}
        <AvatarFallback className="text-xs">{authorInitial}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-baseline space-x-2">
          <span className="font-semibold text-sm">{authorName}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(Number(comment.timestamp) / 1000000, { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm">{comment.text}</p>
      </div>
    </div>
  );
}

export default function CommentsSheet({ post, open, onOpenChange }: CommentsSheetProps) {
  const [commentText, setCommentText] = useState('');
  const addComment = useAddComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await addComment.mutateAsync({ videoId: post.id, commentText: commentText.trim() });
      setCommentText('');
    } catch (error: any) {
      console.error('Failed to add comment:', error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle>Comments ({post.comments.length})</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-[calc(100%-4rem)] mt-4">
          <ScrollArea className="flex-1 pr-4">
            {post.comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No comments yet. Be the first to comment!
              </div>
            ) : (
              <div className="space-y-1">
                {post.comments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))}
              </div>
            )}
          </ScrollArea>

          <form onSubmit={handleSubmit} className="flex space-x-2 pt-4 border-t">
            <Input
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={addComment.isPending}
            />
            <Button type="submit" size="icon" disabled={addComment.isPending || !commentText.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
