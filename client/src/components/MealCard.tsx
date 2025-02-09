import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Meal, MealPlan } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import IngredientList from "./IngredientList";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type MealCardProps = {
  meal: Meal;
  plan: MealPlan;
};

export default function MealCard({ meal, plan }: MealCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  const toggleConsumed = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/meal-plans/${plan.id}`, {
        consumed: !plan.consumed
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meal-plans"] });
      toast({
        title: "Updated meal status",
        description: `Marked as ${plan.consumed ? "not consumed" : "consumed"}`
      });
    }
  });

  return (
    <>
      <div
        className={cn(
          "p-3 rounded-lg border cursor-pointer transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          plan.consumed && "bg-muted"
        )}
        onClick={() => setShowDetails(true)}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium truncate">{meal.name}</span>
          <button
            onClick={e => {
              e.stopPropagation();
              toggleConsumed.mutate();
            }}
            className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center",
              "hover:bg-primary hover:text-primary-foreground",
              plan.consumed && "bg-primary text-primary-foreground"
            )}
          >
            {plan.consumed ? (
              <Check className="w-3 h-3" />
            ) : (
              <X className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{meal.name}</DialogTitle>
          </DialogHeader>
          
          {meal.imageUrl && (
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <img
                src={meal.imageUrl}
                alt={meal.name}
                className="object-cover w-full h-full"
              />
            </div>
          )}

          {meal.description && (
            <p className="text-muted-foreground">{meal.description}</p>
          )}

          <IngredientList ingredients={meal.ingredients} />
        </DialogContent>
      </Dialog>
    </>
  );
}
