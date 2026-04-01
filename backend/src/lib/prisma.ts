import { PrismaClient } from '@prisma/client';

function getSanitizedUrl() {
  let url = process.env.DATABASE_URL || "";
  if (!url) return url;

  url = url.trim();
  // Remove quotes if present
  if (url.startsWith('"') && url.endsWith('"')) {
    url = url.substring(1, url.length - 1);
  }

  // Add only essential timeout to handle cold starts
  if (!url.includes('connect_timeout')) {
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}connect_timeout=60`;
  }
  
  // Note: We removed explicit 'sslmode=require' to let Render's 
  // internal networking handle the encryption as per its own config.
  
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