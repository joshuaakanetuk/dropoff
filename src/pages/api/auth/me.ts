import type { NextApiRequest, NextApiResponse } from "next";
import { getSessionUser } from "@/lib/api-helpers";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end();
  }

  const user = await getSessionUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  return res.json(user);
}
