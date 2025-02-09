import { type Meal, type MealPlan, type InsertMeal, type InsertMealPlan } from "@shared/schema";

export interface IStorage {
  getMeals(): Promise<Meal[]>;
  getMeal(id: number): Promise<Meal | undefined>;
  createMeal(meal: InsertMeal): Promise<Meal>;
  updateMeal(id: number, updates: InsertMeal): Promise<Meal>;
  getMealPlans(startDate: Date, endDate: Date): Promise<MealPlan[]>;
  createMealPlan(mealPlan: InsertMealPlan): Promise<MealPlan>;
  updateMealPlan(id: number, updates: Partial<MealPlan>): Promise<MealPlan>;
  deleteMealPlan(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private meals: Map<number, Meal>;
  private mealPlans: Map<number, MealPlan>;
  private currentMealId: number;
  private currentMealPlanId: number;

  constructor() {
    this.meals = new Map();
    this.mealPlans = new Map();
    this.currentMealId = 1;
    this.currentMealPlanId = 1;

    // Add some sample meals with the new types array format
    const sampleMeals: InsertMeal[] = [
      {
        name: "Avocado Toast",
        types: ["breakfast"],
        description: "Whole grain toast with mashed avocado",
        ingredients: ["bread", "avocado", "salt", "pepper"],
        imageUrl: "https://images.unsplash.com/photo-1437750769465-301382cdf094"
      },
      {
        name: "Greek Salad",
        types: ["lunch"],
        description: "Fresh Mediterranean salad",
        ingredients: ["lettuce", "tomatoes", "cucumber", "olives", "feta"],
        imageUrl: "https://images.unsplash.com/photo-1477506350614-fcdc29a3b157"
      },
      {
        name: "Grilled Salmon",
        types: ["dinner"],
        description: "Herb-crusted salmon with vegetables",
        ingredients: ["salmon", "herbs", "lemon", "olive oil"],
        imageUrl: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea"
      }
    ];

    sampleMeals.forEach(meal => this.createMeal(meal));
  }

  async getMeals(): Promise<Meal[]> {
    return Array.from(this.meals.values());
  }

  async getMeal(id: number): Promise<Meal | undefined> {
    return this.meals.get(id);
  }

  async createMeal(meal: InsertMeal): Promise<Meal> {
    const id = this.currentMealId++;
    const newMeal = { ...meal, id };
    this.meals.set(id, newMeal);
    return newMeal;
  }

  async updateMeal(id: number, updates: InsertMeal): Promise<Meal> {
    const existing = this.meals.get(id);
    if (!existing) throw new Error("Meal not found");

    const updated = { ...updates, id };
    this.meals.set(id, updated);
    return updated;
  }

  async getMealPlans(startDate: Date, endDate: Date): Promise<MealPlan[]> {
    return Array.from(this.mealPlans.values()).filter(plan => {
      const planDate = new Date(plan.date);
      return planDate >= startDate && planDate <= endDate;
    });
  }

  async createMealPlan(mealPlan: InsertMealPlan): Promise<MealPlan> {
    const id = this.currentMealPlanId++;
    const newPlan = { ...mealPlan, id };
    this.mealPlans.set(id, newPlan);
    return newPlan;
  }

  async updateMealPlan(id: number, updates: Partial<MealPlan>): Promise<MealPlan> {
    const existing = this.mealPlans.get(id);
    if (!existing) throw new Error("Meal plan not found");

    const updated = { ...existing, ...updates };
    this.mealPlans.set(id, updated);
    return updated;
  }

  async deleteMealPlan(id: number): Promise<void> {
    this.mealPlans.delete(id);
  }
}

export const storage = new MemStorage();