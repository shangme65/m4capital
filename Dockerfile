# Use the official Node.js 18 image
FROM node:18-slim

# Install system dependencies required for Next.js and Prisma
RUN apt-get update && \
    apt-get install -y \
      bash \
      git git-lfs \
      wget curl procps \
      htop vim nano \
      openssl \
      ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the Next.js application
RUN npm run build

# Create a non-root user for security
RUN useradd -m -u 1000 user && chown -R user:user /app
USER user

# Expose the port your app runs on
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["npm", "start"]