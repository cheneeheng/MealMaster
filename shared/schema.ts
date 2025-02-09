import { pgTable, text, serial, integer, boolean, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const meals = pgTable("meals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  types: text("types").array().notNull(),
  description: text("description"),
  ingredients: jsonb("ingredients").$type<string[]>().notNull(),
  imageUrl: text("image_url")
});

export const mealPlans = pgTable("meal_plans", {
  id: serial("id").primaryKey(),
  mealId: integer("meal_id").notNull(),
  date: date("date").notNull(),
  type: text("type", { enum: ["breakfast", "lunch", "dinner"] }).notNull(),
  consumed: boolean("consumed").notNull().default(false)
});

export const insertMealSchema = createInsertSchema(meals).omit({ id: true });
export const insertMealPlanSchema = createInsertSchema(mealPlans).omit({ id: true });

export type InsertMeal = z.infer<typeof insertMealSchema>;
export type InsertMealPlan = z.infer<typeof insertMealPlanSchema>;
export type Meal = typeof meals.$inferSelect;
export type MealPlan = typeof mealPlans.$inferSelect;