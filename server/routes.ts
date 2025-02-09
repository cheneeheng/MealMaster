import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertMealSchema, insertMealPlanSchema } from "@shared/schema";

export function registerRoutes(app: Express) {
  const server = createServer(app);

  app.get("/api/meals", async (req, res) => {
    const meals = await storage.getMeals();
    res.json(meals);
  });

  app.post("/api/meals", async (req, res) => {
    const parsed = insertMealSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid meal data" });
    }
    
    const meal = await storage.createMeal(parsed.data);
    res.json(meal);
  });

  app.get("/api/meal-plans", async (req, res) => {
    const startDate = new Date(req.query.startDate as string);
    const endDate = new Date(req.query.endDate as string);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ error: "Invalid date range" });
    }

    const plans = await storage.getMealPlans(startDate, endDate);
    res.json(plans);
  });

  app.post("/api/meal-plans", async (req, res) => {
    const parsed = insertMealPlanSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid meal plan data" });
    }

    const plan = await storage.createMealPlan(parsed.data);
    res.json(plan);
  });

  app.patch("/api/meal-plans/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    try {
      const updated = await storage.updateMealPlan(id, req.body);
      res.json(updated);
    } catch (err) {
      res.status(404).json({ error: "Meal plan not found" });
    }
  });

  app.delete("/api/meal-plans/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    await storage.deleteMealPlan(id);
    res.status(204).end();
  });

  return server;
}
