# Form Creator

A full-stack Google Forms–style form builder. Users create multi-page forms with a drag-and-drop builder, share a public link, collect responses, and invite collaborators who can edit the form and view its responses.

**Live demo:** https://frontend-f-cr.vercel.app

> Register a free account on the login page to try the builder.

<!-- Add 2–3 screenshots here (builder, public form, responses), e.g.:
![Builder](docs/builder.png)
Put the image files in a /docs folder. -->

## Features

- **Authentication** — JWT-based register/login with protected routes
- **Form builder** — drag-and-drop question ordering (`dnd-kit`) with five element types: short text, long text, single choice (radio), multiple choice (checkbox) and page break
- **Multi-page forms** — page breaks split a form into pages with step-by-step navigation for respondents
- **Validation rules** — per-question required flag, min/max text length and min/max number of selected options, stored with the question and enforced when a respondent submits a page
- **Public form view** — shareable link (`/view/:id`), no login required for respondents
- **Responses** — submissions are stored per form and viewable by the owner and collaborators (`/form/:id/responses`)
- **Collaborators** — the owner adds collaborators by email; collaborators see the form on their dashboard, can edit it and view responses. Only the owner can delete the form or manage collaborators
- **Dashboard** — all forms a user owns or collaborates on in one place

## Tech stack

**Frontend**
- React 19 + TypeScript, Vite
- React Router
- Zustand for builder state, a small `apiFetch` wrapper for API calls (adds the JWT, handles 401)
- `dnd-kit` for drag-and-drop
- `react-hook-form` + Zod for the login/register form
- Tailwind CSS, Framer Motion
- Deployed on Vercel

**Backend**
- NestJS + TypeScript
- Prisma ORM + PostgreSQL
- Passport JWT, `bcrypt` for password hashing
- `class-validator` DTOs with a global `ValidationPipe`
- Jest for unit tests
- Deployed on Vercel (serverless)

## Architecture notes

- **Builder state in one store** — a Zustand store holds the whole form being edited (metadata, elements, options) with actions to add, update, reorder and remove elements, so the builder UI stays a thin layer over that state.
- **Questions are data** — the question type is a Prisma enum (`TEXT`, `TEXTAREA`, `RADIO`, `CHECKBOX`, `PAGE_BREAK`) and validation rules are stored as JSON on the question, so the public view renders and validates any form from the API response alone.
- **Pagination from a flat list** — the backend stores questions in a single ordered list; the public view splits that list into pages at every `PAGE_BREAK`.
- **Access control in the service layer** — `FormService` checks owner vs. collaborator on every read/update/response request; delete and collaborator management are owner-only.
- **Data model** (Prisma): `User`, `Form`, `FormQuestion`, `QuestionOption`, `Response`, `Answer`, `FormCollaborator`.

## API overview

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | — | Create an account |
| POST | `/auth/login` | — | Log in, returns a JWT |
| GET | `/auth/me` | JWT | Current user |
| GET | `/form/public/:id` | — | Public form for respondents |
| POST | `/form/public/:id/responses` | — | Submit a response |
| POST | `/form` | JWT | Create a form |
| GET | `/form` | JWT | Forms the user owns or collaborates on |
| GET | `/form/:id` | JWT | One form (owner or collaborator) |
| PUT | `/form/:id` | JWT | Update a form (owner or collaborator) |
| DELETE | `/form/:id` | JWT | Delete a form (owner only) |
| GET | `/form/:id/responses` | JWT | Responses (owner or collaborator) |
| GET / POST | `/form/:id/collaborators` | JWT | List / add collaborators (owner only) |
| DELETE | `/form/:id/collaborators/:userId` | JWT | Remove a collaborator (owner only) |

## Getting started

### Prerequisites
- Node.js 20+
- PostgreSQL instance (local or hosted, e.g. Supabase/Neon)

### Backend
```bash
cd backend
npm install
cp env.example .env   # fill in DATABASE_URL and JWT_SECRET
npx prisma migrate dev
npm run start:dev     # http://localhost:3000
```

### Frontend
```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:3000" > .env
npm run dev           # http://localhost:5173
```

> **Local development note:** the backend only allows the deployed frontend origin in `backend/src/main.ts` (CORS). Add `http://localhost:5173` there to run the frontend locally against your own backend.

## Testing

```bash
cd backend
npm run test       # unit tests for auth, form, prisma modules
```

There are no frontend tests yet — see the roadmap.

## Known limitations

- Collaboration is access sharing, not live co-editing: saving a form sends the whole form, so if two people edit the same form at once, the last save wins.
- Required fields and validation rules are enforced in the frontend; the API currently checks the shape of a submission but not these rules.

## Roadmap

- [ ] Real-time collaborative editing (multiple users editing the same form simultaneously)
- [ ] Server-side validation of submitted answers against the form's rules
- [ ] Configurable CORS origin via environment variable
- [ ] Frontend test coverage (Vitest + Testing Library)
- [ ] CI pipeline (lint + test on PR)

## License

MIT
