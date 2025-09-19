# M4Capital AI Agent Instructions

Welcome, agent! This guide provides the essential knowledge to be productive in the M4Capital codebase.

## 1. The Big Picture: Architecture & Stack

This is a full-stack application built on the T3 stack principles, but with some key differences.

- **Framework**: Next.js 14 (App Router) with TypeScript.
- **Database**: PostgreSQL managed by Prisma ORM. The schema is the source of truth for our data models (`prisma/schema.prisma`).
- **Authentication**: NextAuth.js is used for authentication, configured with a `CredentialsProvider` for email/password logins. The core configuration is in `src/lib/auth.ts`.
- **Styling**: Tailwind CSS is used for styling. Global styles are in `src/app/globals.css`.
- **3D Graphics**: We use `react-three-fiber` for 3D visualizations. Note the custom webpack config in `next.config.mjs` for handling `.glsl` shader files.

## 2. Getting Started: Developer Workflow

The primary setup and development workflow is captured in `setup.sh`.

1.  **Installation**: Run `npm install` to install all dependencies.
2.  **Environment**: The script creates a `.env` file from `.env.example`. **You must manually add your `DATABASE_URL` for a PostgreSQL database.**
3.  **Database Migration**: Run `npx prisma migrate dev` to apply schema changes to your database.
4.  **Database Seeding**: Run `npm run seed` to populate the database with initial data. The seed script is `prisma/seed.ts`.
5.  **Run Dev Server**: Use `npm run dev` to start the Next.js development server.

## 3. Key Codebase Patterns & Conventions

### Authentication and Authorization

- **Credentials-based**: We use email and password, not OAuth providers. The authorization logic is in `src/lib/auth.ts` within the `CredentialsProvider`.
- **User Roles**: The `User` model in `prisma/schema.prisma` has a `role` field. This is critical for authorization logic. When extending user functionality, ensure you check this role.
- **Signup**: New users are created via the API endpoint at `src/app/api/auth/signup/route.ts`, which hashes the password using `bcrypt`.

### Database and Prisma

- **Schema First**: Always modify `prisma/schema.prisma` to change data models.
- **Migrations**: After changing the schema, create a new migration by running `npx prisma migrate dev --name <migration-name>`.
- **Prisma Client**: The Prisma client is instantiated in `src/lib/prisma.ts` and should be imported from there in any backend service or API route.

### API Routes

- API endpoints follow the Next.js App Router convention and are located in `src/app/api/`.
- For example, the logic to update a user by an admin is at `src/app/api/admin/update-user/route.ts`.

### Frontend and UI

- **Component Structure**: Components are organized into `client` (interactive, client-side rendered) and `layout` (structural) folders within `src/components`.
- **3D Scenes**: The `src/components/client/ThreeScene.tsx` is the entry point for our `react-three-fiber` 3D graphics. Any work on 3D visualizations will likely involve this component and its children.
- **Routing**: The app uses the Next.js App Router. Pages are defined by `page.tsx` files within the `src/app` directory. Route groups like `(auth)` and `(dashboard)` are used to organize routes and share layouts.
