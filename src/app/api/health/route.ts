import { NextResponse } from 'next/server';

/**
 * Health check endpoint
 * This endpoint is used by the docker service o check the health of the application.
 * @returns {Promise<NextResponse>} JSON response with health check information
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    },
    { status: 200 }
  );
}
