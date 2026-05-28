# Spooky Book Club FL

A web app for tracking the past and current reads and TBR list of a horror book club. Members can add books to the TBR queue, vote on what to read next, rate finished books, and let the "chaos algorithm" decide when picking the next book.

## Features

### Now & Next

Displays the book the club is currently reading, along with a description, page count, and the date of the next meeting. Authenticated members see a direct link to join the meeting.

The **Up Next** section shows the queue of books on deck. A "WTF should we read next?" button randomly selects a book from the TBR pile using a weighted algorithm — books with higher hype scores are more likely to be chosen.

### TBR (To Be Read)

A running list of books the club is considering. Each entry expands to show a cover, description, page count, and action panel. Authenticated members can use a book's action panel to move it to Currently Reading or the Up Next queue, rate their hype level on a scale of 1-5 👻 ghosts, or remove the book from the TBR list.

Books are added via a search modal backed by the Google Books API, with debounced live search and a preview step before saving.

### Read

A grid view of every book the club has finished, sorted by date read. Authenticated members can rate finished books with 😈 devils (1–5). Each card shows the member's own rating alongside the club average.

### Auth

Access is gated by an invite code. Members enter the code and email to receive a magic link — no password required. Interactive features (rating, adding books, voting) prompt unauthenticated visitors to log in.

### Demo

Some features require sign-in. This [Loom walkthrough](https://www.loom.com/share/146932929e1d4fed817678115b378634) shows them all.

## Tech Stack

| Layer               | Technology                                             |
| ------------------- | ------------------------------------------------------ |
| Framework           | React 19 + TypeScript                                  |
| Build               | Vite                                                   |
| Styling             | Tailwind CSS v4                                        |
| Components          | ShadCN                                                 |
| Backend / Auth / DB | Supabase (PostgreSQL, magic link auth, Edge Functions) |
| Book Search         | Google Books API                                       |

## Local Development

Fill in Supabase credentials in `.env.local`:

```
VITE_PUBLIC_SUPABASE_URL=
VITE_PUBLIC_SUPABASE_ANON_KEY=
```

```bash
npm install
npm run dev
```
