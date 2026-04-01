import { PrismaClient } from '@prisma/client';

function getSanitizedUrl() {
  let url = process.env.DATABASE_URL || "";
  if (!url) return url;

  url = url.trim();
  if (url.startsWith('"') && url.endsWith('"')) {
    url = url.substring(1, url.length - 1);
  }

  // Force postgresql protocol if postgres is used
  if (url.startsWith('postgres://')) {
    url = 'postgresql://' + url.substring(11);
  }

  // Final robust connection parameters for Render internal routing
  const separator = url.includes('?') ? '&' : '?';
  
  if (!url.includes('connect_timeout')) {
    url = `${url}${separator}connect_timeout=60`;
  }
  
  // Adding pgbouncer and directConnection for pooled setups common on Render
  if (!url.includes('pgbouncer')) {
    const nextSep = url.includes('?') ? '&' : '?';
    url = `${url}${nextSep}pgbouncer=true`;
  }

  // Most reliable SSL setting for Render Free Tier DBs
  if (!url.includes('sslmode=') && !url.includes('ssl=')) {
    const nextSep = url.includes('?') ? '&' : '?';
    url = `${url}${nextSep}sslmode=no-verify`;
  }
  
  return url;
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: getSanitizedUrl(),
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

export default prisma;