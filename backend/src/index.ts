import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import budgetRoutes from "./routes/budget";
import prisma from "./lib/prisma";
import bcrypt from "bcrypt";

if (!process.env.JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET is not defined in environment variables. Login will fail.");
}

const app = express();
app.use(express.json());

const allowedOrigins = [
  "https://budget-box-8ssa.vercel.app",
  "http://localhost:3000",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

async function ensureDemoUser() {
  const DEMO_EMAIL = process.env.DEMO_EMAIL ?? "hire-me@anshumat.org";
  const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? "HireMe@2025!";
  try {
    const existing = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
    if (!existing) {
      const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
      await prisma.user.create({ data: { email: DEMO_EMAIL, password: hashedPassword } });
    }
  } catch (error) {
    console.error("Demo user sync failed:", error);
  }
}

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "BudgetBox API is running" });
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({ success: true, status: "ok", timestamp: new Date().toISOString() });
});

app.get("/health/db", async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ success: true, status: "ok" });
  } catch (error: any) {
    console.error("DB health check failed:", error);
    res.status(500).json({ success: false, message: "DB unreachable", detail: error?.message });
  }
});

app.use("/auth", authRoutes);
app.use("/budget", budgetRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Unexpected server error" });
});

const PORT = process.env.PORT || 4000;

async function start() {
  const maxRetries = 5;
  for (let i = 1; i <= maxRetries; i++) {
    try {
      await prisma.$connect();
      console.log("✅ Database connected successfully.");
      await ensureDemoUser();
      app.listen(PORT, () => {
        console.log(`🚀 Server listening on port ${PORT}`);
      });
      return;
    } catch (error: any) {
      console.error(`⚠️  Database connection attempt ${i} failed:`, error.message);
      if (i === maxRetries) {
        console.error("❌ Failed to start server after multiple attempts.");
        process.exit(1);
      }
      const delay = 5000 * i;
      console.log(`⏳ Waiting ${delay/1000}s before next retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

start();