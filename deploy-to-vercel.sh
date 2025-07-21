#!/bin/bash

# Deploy to Vercel using CLI
echo "Deploying to Vercel..."

# Install Vercel CLI if not present
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm i -g vercel
fi

# Deploy to production
echo "Starting production deployment..."
vercel --prod

echo "Deployment complete!"