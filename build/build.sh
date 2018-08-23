#!/bin/sh
echo "Installing dependencies..."
npm install

echo "Running tests..."
chmod -r 500:501 node_modules
npm run test

echo "Running webpack..."
npm run build

echo "Zipping files to be deployed..."
zip artifact.zip index.js

echo "Build successful"
