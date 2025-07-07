#!/bin/bash

COMMIT_HASH=$1
COMMIT_MSG=$2
BUILD_DIR="builds/build-$COMMIT_HASH"

echo "🏥 [MEDICAL BUILD] Starting comprehensive medical app build..."

npm install

echo "🧪 [TESTING] Running medical module tests..."
if ! npm run test:medical-modules; then
    echo "❌ [FAILED] Medical module tests failed - aborting build"
    exit 1
fi

echo "⚡ [BUILD] Building Next.js application..."
if ! npm run build; then
    echo "❌ [FAILED] Application build failed"
    exit 1
fi

echo "🔍 [VALIDATION] Running pre-launch health checks..."
if ! node scripts/pre-launch-check.js; then
    echo "❌ [FAILED] Health validation failed - unsafe to deploy"
    exit 1
fi

echo "🚀 [DEPLOY] All validations passed, deploying to production..."
./scripts/deploy-validated-build.sh "$BUILD_DIR"
