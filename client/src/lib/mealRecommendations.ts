import type { Meal, MealPlan } from "@shared/schema";

// Score different aspects of a meal for recommendations
interface MealScore {
  meal: Meal;
  score: number;
}

export function getRecommendedMeals(
  allMeals: Meal[],
  recentMealPlans: MealPlan[],
  mealType: "breakfast" | "lunch" | "dinner",
  count = 3
): Meal[] {
  // Filter meals by type first
  const mealsOfType = allMeals.filter(meal => meal.types.includes(mealType));
  
  if (mealsOfType.length === 0) return [];

  const scoredMeals: MealScore[] = mealsOfType.map(meal => {
    let score = 0;

    // Factor 1: Penalize recently used meals
    const mealUsageCount = recentMealPlans.filter(plan => plan.mealId === meal.id).length;
    score -= mealUsageCount * 2;

    // Factor 2: Boost meals that haven't been used recently
    const wasUsedRecently = recentMealPlans
      .slice(-7) // Look at last 7 meal plans
      .some(plan => plan.mealId === meal.id);
    if (!wasUsedRecently) {
      score += 3;
    }

    return { meal, score };
  });

  // Sort by score and return top recommendations
  return scoredMeals
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(scored => scored.meal);
}
