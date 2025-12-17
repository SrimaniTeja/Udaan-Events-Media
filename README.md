## Event Media Workflow Management System

Role-based portals (Admin / Cameraman / Editor) for managing event media workflow. **Media files are not stored in the DB** (only metadata). Google Drive integration is the next step (not implemented yet).

## Getting Started

### Prereqs
- **Node.js**: v20.x
- **PostgreSQL**: local install (Windows) or hosted Postgres (Neon/Supabase/Railway/etc)

### 1) Configure environment
- Copy `env.example` → create a local `.env` file (or set env vars in your OS)
- Set:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/udaan_events_media?schema=public"
AUTH_SECRET="replace-with-a-long-random-string"
```

### 2) Make sure PostgreSQL is running
- If using local PostgreSQL, confirm it’s reachable at `localhost:5432`
- If using hosted PostgreSQL, use the provider connection string as `DATABASE_URL`

### 3) Run migrations + seed demo data

```bash
npm run prisma:migrate
npm run prisma:seed
```

### 4) Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Demo accounts (password: `password`)
- Admin: `admin@udaan.local`
- Cameraman: `cameraman@udaan.local`
- Editor: `editor@udaan.local`
- Editor 2: `editor2@udaan.local`

### Notes
- **Uploads/downloads are mocked** right now (until Google Drive streaming is added).
- **Notifications are DB-backed** and triggered on RAW upload, assignment, FINAL upload, and completion.
- Editors are **auto-assigned** when RAW is uploaded if they are `isFree=true`.

## Useful scripts
- `npm run prisma:studio` – browse DB
- `npm run prisma:generate` – regenerate Prisma client

## Next roadmap step (not in this PR)
- Google Drive folder creation + streaming upload/download (backend-owned credentials)
