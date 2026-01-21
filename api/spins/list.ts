import { VercelRequest, VercelResponse } from "@vercel/node";
import { storage } from "../../storage";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "GET") return res.status(405).end();

  const history = await storage.getSpins();
  res.json(history);
}
