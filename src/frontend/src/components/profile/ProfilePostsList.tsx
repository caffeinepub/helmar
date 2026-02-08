import { VideoPost } from '../../backend';
import { Card } from '@/components/ui/card';
import { Play } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ProfilePostsListProps {
  posts: VideoPost[];
}

export default function ProfilePostsList({ posts }: ProfilePostsListProps) {
  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-2">
      {posts.map((post) => {
        const videoUrl = post.videoBlob.getDirectURL();
        
        return (
          <Card key={post.id} className="relative aspect-[9/16] overflow-hidden group cursor-pointer">
            <video
              src={videoUrl}
              className="absolute inset-0 w-full h-full object-cover"
              muted
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-2 p-2">
              <Play className="h-8 w-8 text-white" />
              <div className="text-white text-center text-xs">
                <p className="font-semibold line-clamp-1">{post.title}</p>
                <p className="text-white/80">
                  {formatDistanceToNow(Number(post.timestamp) / 1000000, { addSuffix: true })}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
