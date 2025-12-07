import { Router } from "express";
import prisma from "../lib/prisma";
import { verifyToken, AuthRequest } from "../middleware/verifyToken";
import { z } from "zod";

const router = Router();

// Validation schema
const budgetSchema = z.object({
  income: z.string(),
  monthlyBills: z.string(),
  food: z.string(),
  transport: z.string(),
  subscriptions: z.string(),
  misc: z.string(),
  description: z.string(),
});

// Sync budget (upsert)
router.post("/sync", verifyToken, async (req: AuthRequest, res) => {
  try {
    const parsed = budgetSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: parsed.error.issues.map((i) => i.message),
      });
    }

    const userId = (req.user as any).id;

    const existingBudget = await prisma.budget.findFirst({ where: { userId } });

    const budget = existingBudget
      ? await prisma.budget.update({
          where: { id: existingBudget.id },
          data: parsed.data,
        })
      : await prisma.budget.create({
          data: { userId, ...parsed.data },
        });

    return res.json({ success: true, message: "Budget synced successfully", budget });
  } catch (error: any) {
    console.error("❌ Sync budget error:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Budget already exists for this user. Please update instead.",
      });
    }

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to sync budget",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Get latest budget
router.get("/latest", verifyToken, async (req: AuthRequest, res) => {
  try {
    const userId = (req.user as any).id;

    const budget = await prisma.budget.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!budget) {
      return res.status(404).json({ success: false, message: "No budget found" });
    }

    return res.json({ success: true, budget });
  } catch (error: any) {
    console.error("❌ Get latest budget error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch latest budget",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

export default router;