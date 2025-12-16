import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  user?: string | JwtPayload;
}

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers["authorization"] as string | undefined;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No authorization header provided."
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = decoded;

    return next();
  } catch (error) {
    console.error("❌ JWT verification failed:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
}