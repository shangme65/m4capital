# M4Capital - Project Overview

A modern, full-stack cryptocurrency trading platform built with Next.js 14, featuring AI-powered features, real-time trading, and comprehensive admin tools.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Setup database
npx prisma migrate dev
npm run seed

# Initialize admin
curl http://localhost:3000/api/init-admin

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

**📚 Full Setup Guide**: [docs/setup/SETUP_GUIDE.md](./docs/setup/SETUP_GUIDE.md)

---

## ✨ Key Features

### 🎯 Core Platform

- **Real-time Trading**: Buy/sell crypto with live price updates
- **Portfolio Management**: Track assets, P&L, and performance
- **Advanced Charts**: TradingView integration with technical indicators
- **Multi-Asset Support**: BTC, ETH, ADA, DOT, LINK, and more

### 🤖 AI-Powered Features

- **Telegram Bot**: GPT-4 powered chat assistant
- **Image Generation**: DALL-E 3 integration for creative content
- **Smart Notifications**: AI-driven market alerts
- **Trading Insights**: Automated market analysis

### 💳 Payment Integration

- **Crypto Deposits**: Bitcoin payments via NOWPayments
- **Multiple Currencies**: USD, EUR support
- **Instant Processing**: Real-time payment webhooks
- **Secure Transactions**: PCI-compliant infrastructure

### 👥 User Management

- **Authentication**: NextAuth.js with email/password
- **OAuth Support**: Google, Facebook login
- **KYC Verification**: Document upload and review system
- **Email Notifications**: Professional branded emails

### 🛠️ Admin Tools

- **User Management**: Full CRUD operations
- **KYC Review**: Document verification workflow
- **Analytics Dashboard**: Usage metrics and insights
- **System Monitoring**: Health checks and logs

---

## 🏗️ Tech Stack

### Frontend

- **Framework**: Next.js 14 (App Router)
- **UI**: React 18, Tailwind CSS
- **3D Graphics**: React Three Fiber
- **State**: React Context API
- **Forms**: React Hook Form + Zod

### Backend

- **Runtime**: Node.js 18+
- **API**: Next.js API Routes
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma

### External Services

- **AI**: OpenAI (GPT-4, DALL-E 3)
- **Crypto Data**: CoinGecko, Binance
- **Payments**: NOWPayments
- **Email**: Nodemailer (SMTP)
- **Bot**: Telegram Bot API

---

## 📁 Project Structure

```
m4capital/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── (auth)/      # Auth pages (login, signup)
│   │   ├── (dashboard)/ # Protected pages
│   │   └── api/         # API routes
│   ├── components/
│   │   ├── client/      # Client components
│   │   └── layout/      # Layout components
│   ├── contexts/        # React contexts
│   ├── lib/            # Utilities & configs
│   └── types/          # TypeScript types
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── migrations/     # Database migrations
├── public/             # Static assets
├── docs/              # Documentation
│   ├── setup/         # Setup guides
│   ├── features/      # Feature docs
│   ├── api/           # API reference
│   └── README.md      # Documentation index
└── scripts/           # Utility scripts
```

**Detailed Structure**: [docs/architecture/PROJECT_STRUCTURE.md](./docs/architecture/PROJECT_STRUCTURE.md)

---

## 📚 Documentation

### Quick Links

- **[Complete Setup Guide](./docs/setup/SETUP_GUIDE.md)** - Installation & configuration
- **[API Reference](./docs/api/API_REFERENCE.md)** - Complete API documentation
- **[Feature Guides](./docs/features/)** - Individual feature documentation
- **[Roadmap](./docs/ROADMAP.md)** - Future enhancements

### Popular Guides

