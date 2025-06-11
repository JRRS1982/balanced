import { PrismaClient } from '@prisma/client';
// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Handle Prisma initialization during build time
function getPrismaClient() {
  try {
    // Check if we're in a build environment (Next.js sets this during build)
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

    if (isBuildTime) {
      // During build time, return an empty mock to avoid DB connections
      // This will prevent Next.js from trying to access the DB during build
      console.log('Using mock Prisma client during build');

      // Create a mock PrismaClient that won't connect to the database
      return new Proxy({} as PrismaClient, {
        get: (target, prop) => {
          if (prop === 'then') {
            return undefined; // This prevents await from failing
          }
          return () => {
            console.log(`Mock Prisma client called: ${String(prop)}`);
            return Promise.resolve([]);
          };
        },
      });
    }

    // For normal operation, use the regular Prisma client
    if (!global.prisma) {
      global.prisma = new PrismaClient();
    }
    return global.prisma;
  } catch (error) {
    console.error('Error initializing Prisma client:', error);
    // Fallback to empty client if there's an error
    return new Proxy({} as PrismaClient, {
      get: () => () => Promise.resolve([]),
    });
  }
}

const prisma = getPrismaClient();

export default prisma;
