import { startOfWeek, endOfWeek } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import MealCalendar from "@/components/MealCalendar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MealForm from "@/components/MealForm";
import type { Meal, MealPlan } from "@shared/schema";

export default function Home() {
  const [showMealForm, setShowMealForm] = useState(false);
  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);

  const { data: meals, isLoading: loadingMeals } = useQuery<Meal[]>({
    queryKey: ["/api/meals"]
  });

  const { data: mealPlans, isLoading: loadingPlans } = useQuery<MealPlan[]>({
    queryKey: ["/api/meal-plans", weekStart.toISOString(), weekEnd.toISOString()],
    queryFn: async () => {
      const res = await fetch(
        `/api/meal-plans?startDate=${weekStart.toISOString()}&endDate=${weekEnd.toISOString()}`
      );
      if (!res.ok) throw new Error("Failed to fetch meal plans");
      return res.json();
    }
  });

  const isLoading = loadingMeals || loadingPlans;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">Meal Planner</h1>
          <Button onClick={() => setShowMealForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Meal
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <MealCalendar meals={meals || []} mealPlans={mealPlans || []} />
        )}

        <Dialog open={showMealForm} onOpenChange={setShowMealForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Meal</DialogTitle>
            </DialogHeader>
            <MealForm onSuccess={() => setShowMealForm(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}