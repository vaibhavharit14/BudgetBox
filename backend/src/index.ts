import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import budgetRoutes from "./routes/budget";
import prisma from "./lib/prisma";
import bcrypt from "bcrypt";

dotenv.config();

const app = express();
app.use(express.json());

// ✅ Allowed origins with explicit type
const allowedOrigins: string[] = [
  "https://budget-box-8ssa.versal.app",
  "https://budget-box-8ssa-bbac7rk07-vaibhavharit14s-projects.vercel.app",
  "https://budget-box-8ssa.vercel.app",
  "http://localhost:3000",
  process.env.FRONTEND_URL || ""
].filter(Boolean);

// ✅ CORS middleware with typed parameters
app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return callback(null, true); // allow curl/mobile apps
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.warn(`❌ CORS blocked origin: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// ✅ Demo user provisioning
async function ensureDemoUser() {
  const DEMO_EMAIL = process.env.DEMO_EMAIL ?? "hire-me@anshumat.org";
  const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? "HireMe@2025!";
  try {
    const existing = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
    if (!existing) {
      const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
      await prisma.user.create({ data: { email: DEMO_EMAIL, password: hashedPassword } });
      console.log("✅ Demo user created:", DEMO_EMAIL);
    }
  } catch (error) {
    console.error("⚠️ Demo user error:", error);
  }
}

// ✅ Health routes
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

// ✅ Routes
app.use("/auth", authRoutes);
app.use("/budget", budgetRoutes);

// ✅ Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err.message || err);
  res.status(500).json({ success: false, message: "Unexpected server error" });
});

// ✅ Start server
const PORT = process.env.PORT || 4000;
async function start() {
  try {
    await prisma.$connect();
    await ensureDemoUser();
    app.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
      console.log("✅ Allowed origins:", allowedOrigins);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

start();