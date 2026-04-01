import { PrismaClient } from '@prisma/client';

let url = process.env.DATABASE_URL || "";
if (url && !url.includes('connect_timeout')) {
  const separator = url.includes('?') ? '&' : '?';
  url = `${url}${separator}connect_timeout=30&pool_timeout=30`;
}
if (url && !url.includes('sslmode=') && !url.includes('ssl=')) {
  const separator = url.includes('?') ? '&' : '?';
  url = `${url}${separator}sslmode=no-verify`;
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: url,
    },
  },
});

export default prisma;