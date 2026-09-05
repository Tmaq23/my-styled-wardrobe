import { Prisma } from '@prisma/client';

import prisma from '@/lib/prisma';

const CONNECTION_ERROR_CODES = new Set(['P1000', 'P1001', 'P1002', 'P1003', 'P1008', 'P1010', 'P1017']);
const CONNECTION_ERROR_PATTERNS = [
  /tenant or user not found/i,
  /tenant\/user .* not found/i,
  /ECONNREFUSED/i,
  /ENOTFOUND/i,
  /ETIMEDOUT/i,
  /Can't reach database server/i,
  /Connection terminated/i,
  /Timed out fetching a new connection/i,
  /Server has closed the connection/i,
];

/**
 * True when an error means the database itself is unreachable (paused project,
 * bad connection string, network) rather than a normal query failure.
 */
export function isDatabaseUnavailableError(error: unknown): boolean {
  if (!error) return false;

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && CONNECTION_ERROR_CODES.has(error.code)) {
    return true;
  }

  const message = error instanceof Error ? error.message : String(error);
  return CONNECTION_ERROR_PATTERNS.some((pattern) => pattern.test(message));
}

export const DATABASE_UNAVAILABLE_MESSAGE =
  'Our database is temporarily unavailable. Please try again in a few minutes.';

export interface DatabaseHealth {
  ok: boolean;
  latencyMs: number | null;
  error?: string;
}

export async function checkDatabaseConnection(timeoutMs = 5000): Promise<DatabaseHealth> {
  const started = Date.now();
  let timer: NodeJS.Timeout | undefined;

  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('Database health check timed out')), timeoutMs);
      }),
    ]);

    return { ok: true, latencyMs: Date.now() - started };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // Prisma prefixes errors with "Invalid `prisma.$queryRaw()` invocation:"; the
    // useful cause is on the last non-empty line.
    const lines = message.split('\n').map((line) => line.trim()).filter(Boolean);
    const cause = lines[lines.length - 1] ?? message;
    return { ok: false, latencyMs: null, error: cause.slice(0, 300) };
  } finally {
    if (timer) clearTimeout(timer);
  }
}
