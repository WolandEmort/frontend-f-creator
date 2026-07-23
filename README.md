# Form Creator

A full-stack Google Forms–style form builder. Users create forms with multiple question types via a drag-and-drop builder, share a public link, collect responses, and view results — with per-form access control for collaborators.

**Live demo:** https://frontend-f-cr.vercel.app

> Demo note: [add a line here once you've re-deployed — e.g. "Register a free account to try the builder" or provide a demo login]

## Features

- **Authentication** — JWT-based register/login, protected routes
- **Form builder** — drag-and-drop question ordering (`dnd-kit`), multiple question types, client-side validation with dynamically assembled Zod schemas
- **Public form view** — shareable public link (`/view/:id`) for respondents, no login required
- **Response collection** — submissions stored and viewable per form (`/form/:id/responses`)
- **Collaborators** — form owners can add/remove collaborators to share edit access (REST-based; see [Roadmap](#roadmap) for planned real-time co-editing)
- **Dashboard** — manage all of a user's forms in one place

## Tech stack

**Frontend**
- React 19 + TypeScript, Vite
- Zustand (client state) + custom `apiFetch` layer for server state
- `dnd-kit` for drag-and-drop
- `react-hook-form` + Zod for dynamic form validation
- Tailwind CSS, Framer Motion
- Deployed on Vercel

**Backend**
- NestJS + TypeScript
- Prisma ORM + PostgreSQL
- Passport JWT for authentication
- Deployed on Vercel (serverless)

## Architecture notes

- **Question type registry pattern** — each question type (text, choice, checkbox, etc.) is registered once and drives both the builder UI and the response validation schema, so adding a new question type doesn't require touching unrelated code.
- **Dynamic schema generation** — the frontend assembles a Zod schema per-form at runtime from the backend-defined question structure, instead of hand-writing a schema per form.
- **Data model** (Prisma): `User`, `Form`, `FormQuestion`, `QuestionOption`, `Response`, `Answer`, `FormCollaborator`.

## Getting started

### Prerequisites
- Node.js 20+
- PostgreSQL instance (local or hosted, e.g. Supabase/Neon)

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in DATABASE_URL and JWT_SECRET
npx prisma migrate dev
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Testing

```bash
cd backend
npm run test       # unit tests for auth, form, prisma modules
```

Frontend test coverage is not yet in place — see [Roadmap](#roadmap).

## Roadmap

- [ ] Real-time collaborative editing (multiple users editing the same form simultaneously)
- [ ] Frontend test coverage (Vitest + Testing Library)
- [ ] CI pipeline (lint + test on PR)

## License

MIT
