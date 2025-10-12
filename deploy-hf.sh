#!/bin/bash

# Deployment script for Hugging Face Spaces

echo "🚀 Preparing M4Capital for Hugging Face Spaces deployment..."

# Copy SQLite schema for deployment
echo "📋 Setting up SQLite schema..."
cp prisma/schema.sqlite.prisma prisma/schema.prisma

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client for SQLite
echo "🔧 Generating Prisma client..."
npx prisma generate

# Create and migrate SQLite database
echo "🗄️ Setting up database..."
npx prisma migrate dev --name init

# Seed the database
echo "🌱 Seeding database..."
npm run seed

# Build the application
echo "🏗️ Building application..."
npm run build

echo "✅ Ready for Hugging Face Spaces!"
echo "📝 Don't forget to:"
echo "   1. Create a new Space at https://huggingface.co/new-space"
echo "   2. Select 'Docker' as the SDK"
echo "   3. Upload all files except node_modules and .next"
echo "   4. The README.md already contains the proper configuration"