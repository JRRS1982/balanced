#!/bin/sh
set -e

# Prevent commit to master/main branch
echo "Checking branch..."
branch="$(git rev-parse --abbrev-ref HEAD)"
if [ "$branch" = "master" ] || [ "$branch" = "main" ]; then
  echo "❌ Direct commits to $branch branch are not allowed. Please use a feature branch instead."
  exit 1
fi
echo "✅ Branch check passed."

# Get list of staged files before any changes
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)

# Run Next.js TypeScript type checking locally
echo "🔍 Checking TypeScript types..."
npm run typecheck
echo "✅ TypeScript type checking passed."

# Run linting locally
echo "🧹 Running linters..."
npm run lint
echo "✅ Linters passed."

# Run formatting locally
echo "🧹 Running formatter..."
npm run format

# Stage any changes made by the formatter
echo "Staging changes made by formatters..."
# Stage changes to already staged files
if [ -n "$STAGED_FILES" ]; then
  echo "$STAGED_FILES" | xargs git add -- 2>/dev/null || true
fi
# Also stage any modified CSS/JS/TS files that weren't staged before
FILES_TO_ADD=$(git diff --name-only --diff-filter=ACM | grep -E '\.(js|jsx|ts|tsx|css|md)$' || true)
if [ -n "$FILES_TO_ADD" ]; then
  echo "$FILES_TO_ADD" | xargs git add -- 2>/dev/null || true
fi
echo "✅ Formatter passed."

# Run tests locally
echo "🧪 Running tests..."
npm run test
echo "✅ Tests passed."

echo "✅ Commit validated successfully!"