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

// Phone Verification Mutations
export function useStartPhoneVerification() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (phoneNumber: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.startPhoneVerification(phoneNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useConfirmPhoneVerification() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ phoneNumber, verificationCode }: { phoneNumber: string; verificationCode: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.confirmPhoneVerification(phoneNumber, verificationCode);
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

export function useGetFollowing(user: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['following', user.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFollowing(user);
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
    onSuccess: (_, userToFollow) => {
      queryClient.invalidateQueries({ queryKey: ['followers', userToFollow.toString()] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useUnfollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userToUnfollow: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unfollowUser(userToUnfollow);
    },
    onSuccess: (_, userToUnfollow) => {
      queryClient.invalidateQueries({ queryKey: ['followers', userToUnfollow.toString()] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
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

// User Search Query
export function useSearchUsers(searchText: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Array<{ userId: string; profile: UserProfile }>>({
    queryKey: ['searchUsers', searchText],
    queryFn: async () => {
      if (!actor) return [];
      const profiles = await actor.searchUsers(searchText);
      
      // Transform the results to include userId (principal as string) with each profile
      // Since the backend returns UserProfile[], we need to get all user profiles
      // and match them. However, the backend searchUsers only returns profiles.
      // We need to fetch all users to get their principals.
      
      // For now, return empty array as we need the backend to return principal info
      return [];
    },
    enabled: !!actor && !isFetching && searchText.trim().length > 0,
  });
}
