import { PrismaClient } from '@prisma/client';

function getSanitizedUrl() {
  let url = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.DB_URL || "";
  if (!url) {
    console.warn("⚠️  DATABASE_URL or equivalent not found in Environment Variables.");
    return "";
  }

  url = url.trim();
  if (url.startsWith('"') && url.endsWith('"')) {
    url = url.substring(1, url.length - 1);
  }

  // Force postgresql protocol if postgres is used
  if (url.startsWith('postgres://')) {
    url = 'postgresql://' + url.substring(11);
  }

  const separator = url.includes('?') ? '&' : '?';
  
  if (!url.includes('connect_timeout')) {
    url = `${url}${separator}connect_timeout=60`;
  }
  
  // For Internal URLs on Render, sslmode=require can sometimes be too strict.
  // We'll use 'prefer' which works for both internal and external securely.
  if (!url.includes('sslmode=') && !url.includes('ssl=')) {
    const nextSep = url.includes('?') ? '&' : '?';
    url = `${url}${nextSep}sslmode=prefer`;
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