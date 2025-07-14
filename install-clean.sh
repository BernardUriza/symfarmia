#!/bin/bash

# Kill all node processes
pkill -f node || true

# Remove problematic directories
rm -rf node_modules
rm -rf package-lock.json
rm -rf .next
rm -rf netlify/functions/node_modules

# Clean npm cache
npm cache clean --force || true

# Install with no optional dependencies
npm install --no-optional --legacy-peer-deps

echo "✅ Clean install complete"