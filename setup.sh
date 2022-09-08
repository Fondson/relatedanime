#!/usr/bin/env bash

echo "Copying env vars..."
cp server/.env.example server/.env
cp next-frontend/.env.example next-frontend/.env.local

echo "Installing dependencies..."
yarn install --ignore-platform # for compatibility betweem local and docker platforms

echo "Done! 🚀"
echo "Run 'yarn dev' to get started!"
