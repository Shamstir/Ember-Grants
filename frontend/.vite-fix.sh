#!/bin/bash

echo "🔧 Fixing Vite/Lucide-React issue..."

# Kill any running vite processes
pkill -f vite || true

# Clean everything
rm -rf node_modules
rm -rf .vite
rm -rf dist
rm -rf node_modules/.cache

# Clear npm cache
npm cache clean --force

# Reinstall with clean slate
npm install

echo "✅ Cleanup complete!"
echo "Now run: npm run dev"
