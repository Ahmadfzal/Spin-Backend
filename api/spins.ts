import { VercelRequest, VercelResponse } from "@vercel/node";
import { storage } from "../storage";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const input = req.body;

  if (input.result === "Spinning...") {
    await storage.updateUserBalance(
      input.coinDelta || 0,
      input.freeSpinDelta || 0
    );

    const totalSpins = await storage.getTotalSpinCount();
    const currentSpinNumber = totalSpins + 1;

    let targetSegmentIndex = Math.floor(Math.random() * 8);

    const rewards = {
      free1: [10, 20, 30, 40, 50, 60, 70, 90],
      free2: [25, 75],
      jackpot2: [5, 35, 55, 85],
      jackpot3: [45, 73],
      jackpot10: [100],
    };

    if (rewards.free1.includes(currentSpinNumber)) targetSegmentIndex = 0;
    else if (rewards.free2.includes(currentSpinNumber)) targetSegmentIndex = 4;
    else if (rewards.jackpot2.includes(currentSpinNumber)) targetSegmentIndex = 2;
    else if (rewards.jackpot3.includes(currentSpinNumber)) targetSegmentIndex = 6;
    else if (rewards.jackpot10.includes(currentSpinNumber)) targetSegmentIndex = 7;
    else {
      const zonks = [1, 3, 5];
      targetSegmentIndex = zonks[Math.floor(Math.random() * zonks.length)];
    }

    return res.json({ targetSegmentIndex });
  }

  const spin = await storage.createSpin(input);
  await storage.updateUserBalance(
    input.coinDelta || 0,
    input.freeSpinDelta || 0
  );

  res.status(201).json(spin);
}
