import { Router } from "express";
import prisma from "../lib/prisma";
import { verifyToken, AuthRequest } from "../middleware/verifyToken";
import { z } from "zod";

const router = Router();

// Validation schema
const budgetSchema = z.object({
  income: z.string(),
  monthly_bills: z.string(),
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

    // Check if budget exists
    const existingBudget = await prisma.budget.findFirst({
      where: { userId },
    });

    let budget;
    if (existingBudget) {
      // Update existing budget
      budget = await prisma.budget.update({
        where: { id: existingBudget.id },
        data: {
          income: parsed.data.income,
          monthly_bills: parsed.data.monthly_bills,
          food: parsed.data.food,
          transport: parsed.data.transport,
          subscriptions: parsed.data.subscriptions,
          misc: parsed.data.misc,
          description: parsed.data.description,
        },
      });
    } else {
      // Create new budget
      budget = await prisma.budget.create({
        data: {
          userId,
          income: parsed.data.income,
          monthly_bills: parsed.data.monthly_bills,
          food: parsed.data.food,
          transport: parsed.data.transport,
          subscriptions: parsed.data.subscriptions,
          misc: parsed.data.misc,
          description: parsed.data.description,
        },
      });
    }

    return res.json({ success: true, message: "Budget synced successfully", budget });
  } catch (error: any) {
    console.error("❌ Sync budget error:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });
    
    // Check for common Prisma errors
    if (error.code === 'P2002') {
      return res.status(409).json({ 
        success: false, 
        message: "Budget already exists for this user. Please update instead." 
      });
    }
    
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        message: "Budget not found" 
      });
    }
    
    // Database schema mismatch error
    if (error.message?.includes('Unknown column') || 
        error.message?.includes('column') && error.message?.includes('does not exist')) {
      return res.status(500).json({ 
        success: false, 
        message: "Database schema mismatch. Please run: cd backend && node fix-database.js",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: "Failed to sync budget",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
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
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });
    
    // Database schema mismatch error
    if (error.message?.includes('Unknown column') || 
        error.message?.includes('column') && error.message?.includes('does not exist')) {
      return res.status(500).json({ 
        success: false, 
        message: "Database schema mismatch. Please run: cd backend && node fix-database.js",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: "Failed to fetch latest budget",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

export default router;