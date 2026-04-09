#!/bin/bash
# Build script for frontend submodule
# Run this after git submodule update --init --recursive

set -e

FRONTEND_DIR="public/build"

if [ !d "$FRONTEND_DIR" ]; then
    echo "Frontend directory not found. Run: git submodule update --init --recursive"
    exit 1
fi

echo "Installing frontend dependencies..."
cd "$FRONTEND_DIR"
npm install --legacy-peer-deps

echo "Building frontend..."
npm run build

echo "Moving build files to root..."
cd ..
mv build/* . 2>/dev/null || true
rm -rf build

echo "Frontend build complete!"
