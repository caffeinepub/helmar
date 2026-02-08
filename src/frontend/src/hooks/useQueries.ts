import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@dfinity/principal';
import { UserProfile, VideoPost, Notification, ExternalBlob } from '../backend';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetUserProfile(user: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', user.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getUserProfile(user);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Video Post Queries
export function useGetAllVideoPosts() {
  const { actor, isFetching } = useActor();

  return useQuery<VideoPost[]>({
    queryKey: ['videoPosts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVideoPosts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetVideoPost(videoId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<VideoPost | null>({
    queryKey: ['videoPost', videoId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getVideoPost(videoId);
    },
    enabled: !!actor && !isFetching && !!videoId,
  });
}

export function useCreateVideoPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      description,
      videoBlob,
    }: {
      title: string;
      description: string;
      videoBlob: ExternalBlob;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createVideoPost(title, description, videoBlob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videoPosts'] });
    },
  });
}

export function useLikeVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.likeVideo(videoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videoPosts'] });
    },
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ videoId, commentText }: { videoId: string; commentText: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addComment(videoId, commentText);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videoPosts'] });
    },
  });
}

// Follow Queries
export function useGetFollowers(user: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['followers', user.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFollowers(user);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userToFollow: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.followUser(userToFollow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// Notification Queries
export function useGetNotifications() {
  const { actor, isFetching } = useActor();

  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNotifications();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

export function useUpdateNotificationStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ notificationId, isRead }: { notificationId: string; isRead: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateNotificationStatus(notificationId, isRead);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
