<!--
Guidance for AI coding agents working on the Telescope repository.
Keep this file concise and actionable: focus on project-specific patterns,
commands, and locations that let an agent be productive immediately.
-->

# Telescope — Copilot instructions

Short checklist (what to know first):

- This is a Next.js 14 (app router) TypeScript project located under `src/app`.
- Data layer: Prisma with MongoDB (see `prisma/schema.prisma`). Prisma Client is generated during `postinstall`.
- A Discord bot runs from `bot.js` and exposes a small Express webhook; the bot usually runs separately from the Next app.
- UI pieces live in `src/components`; pages and API routes use the app-router (`src/app/**`).

Quick commands (project-specific)

- Install: `npm install` (note: `postinstall` runs `prisma generate`).
- Dev server: `npm run dev` (starts Next dev server).
- Build: `npm run build` (runs `prisma generate && next build`).
- Start production: `npm start` (Next production server).
- Run Discord bot locally: `npm run bot` or `node bot.js` (requires Discord env vars).
- Prisma: `npx prisma generate` and to push schema to Mongo: `npx prisma db push`.

Essential files & folders (jump targets)

- `src/app/` — Next.js app router entrypoints and server components (layout, pages).
- `src/components/` — UI components; many are client components (look for `"use client"`).
- `prisma/schema.prisma` — canonical data model (User, Project, Vote, Collectable, Reward, Forum models).
- `bot.js` — Discord bot + Express webhook; used for forum notifications and scheduled-event handling.
- `scripts/` — helper scripts (seeding, deploy helpers). Example: `scripts/deploy-bot.sh` demonstrates Railway deployment.
- `next.config.mjs`, `vercel.json`, `railway.json`, `Procfile` — deployment hints and platform integrations.

Project conventions and patterns

- App router (server-first): `src/app/layout.tsx` is a server component by default. Importing client-only code (hooks, browser APIs) requires the child component to include `"use client"`.
- Path alias: `@/*` maps to `./src/*` (see `tsconfig.json`). Prefer `@/` imports for cross-file references.
- Web3 and auth: project uses `wagmi` / `rainbowkit` and `next-auth` — check `src/components/providers/web3` and the `api/auth/*` routes for auth flows.
- Prisma + Mongo: the schema uses `provider = "mongodb"` — migrations differ from SQL workflows. Use `prisma db push` for schema changes and `prisma generate` to update the client.
- API routes: implemented as file-based route handlers under `src/app/api/*/route.ts` (Next.js Route Handlers). Example: voting route referenced in README at `src/app/api/projects/[projectId]/vote/route.ts`.

Environment & secrets

- Root `.env` holds required variables. Key env names (used widely):
  - `DATABASE_URL` (MongoDB connection)
  - `DISCORD_BOT_TOKEN`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_GENERAL_CHANNEL_ID`
  - `NEXTAUTH_SECRET`
  - `BOT_PORT` / `BOT_WEBHOOK_URL` / `WEBHOOK_SECRET`
- When running locally, ensure `DATABASE_URL` is reachable and `0.0.0.0/0` is allowed on Atlas if testing quickly (README notes this).

Discord bot specifics

- `bot.js` is an independent Node process. It logs guilds on ready and exposes `/webhook/forum-activity` to accept forum events.
- To run locally: set `DISCORD_BOT_TOKEN` and `DISCORD_GENERAL_CHANNEL_ID`, then `npm run bot`.
- Health endpoint: `GET /health` returns bot readiness.

Testing / CI notes

- There are no test scripts in `package.json` — add tests under `src/__tests__` if needed and wire with a small `test` script.
- Linting uses `next lint` (already in `package.json`).

Small examples to follow

- Client component rule: If you use hooks like `useAccount` or browser APIs (Audio, localStorage), add `"use client"` at the top of the file (see `src/components/navbar.tsx`).
- Server-side route: put route handlers at `src/app/api/.../route.ts` and return Response or Next.js JSON responses (see bot webhook and voting route references).
- DB change flow: edit `prisma/schema.prisma` → `npx prisma generate` → `npx prisma db push` → update any seed scripts under `scripts/`.

If unsure where to edit

- Search for the feature by domain model name in `prisma/schema.prisma` (User/Project/Vote) and then look for matching API routes under `src/app/api` and usages in `src/components`.

When you finish a change

- Run `npm run dev` locally to smoke-check the UI.
- If you change DB schema, run `npx prisma generate` and `npx prisma db push` and run any seed scripts if required.

Feedback

If anything here is unclear or you want more examples (routing, auth flows, or bot deployment steps), tell me which part and I will expand with file-level pointers or small code examples.
