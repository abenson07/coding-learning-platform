# Coding Learning Platform MVP

MVP implementation for **BEN-212**: display a single lesson and support persistent text highlighting.

## Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Express
- Database: SQLite (`better-sqlite3`)
- Tests: Vitest + Testing Library + Supertest

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start frontend and backend:
   ```bash
   npm run dev
   ```
   - Express API runs on `http://localhost:3000`
   - Vite app runs on `http://localhost:5173`

## API Endpoints

- `GET /api/lessons/intro`
- `GET /api/highlights/:lessonId`
- `POST /api/highlights`
- `DELETE /api/highlights/:id`

## Highlight workflow

1. Select text in the lesson.
2. Click **Highlight** in the floating action button.
3. Highlight persists to SQLite (`database.db`).
4. Refresh to verify highlight restoration.
5. Hover or click a highlight and use **Delete**.

## Testing

Run automated tests:

```bash
npm test
```

Run browser acceptance E2E tests:

```bash
npm run test:e2e
```

Coverage of acceptance criteria includes:

- Intro lesson API and rendering
- Create/list/delete highlight API behavior
- Graceful handling for unmatched highlights
- App loading and error states
- Full browser flow: create highlight, refresh persistence, and delete

## Manual acceptance test checklist

1. `npm run dev`
2. Open Vite URL in browser
3. Verify lesson content is displayed
4. Select text and click **Highlight**
5. Confirm yellow `<mark>` highlight appears
6. Refresh and confirm highlight persists
7. Create several additional highlights
8. Delete a highlight
9. Refresh and confirm deletion persists
10. Restart dev server and confirm highlights still load
