import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/*
  In pg-connection-string v3 / pg v9 the SSL modes 'prefer', 'require', and
  'verify-ca' will stop being aliases for 'verify-full' and adopt looser libpq
  semantics. Today pg warns once per process when it sees those modes. The
  fix is to be explicit. We rewrite the connection string so callers don't
  need to update their .env to silence the warning.
*/
function normalizeConnectionString(raw: string | undefined): string | undefined {
  if (!raw) return raw;
  try {
    const url = new URL(raw);
    const sslmode = url.searchParams.get("sslmode");
    if (sslmode && ["prefer", "require", "verify-ca"].includes(sslmode)) {
      url.searchParams.set("sslmode", "verify-full");
    }
    return url.toString();
  } catch {
    return raw;
  }
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createClient() {
  const adapter = new PrismaPg({
    connectionString: normalizeConnectionString(process.env.DATABASE_URL),
  });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
