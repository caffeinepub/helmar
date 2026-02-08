import { useGetAllVideoPosts } from '../hooks/useQueries';
import { LoadingScreen, ErrorScreen, EmptyScreen } from '../components/common/ScreenStates';
import VideoPostViewer from '../components/feed/VideoPostViewer';
import { Video } from 'lucide-react';

export default function FeedPage() {
  const { data: posts, isLoading, error, refetch } = useGetAllVideoPosts();

  if (isLoading) {
    return <LoadingScreen message="Loading feed..." />;
  }

  if (error) {
    return <ErrorScreen message="Failed to load feed" onRetry={() => refetch()} />;
  }

  if (!posts || posts.length === 0) {
    return (
      <EmptyScreen
        icon={<Video className="h-12 w-12 text-muted-foreground" />}
        title="No videos yet"
        description="Be the first to share a video with the community!"
      />
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
      {posts.map((post) => (
        <VideoPostViewer key={post.id} post={post} />
      ))}
    </div>
  );
}
