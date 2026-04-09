#!/bin/bash
# Build frontend directly from lunchOrderFrontend repo

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BUILD_DIR="$PROJECT_ROOT/public/build"

echo "Cloning lunchOrderFrontend..."
cd /tmp
rm -rf lunchOrderFrontend 2>/dev/null || true
git clone --depth 1 https://github.com/ChrisLinOvO/lunchOrderFrontend.git

echo "Installing dependencies..."
cd lunchOrderFrontend
npm install --force

echo "Building..."
npm run build

echo "Copying build files to public/build..."
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"
cp -r build/* "$BUILD_DIR/"

echo "Cleanup..."
rm -rf /tmp/lunchOrderFrontend

echo "Frontend build complete!"
