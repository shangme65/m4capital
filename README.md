---
title: M4Capital - Trading Platform
emoji: 💰
colorFrom: orange
colorTo: red
sdk: docker
pinned: false
app_port: 3000
header: mini
short_description: A comprehensive cryptocurrency trading platform built with Next.js
tags:
  - finance
  - trading
  - cryptocurrency
  - nextjs
  - react
  - typescript
---

# M4Capital - Trading Platform

A comprehensive cryptocurrency trading platform built with Next.js, featuring real-time trading operations, portfolio management, and transaction tracking.

## Features

- **Portfolio Management**: Track your cryptocurrency investments
- **Trading Operations**: Buy, Sell, Withdraw, Transfer, and Convert cryptocurrencies
- **Real-time Notifications**: Stay updated with transaction status
- **Secure Authentication**: Email/password authentication with NextAuth.js
- **Transaction History**: Complete audit trail of all operations
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **3D Graphics**: react-three-fiber
- **Animations**: Framer Motion

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your database and environment variables
4. Run database migrations: `npx prisma migrate dev`
5. Seed the database: `npm run seed`
6. Start the development server: `npm run dev`

## Environment Variables

Create a `.env` file with:

```
DATABASE_URL="your_postgresql_connection_string"
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"
```

## Live Demo

This application is deployed on Hugging Face Spaces and demonstrates a full-featured cryptocurrency trading platform.

## Contributing

Feel free to contribute to this project by submitting issues or pull requests.

## License

MIT License
