import { startOfWeek, endOfWeek } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import MealCalendar from "@/components/MealCalendar";
import { Button } from "@/components/ui/button";
import { Plus, List } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import MealForm from "@/components/MealForm";
import type { Meal, MealPlan } from "@shared/schema";

function MealList({ meals }: { meals: Meal[] }) {
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  return (
    <div className="space-y-4">
      {meals.map(meal => (
        <Card key={meal.id} className="cursor-pointer hover:bg-accent/5" onClick={() => setSelectedMeal(meal)}>
          <CardHeader>
            <CardTitle className="text-lg">{meal.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {meal.types.map(type => type.charAt(0).toUpperCase() + type.slice(1)).join(", ")}
            </p>
          </CardContent>
        </Card>
      ))}

      <Dialog open={!!selectedMeal} onOpenChange={(open) => !open && setSelectedMeal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Meal</DialogTitle>
          </DialogHeader>
          {selectedMeal && (
            <MealForm 
              initialMeal={selectedMeal} 
              onSuccess={() => setSelectedMeal(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Home() {
  const [showMealForm, setShowMealForm] = useState(false);
  const [showMealList, setShowMealList] = useState(false);
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
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setShowMealList(true)}>
              <List className="w-4 h-4 mr-2" />
              View Meals
            </Button>
            <Button onClick={() => setShowMealForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Meal
            </Button>
          </div>
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
              <DialogTitle>Create New Meal</DialogTitle>
            </DialogHeader>
            <MealForm onSuccess={() => setShowMealForm(false)} />
          </DialogContent>
        </Dialog>

        <Dialog open={showMealList} onOpenChange={setShowMealList}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>All Meals</DialogTitle>
            </DialogHeader>
            {meals && <MealList meals={meals} />}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}