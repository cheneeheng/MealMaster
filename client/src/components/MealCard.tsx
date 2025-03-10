import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Trash2, Edit } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import MealForm from "./MealForm";

type MealCardProps = {
  meal: Meal;
  plan: MealPlan;
};

export default function MealCard({ meal, plan }: MealCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
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

  const deleteMealPlan = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/meal-plans/${plan.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meal-plans"] });
      toast({
        title: "Success",
        description: "Meal plan deleted successfully"
      });
    }
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteMealPlan.mutate();
  };

  return (
    <>
      <div
        className={cn(
          "p-3 rounded-lg border cursor-pointer transition-colors group",
          "hover:bg-accent hover:text-accent-foreground",
          plan.consumed && "line-through text-muted-foreground"
        )}
        onClick={(e) => {
          e.stopPropagation();
          setShowDetails(true);
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium truncate">{meal.name}</span>
          <button
            onClick={handleDelete}
            disabled={deleteMealPlan.isPending}
            className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
              "hover:bg-destructive hover:text-destructive-foreground"
            )}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
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

          <div className="space-y-2">
            <Button
              variant={plan.consumed ? "outline" : "default"}
              className="w-full"
              onClick={() => toggleConsumed.mutate()}
              disabled={toggleConsumed.isPending}
            >
              {toggleConsumed.isPending
                ? "Updating..."
                : plan.consumed
                  ? "Mark as Not Consumed"
                  : "Mark as Consumed"
              }
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                setShowEdit(true);
              }}
            >
              Edit Meal
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowDetails(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Edit Meal</DialogTitle>
          </DialogHeader>
          <MealForm 
            initialMeal={meal} 
            onSuccess={() => {
              setShowEdit(false);
              setShowDetails(false);
            }} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
}