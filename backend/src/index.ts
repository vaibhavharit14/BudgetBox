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

const allowedOrigins = [
  "https://budget-box-8ssa-bbac7rk07-vaibhavharit14s-projects.vercel.app",
  "https://budget-box-8ssa.vercel.app",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
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
    console.error(error);
  }
}

app.get("/health", (_req: Request, res: Response) => {
  res.json({ success: true, status: "ok", timestamp: new Date().toISOString() });
});

app.use("/auth", authRoutes);
app.use("/budget", budgetRoutes);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({ success: false, message: "Unexpected server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
  await ensureDemoUser();
});