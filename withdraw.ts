import { VercelRequest, VercelResponse } from "@vercel/node";
import { storage } from "../../storage";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "POST") return res.status(405).end();

  const { amount } = req.body;
  const user = await storage.withdraw(Number(amount));
  res.json(user);
}
