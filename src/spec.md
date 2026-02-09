# Specification

## Summary
**Goal:** Let authenticated users search for other users from the main Feed screen and view results on a dedicated search page.

**Planned changes:**
- Add a clearly discoverable search (magnifying glass) button in the Feed header that navigates to a new user search route while keeping the existing logout button functional.
- Create a new authenticated user search screen/route (e.g., `/search`) with an English placeholder text input, clear/search affordance, and a results list that shows usernames (and avatar thumbnails when available) and links to `/profile/$userId`.
- Add a backend query in `backend/main.mo` to search users by username (case-insensitive substring match) and wire it to a new React Query hook in `frontend/src/hooks/useQueries.ts`, including loading/error/empty states using existing patterns.

**User-visible outcome:** From the Feed, users can tap a search icon to open a search screen, type a username query, see matching users, and navigate to any result’s profile.
