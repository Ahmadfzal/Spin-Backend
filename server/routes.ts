import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/user", async (req, res) => {
    const user = await storage.getUser();
    res.json(user);
  });

  app.post("/api/user/topup", async (req, res) => {
    const { amount } = req.body;
    const user = await storage.topUp(Number(amount));
    res.json(user);
  });

  app.post("/api/user/withdraw", async (req, res) => {
    const { amount } = req.body;
    const user = await storage.withdraw(Number(amount));
    res.json(user);
  });

  app.post(api.spins.create.path, async (req, res) => {
    try {
      const input = api.spins.create.input.parse(req.body);
      
      // If result is "Spinning...", it's the start of a spin
      // We calculate the predetermined reward based on total count
      if (input.result === "Spinning...") {
        // DEDUCT BALANCE AT THE START OF THE SPIN
        await storage.updateUserBalance(input.coinDelta || 0, input.freeSpinDelta || 0);

        const totalSpins = await storage.getTotalSpinCount();
        const currentSpinNumber = totalSpins + 1;
        
        let targetSegmentIndex = Math.floor(Math.random() * 8); // Default to random Zonk/Reward
        
        // Predetermined logic
        // reward spin 1x: 10,20,30,40,50,60,70,90 -> Index 0
        // reward spin 2x: 25,75 -> Index 4
        // reward jackpot x2: 5, 35, 55, 85 -> Index 2
        // reward jackpot x3: 45, 73 -> Index 6
        // reward jackpot x10: 100 -> Index 7
        
        const rewards = {
          free1: [10, 20, 30, 40, 50, 60, 70, 90],
          free2: [25, 75],
          jackpot2: [5, 35, 55, 85],
          jackpot3: [45, 73],
          jackpot10: [100]
        };

        if (rewards.free1.includes(currentSpinNumber)) targetSegmentIndex = 0;
        else if (rewards.free2.includes(currentSpinNumber)) targetSegmentIndex = 4;
        else if (rewards.jackpot2.includes(currentSpinNumber)) targetSegmentIndex = 2;
        else if (rewards.jackpot3.includes(currentSpinNumber)) targetSegmentIndex = 6;
        else if (rewards.jackpot10.includes(currentSpinNumber)) targetSegmentIndex = 7;
        else {
          // If not a specific reward spin, we MUST pick a Zonk or other non-reward segment
          // To ensure the "reward" only happens at the specified counts.
          // Zonk indices are 1, 3, 5
          const zonks = [1, 3, 5];
          targetSegmentIndex = zonks[Math.floor(Math.random() * zonks.length)];
        }
        
        return res.json({ targetSegmentIndex });
      }

      // Process the final spin result record
      const spin = await storage.createSpin(input);
      
      // Update balance based on result
      // But we already deducted cost at start (Spinning...)
      // So here we ONLY add rewards if any.
      // If it's a Zonk, coinDelta should be 0 here because cost was paid at start.
      
      await storage.updateUserBalance(input.coinDelta || 0, input.freeSpinDelta || 0);
      res.status(201).json(spin);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.spins.list.path, async (req, res) => {
    const history = await storage.getSpins();
    res.json(history);
  });

  return httpServer;
}
