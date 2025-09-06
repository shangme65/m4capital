#!/bin/bash

# A script to set up the m4capital project

echo "--- Starting m4capital setup ---"

# Step 1: Install dependencies
echo "--- Installing dependencies... ---"
npm install

# Step 2: Set up environment variables
if [ ! -f .env ]; then
    echo "--- Creating .env file... ---"
    cp .env.example .env
    
    # Generate NEXTAUTH_SECRET
    SECRET=$(openssl rand -base64 32)
    
    # Use sed to update .env file
    # Note: The commands below are for GNU sed. On macOS, you might need to use `sed -i ''`.
    sed -i'.bak' "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=${SECRET}|" .env
    sed -i'.bak' 's|NEXTAUTH_URL=.*|NEXTAUTH_URL="http://localhost:3000"|' .env
    rm .env.bak

    echo "!!! ACTION REQUIRED: Please edit the .env file and add your DATABASE_URL !!!"
else
    echo "--- .env file already exists. Skipping creation. ---"
fi

read -p "Have you updated DATABASE_URL in the .env file? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    # Step 3: Run database migrations
    echo "--- Running database migrations... ---"
    npx prisma migrate dev --name init

    # Step 4: Seed the database
    echo "--- Seeding the database... ---"
    npm run seed

    echo "--- Setup complete! ---"
    echo "--- You can now run 'npm run dev' to start the server. ---"
else
    echo "--- Please update the DATABASE_URL in .env and run the migration/seed commands manually. ---"
    echo "1. npx prisma migrate dev --name init"
    echo "2. npm run seed"
fi