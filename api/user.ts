import type { VercelRequest, VercelResponse } from "@vercel/node";
import { storage } from "../server/storage";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method === "GET") {
    const user = await storage.getUser();
    return res.status(200).json(user);
  }

  res.status(405).json({ message: "Method not allowed" });
}