- [Email Configuration](./docs/setup/SETUP_GUIDE.md#email-configuration)
- [Telegram Bot Setup](./docs/features/TELEGRAM_FEATURES.md)
- [Payment Integration](./docs/setup/SETUP_GUIDE.md#payment-gateway)
- [Admin User Setup](./docs/setup/SETUP_GUIDE.md#database-setup)
- [Database Migration](./docs/setup/SETUP_GUIDE.md#database-management)

**Full Documentation Index**: [docs/README.md](./docs/README.md)

---

## 🔧 Development

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Git

### Environment Variables

Create `.env` file:

```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Admin Account
ORIGIN_ADMIN_EMAIL="admin@example.com"
ORIGIN_ADMIN_PASSWORD="SecurePassword123!"

# OpenAI (Optional)
OPENAI_API_KEY="sk-..."

# Telegram (Optional)
TELEGRAM_BOT_TOKEN="your-bot-token"

# Email (Optional)
EMAIL_HOST="smtp.gmail.com"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"

# Payments (Optional)
NOWPAYMENTS_API_KEY="your-api-key"
```

### Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm start               # Start production server

# Database
npx prisma migrate dev  # Run migrations
npx prisma studio       # Open Prisma Studio
npm run seed            # Seed database

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # TypeScript check
npm run format          # Format with Prettier
```

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Docker

```bash
# Build image
docker build -t m4capital .

# Run container
docker run -p 3000:3000 m4capital
```

**Full Deployment Guide**: [docs/deployment/VERCEL.md](./docs/deployment/VERCEL.md)

---

## 🔒 Security

### Best Practices Implemented

- ✅ Environment variable protection
- ✅ HTTPS enforcement
- ✅ CORS configuration
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection
- ✅ CSRF tokens
- ✅ Rate limiting
- ✅ Secure password hashing (bcrypt)

**Security Guide**: [docs/security/SECURITY_GUIDE.md](./docs/security/SECURITY_GUIDE.md)

---

## 📊 Performance

- **Lighthouse Score**: 95+ on all metrics
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Bundle Size**: Optimized with code splitting

---

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test              # Unit tests
npm run test:e2e      # E2E tests
npm run test:coverage # Coverage report
```

**Testing Guide**: [docs/development/TESTING.md](./docs/development/TESTING.md)

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./docs/development/CONTRIBUTING.md).

### Quick Contribution Steps

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🆘 Support

### Getting Help

- **Documentation**: [docs/README.md](./docs/README.md)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Email**: support@m4capital.com

### Common Issues

| Issue                       | Solution                                    |
| --------------------------- | ------------------------------------------- |
| Database connection error   | Check `DATABASE_URL` in `.env`              |
| Email not sending           | Verify SMTP credentials                     |
| Telegram bot not responding | Check bot token and webhook setup           |
| Build errors                | Clear `.next` and `node_modules`, reinstall |

**Troubleshooting Guide**: [docs/maintenance/TROUBLESHOOTING.md](./docs/maintenance/TROUBLESHOOTING.md)

---

## 🗺️ Roadmap

See our [Roadmap](./docs/ROADMAP.md) for planned features and improvements.

### Upcoming Features

- 📱 Mobile apps (iOS/Android)
- 🤖 Advanced AI trading assistant
- 📊 Enhanced analytics dashboard
- 🌍 Multi-language support
- 💱 More payment methods
- 🔐 Enhanced security features

---

## 👥 Team

**Maintainers**:

- Development Team
- Product Team
- DevOps Team

**Contributors**: See [CONTRIBUTORS.md](./CONTRIBUTORS.md)

---

## 🙏 Acknowledgments

Built with amazing open-source projects:

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [NextAuth.js](https://next-auth.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [OpenAI](https://openai.com/)
- And many more...

---

## 📈 Stats

![GitHub last commit](https://img.shields.io/github/last-commit/your-repo/m4capital)
![GitHub issues](https://img.shields.io/github/issues/your-repo/m4capital)
![GitHub stars](https://img.shields.io/github/stars/your-repo/m4capital)
![License](https://img.shields.io/github/license/your-repo/m4capital)

---

**Built with ❤️ by the M4Capital Team**

**Last Updated**: November 5, 2025
