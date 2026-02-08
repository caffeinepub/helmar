import { useParams, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetUserProfile, useGetAllVideoPosts, useGetFollowers } from '../hooks/useQueries';
import { LoadingScreen, ErrorScreen, EmptyScreen } from '../components/common/ScreenStates';
import EditProfileDialog from '../components/profile/EditProfileDialog';
import FollowButton from '../components/profile/FollowButton';
import ProfilePostsList from '../components/profile/ProfilePostsList';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, MessageCircle } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Principal } from '@dfinity/principal';

export default function ProfilePage() {
  const params = useParams({ strict: false });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [showEditDialog, setShowEditDialog] = useState(false);

  const currentUserPrincipal = identity?.getPrincipal().toString();
  const profileUserId = params.userId || currentUserPrincipal;
  const isOwnProfile = profileUserId === currentUserPrincipal;

  // Parse principal before any hooks
  const userPrincipal = useMemo(() => {
    try {
      return Principal.fromText(profileUserId!);
    } catch {
      return null;
    }
  }, [profileUserId]);

  // Call all hooks unconditionally at the top level
  const { data: profile, isLoading: profileLoading, error: profileError } = useGetUserProfile(
    userPrincipal || Principal.anonymous()
  );
  const { data: allPosts } = useGetAllVideoPosts();
  const { data: followers } = useGetFollowers(userPrincipal || Principal.anonymous());

  // Now we can do conditional returns
  if (!userPrincipal) {
    return <ErrorScreen message="Invalid user ID" />;
  }

  if (profileLoading) {
    return <LoadingScreen message="Loading profile..." />;
  }

  if (profileError || !profile) {
    return <ErrorScreen message="Failed to load profile" />;
  }

  const userPosts = allPosts?.filter(post => post.creator.toString() === profileUserId) || [];
  const followerCount = followers?.length || 0;

  const username = profile.username;
  const userInitial = username.charAt(0).toUpperCase();
  const avatarUrl = profile.profilePicture?.getDirectURL();

  return (
    <div className="container max-w-4xl py-6 px-4">
      {/* Profile Header */}
      <div className="space-y-6">
        <div className="flex items-start space-x-6">
          <Avatar className="h-24 w-24 border-4 border-primary/20">
            {avatarUrl && <AvatarImage src={avatarUrl} />}
            <AvatarFallback className="text-3xl">{userInitial}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-2xl font-bold">{username}</h1>
              {profile.bio && <p className="text-muted-foreground mt-1">{profile.bio}</p>}
            </div>

            <div className="flex items-center space-x-6 text-sm">
              <div>
                <span className="font-bold">{userPosts.length}</span>
                <span className="text-muted-foreground ml-1">posts</span>
              </div>
              <div>
                <span className="font-bold">{followerCount}</span>
                <span className="text-muted-foreground ml-1">followers</span>
              </div>
            </div>

            <div className="flex space-x-2">
              {isOwnProfile ? (
                <Button variant="outline" onClick={() => setShowEditDialog(true)} className="flex-1">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  <FollowButton userId={userPrincipal} className="flex-1" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate({ to: '/messages/$userId', params: { userId: profileUserId! } })}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="posts" className="flex-1">Posts</TabsTrigger>
          </TabsList>
          <TabsContent value="posts" className="mt-6">
            {userPosts.length === 0 ? (
              <EmptyScreen
                title={isOwnProfile ? "You haven't posted yet" : "No posts yet"}
                description={isOwnProfile ? "Share your first video to get started!" : undefined}
              />
            ) : (
              <ProfilePostsList posts={userPosts} />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {isOwnProfile && (
        <EditProfileDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          currentProfile={profile}
        />
      )}
    </div>
  );
}
