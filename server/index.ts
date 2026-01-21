import express from "express";
import { registerRoutes } from "./routes";

const app = express();

app.use(express.json());

registerRoutes(app);

// penting untuk Vercel
export default app;
