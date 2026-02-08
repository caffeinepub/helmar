import { useGetNotifications, useUpdateNotificationStatus } from '../hooks/useQueries';
import { LoadingScreen, ErrorScreen, EmptyScreen } from '../components/common/ScreenStates';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bell, Heart, MessageCircle, UserPlus, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { NotificationType } from '../backend';

export default function NotificationsPage() {
  const { data: notifications, isLoading, error, refetch } = useGetNotifications();
  const updateStatus = useUpdateNotificationStatus();

  if (isLoading) {
    return <LoadingScreen message="Loading notifications..." />;
  }

  if (error) {
    return <ErrorScreen message="Failed to load notifications" onRetry={() => refetch()} />;
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="container max-w-4xl py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Notifications</h1>
        <EmptyScreen
          icon={<Bell className="h-12 w-12 text-muted-foreground" />}
          title="No notifications yet"
          description="You'll see notifications here when people interact with your content"
        />
      </div>
    );
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await updateStatus.mutateAsync({ notificationId, isRead: true });
    } catch (error: any) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.like:
        return <Heart className="h-5 w-5 text-destructive" />;
      case NotificationType.comment:
        return <MessageCircle className="h-5 w-5 text-primary" />;
      case NotificationType.follow:
        return <UserPlus className="h-5 w-5 text-chart-2" />;
      case NotificationType.message:
        return <MessageCircle className="h-5 w-5 text-chart-3" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  return (
    <div className="container max-w-4xl py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>

      <div className="space-y-2">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className={`p-4 ${notification.isRead ? 'opacity-60' : 'border-primary/50'}`}
          >
            <div className="flex items-start space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {getNotificationIcon(notification.notificationType)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-1">
                <p className="text-sm">{notification.message}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(Number(notification.timestamp) / 1000000, { addSuffix: true })}
                </p>
              </div>

              {!notification.isRead && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleMarkAsRead(notification.id)}
                  disabled={updateStatus.isPending}
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
