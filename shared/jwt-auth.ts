
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { SharedAuthService } from "./auth-service";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    membershipLevel: string;
    profileImageUrl?: string;
  };
}

// 生成 JWT Token
export function generateToken(user: { id: string; email: string }): string {
  return jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// 驗證 JWT Token
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

// 認證中間件
export function requireSharedAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.cookies?.auth_token;

  if (!token) {
    return res.status(401).json({ error: "未提供認證 token" });
  }

  try {
    const decoded = verifyToken(token);
    
    // 將用戶資訊附加到請求
    SharedAuthService.getUserById(decoded.userId).then(user => {
      if (!user) {
        return res.status(401).json({ error: "用戶不存在" });
      }

      req.user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        membershipLevel: user.membershipLevel,
        profileImageUrl: user.profileImageUrl || undefined,
      };

      next();
    }).catch(error => {
      console.error("認證錯誤:", error);
      return res.status(401).json({ error: "認證失敗" });
    });

  } catch (error) {
    console.error("Token 驗證失敗:", error);
    return res.status(401).json({ error: "無效的 token" });
  }
}

// 檢查會員等級中間件
export function requireMembership(level: "free" | "pro") {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "未認證" });
    }

    if (level === "pro" && req.user.membershipLevel !== "pro") {
      return res.status(403).json({ error: "需要 Pro 會員資格" });
    }

    next();
  };
}
