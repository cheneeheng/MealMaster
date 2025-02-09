import { eachDayOfInterval, format, startOfWeek, endOfWeek, subDays } from "date-fns";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Meal, MealPlan, InsertMealPlan } from "@shared/schema";
import { getRecommendedMeals } from "@/lib/mealRecommendations";
import MealCard from "./MealCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SparklesIcon } from "lucide-react";

type MealCalendarProps = {
  meals: Meal[];
  mealPlans: MealPlan[];
};

export default function MealCalendar({ meals, mealPlans }: MealCalendarProps) {
  const { toast } = useToast();
  const [selectedSlot, setSelectedSlot] = useState<{
    date: Date;
    type: "breakfast" | "lunch" | "dinner";
  } | null>(null);
  const [selectedMealId, setSelectedMealId] = useState<string>("");

  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const mealTypes = ["breakfast", "lunch", "dinner"] as const;

  const createMealPlan = useMutation({
    mutationFn: async (data: InsertMealPlan) => {
      const res = await apiRequest("POST", "/api/meal-plans", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meal-plans"] });
      toast({
        title: "Success",
        description: "Meal plan created successfully"
      });
      setSelectedSlot(null);
      setSelectedMealId("");
    }
  });

  const getMealForPlan = (plan: MealPlan) => {
    return meals.find(meal => meal.id === plan.mealId);
  };

  const getPlansForDay = (date: Date, type: typeof mealTypes[number]) => {
    return mealPlans.filter(
      plan =>
        format(new Date(plan.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd") &&
        plan.type === type
    );
  };

  const handleCreatePlan = () => {
    if (!selectedSlot || !selectedMealId) return;

    createMealPlan.mutate({
      mealId: parseInt(selectedMealId),
      date: format(selectedSlot.date, "yyyy-MM-dd"),
      type: selectedSlot.type,
      consumed: false
    });
  };

  const handleSlotClick = (e: React.MouseEvent, date: Date, type: typeof mealTypes[number]) => {
    const target = e.target as HTMLElement;
    // Only open the add meal dialog if clicking directly on the slot
    if (target.closest('.meal-card')) return;
    setSelectedSlot({ date, type });
  };

  // Get recommended meals for the selected slot
  const getRecommendationsForSlot = () => {
    if (!selectedSlot) return [];

    // Get recent meal plans for better recommendations
    const thirtyDaysAgo = subDays(new Date(), 30);
    const recentPlans = mealPlans.filter(
      plan => new Date(plan.date) >= thirtyDaysAgo
    );

    return getRecommendedMeals(
      meals,
      recentPlans,
      selectedSlot.type,
      3
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border">
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-semibold text-primary">
          {format(today, "MMMM yyyy")}
        </h2>
      </div>

      <div className="grid grid-cols-8 border-b border-border">
        <div className="p-4 font-medium text-muted-foreground">Time</div>
        {days.map(day => (
          <div
            key={day.toISOString()}
            className="p-4 font-medium text-center border-l border-border"
          >
            <div className="text-sm text-muted-foreground">
              {format(day, "EEE")}
            </div>
            <div className="text-foreground">{format(day, "d")}</div>
          </div>
        ))}
      </div>

      {mealTypes.map(type => (
        <div key={type} className="grid grid-cols-8">
          <div className="p-4 font-medium capitalize text-muted-foreground border-b border-border">
            {type}
          </div>
          {days.map(day => {
            const plans = getPlansForDay(day, type);
            return (
              <div
                key={day.toISOString()}
                className="p-2 min-h-[120px] border-l border-b border-border hover:bg-accent/5 transition-colors cursor-pointer"
                onClick={(e) => handleSlotClick(e, day, type)}
              >
                {plans.map(plan => {
                  const meal = getMealForPlan(plan);
                  return meal ? (
                    <div key={plan.id} className="meal-card">
                      <MealCard
                        meal={meal}
                        plan={plan}
                      />
                    </div>
                  ) : null;
                })}
              </div>
            );
          })}
        </div>
      ))}

      <Dialog open={!!selectedSlot} onOpenChange={(open) => !open && setSelectedSlot(null)}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Add Meal to Plan</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="mb-2 text-sm font-medium">
                {selectedSlot && `${format(selectedSlot.date, "MMMM d")} - ${selectedSlot.type}`}
              </h4>

              <Select onValueChange={setSelectedMealId} value={selectedMealId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a meal" />
                </SelectTrigger>
                <SelectContent>
                  {selectedSlot && (
                    <>
                      <SelectGroup>
                        <SelectLabel className="flex items-center gap-2">
                          <SparklesIcon className="w-4 h-4 text-primary" />
                          Recommended
                        </SelectLabel>
                        {getRecommendationsForSlot().map(meal => (
                          <SelectItem
                            key={meal.id}
                            value={meal.id.toString()}
                            className="pl-6"
                          >
                            {meal.name} ✨
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>All {selectedSlot.type} Meals</SelectLabel>
                        {meals
                          .filter(meal => meal.types.includes(selectedSlot.type))
                          .filter(meal => !getRecommendationsForSlot().some(rec => rec.id === meal.id))
                          .map(meal => (
                            <SelectItem
                              key={meal.id}
                              value={meal.id.toString()}
                              className="pl-6"
                            >
                              {meal.name}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setSelectedSlot(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreatePlan}
                disabled={createMealPlan.isPending || !selectedMealId}
              >
                {createMealPlan.isPending ? "Adding..." : "Add to Plan"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}