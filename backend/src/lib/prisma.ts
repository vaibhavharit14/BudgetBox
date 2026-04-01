import { PrismaClient } from '@prisma/client';

function getSanitizedUrl() {
  let url = process.env.DATABASE_URL || "";
  if (!url) return url;

  url = url.trim();
  if (url.startsWith('"') && url.endsWith('"')) {
    url = url.substring(1, url.length - 1);
  }

  // Add standard connection parameters for Cloud DBs
  if (!url.includes('connect_timeout')) {
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}connect_timeout=60&pool_timeout=60`;
  }
  
  // Render Postgres ALWAYS works better with sslmode=require
  if (!url.includes('sslmode=') && !url.includes('ssl=')) {
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}sslmode=require`;
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