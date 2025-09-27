# M4Capital

A modern trading platform built with Next.js, TypeScript, and PostgreSQL.

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm

### Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd m4capital
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your database connection and other settings:
   ```bash
   DATABASE_URL="postgresql://username:password@localhost:5432/m4capital?schema=public"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**:
   ```bash
   npx prisma migrate dev
   npm run seed
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Database Configuration

This project uses PostgreSQL with Prisma ORM. The database schema is defined in `prisma/schema.prisma`.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed the database with initial data

## Migration from Supabase

If you're migrating from a previous Supabase setup, see [MIGRATION.md](./MIGRATION.md) for detailed instructions.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **3D Graphics**: React Three Fiber
- **Animation**: Framer Motion