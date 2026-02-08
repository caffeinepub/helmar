import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Principal } from '@dfinity/principal';
import { ErrorScreen, EmptyScreen } from '../components/common/ScreenStates';
import { useMemo } from 'react';

export default function MessageThreadPage() {
  const params = useParams({ strict: false });
  const navigate = useNavigate();

  // Parse principal before any hooks
  const userPrincipal = useMemo(() => {
    try {
      return Principal.fromText(params.userId!);
    } catch {
      return null;
    }
  }, [params.userId]);

  // Call hook unconditionally at the top level
  const { data: profile } = useGetUserProfile(userPrincipal || Principal.anonymous());

  // Now we can do conditional returns
  if (!userPrincipal) {
    return <ErrorScreen message="Invalid user ID" />;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="border-b p-4 flex items-center space-x-3">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/messages' })}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">{profile?.username || 'User'}</h1>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <EmptyScreen
          title="No messages yet"
          description="Send a message to start the conversation"
        />
      </div>
    </div>
  );
}
