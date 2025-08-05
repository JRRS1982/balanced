# scripts/startup.sh
#!/bin/sh
set -e

echo "🚀 Starting Balanced app..."

# Run database migrations
echo "📊 Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client (in case of schema changes)
echo "🔧 Generating Prisma client..."
npx prisma generate

# Start the application
echo "✅ Starting Next.js server..."
exec npm run start
