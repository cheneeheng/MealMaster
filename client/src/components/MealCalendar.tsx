import { eachDayOfInterval, format, startOfWeek, endOfWeek } from "date-fns";
import type { Meal, MealPlan } from "@shared/schema";
import MealCard from "./MealCard";

type MealCalendarProps = {
  meals: Meal[];
  mealPlans: MealPlan[];
};

export default function MealCalendar({ meals, mealPlans }: MealCalendarProps) {
  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const mealTypes = ["breakfast", "lunch", "dinner"] as const;

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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border">
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
                className="p-2 min-h-[120px] border-l border-b border-border"
              >
                {plans.map(plan => {
                  const meal = getMealForPlan(plan);
                  return meal ? (
                    <MealCard
                      key={plan.id}
                      meal={meal}
                      plan={plan}
                    />
                  ) : null;
                })}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
