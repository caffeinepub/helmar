import { EmptyScreen } from '../components/common/ScreenStates';
import { MessageCircle } from 'lucide-react';

export default function MessagesPage() {
  return (
    <div className="container max-w-4xl py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      <EmptyScreen
        icon={<MessageCircle className="h-12 w-12 text-muted-foreground" />}
        title="No messages yet"
        description="Start a conversation by visiting someone's profile and clicking the message button"
      />
    </div>
  );
}
