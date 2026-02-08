import { useState, useRef, useEffect } from 'react';
import { VideoPost } from '../../backend';
import { useNavigate } from '@tanstack/react-router';
import { useGetUserProfile } from '../../hooks/useQueries';
import EngagementBar from './EngagementBar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Play, Pause } from 'lucide-react';

interface VideoPostViewerProps {
  post: VideoPost;
}

export default function VideoPostViewer({ post }: VideoPostViewerProps) {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const { data: creatorProfile } = useGetUserProfile(post.creator);

  const videoUrl = post.videoBlob.getDirectURL();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play();
            setIsPlaying(true);
          } else {
            videoRef.current?.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.7 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoClick = () => {
    togglePlayPause();
    setShowControls(true);
    setTimeout(() => setShowControls(false), 2000);
  };

  const creatorName = creatorProfile?.username || 'Anonymous';
  const creatorInitial = creatorName.charAt(0).toUpperCase();
  const avatarUrl = creatorProfile?.profilePicture?.getDirectURL();

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full snap-start snap-always bg-black">
      {/* Video */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="absolute inset-0 w-full h-full object-contain"
        loop
        playsInline
        onClick={handleVideoClick}
      />

      {/* Play/Pause Overlay */}
      {showControls && (
        <button
          onClick={togglePlayPause}
          className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity"
        >
          {isPlaying ? (
            <Pause className="h-16 w-16 text-white opacity-80" />
          ) : (
            <Play className="h-16 w-16 text-white opacity-80" />
          )}
        </button>
      )}

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end pointer-events-none">
        <div className="p-4 space-y-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-auto">
          {/* Creator Info */}
          <button
            onClick={() => navigate({ to: '/profile/$userId', params: { userId: post.creator.toString() } })}
            className="flex items-center space-x-3"
          >
            <Avatar className="h-10 w-10 border-2 border-white">
              {avatarUrl && <AvatarImage src={avatarUrl} />}
              <AvatarFallback>{creatorInitial}</AvatarFallback>
            </Avatar>
            <div className="text-left">
              <p className="font-semibold text-white">{creatorName}</p>
              <p className="text-xs text-white/80">
                {formatDistanceToNow(Number(post.timestamp) / 1000000, { addSuffix: true })}
              </p>
            </div>
          </button>

          {/* Caption */}
          <div className="space-y-1">
            <h3 className="font-bold text-white text-lg">{post.title}</h3>
            {post.description && (
              <p className="text-white/90 text-sm line-clamp-2">{post.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Engagement Bar */}
      <div className="absolute right-4 bottom-24 pointer-events-auto">
        <EngagementBar post={post} />
      </div>
    </div>
  );
}
