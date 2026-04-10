import type { NextApiRequest, NextApiResponse } from "next";
import { eq } from "drizzle-orm";
import { auth } from "./auth";
import { fromNodeHeaders } from "better-auth/node";
import { db } from "./db";
import { user as userTable } from "../db/schema";

interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export async function getSessionUser(
  req: NextApiRequest
): Promise<SessionUser | null> {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!session) return null;

  const [user] = await db
    .select({ 
      id: userTable.id,
      name: userTable.name,
      email: userTable.email,
      role: userTable.role,
    })
    .from(userTable)
    .where(eq(userTable.id, session.user.id))
    .limit(1);

  return user ?? null;
}

export async function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<SessionUser | null> {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  return user;
}

export async function requireAdmin(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<SessionUser | null> {
  const user = await requireAuth(req, res);
  if (!user) return null;
  if (user.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return null;
  }
  return user;
}
