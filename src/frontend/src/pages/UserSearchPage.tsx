import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useSearchUsers } from '../hooks/useQueries';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { LoadingScreen, ErrorScreen, EmptyScreen } from '../components/common/ScreenStates';
import { Search, X, Users } from 'lucide-react';

export default function UserSearchPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const { data: searchResults, isLoading, error } = useSearchUsers(debouncedQuery);

  const handleSearch = () => {
    setDebouncedQuery(searchQuery.trim());
  };

  const handleClear = () => {
    setSearchQuery('');
    setDebouncedQuery('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleUserClick = (userId: string) => {
    navigate({ to: '/profile/$userId', params: { userId } });
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 h-full overflow-y-auto">
      <div className="space-y-6">
        {/* Search Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Search Users</h1>
          <p className="text-sm text-muted-foreground">Find and connect with other users</p>
        </div>

        {/* Search Input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button onClick={handleSearch} disabled={!searchQuery.trim()}>
            Search
          </Button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {!debouncedQuery ? (
            <EmptyScreen
              icon={<Users className="h-12 w-12 text-muted-foreground" />}
              title="Start searching"
              description="Enter a username to find other users on the platform"
            />
          ) : isLoading ? (
            <LoadingScreen message="Searching users..." />
          ) : error ? (
            <ErrorScreen
              message="Failed to search users. Please try again."
              onRetry={handleSearch}
            />
          ) : !searchResults || searchResults.length === 0 ? (
            <EmptyScreen
              icon={<Users className="h-12 w-12 text-muted-foreground" />}
              title="No users found"
              description={`No users match "${debouncedQuery}". Try a different search term.`}
            />
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Found {searchResults.length} {searchResults.length === 1 ? 'user' : 'users'}
              </p>
              {searchResults.map((result) => {
                const avatarUrl = result.profile.profilePicture?.getDirectURL();
                const initials = result.profile.username
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <Card
                    key={result.userId}
                    className="p-4 hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => handleUserClick(result.userId)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        {avatarUrl && <AvatarImage src={avatarUrl} alt={result.profile.username} />}
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{result.profile.username}</p>
                        {result.profile.bio && (
                          <p className="text-sm text-muted-foreground truncate">{result.profile.bio}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
