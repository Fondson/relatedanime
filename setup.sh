#!/usr/bin/env bash

echo "Copying env vars..."
cp server/.env.example server/.env
cp client/.env.example client/.env

echo "Installing dependencies..."
yarn install

echo "Done! 🚀"
echo "Run 'yarn dev' to get started!"
