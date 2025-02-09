import { useState } from "react";
import { CheckSquare, Square } from "lucide-react";
import { cn } from "@/lib/utils";

type IngredientListProps = {
  ingredients: string[];
};

export default function IngredientList({ ingredients }: IngredientListProps) {
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());

  const toggleIngredient = (ingredient: string) => {
    setCheckedIngredients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ingredient)) {
        newSet.delete(ingredient);
      } else {
        newSet.add(ingredient);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Ingredients</h3>
      <ul className="space-y-2">
        {ingredients.map((ingredient, i) => (
          <li 
            key={i} 
            className="flex items-center gap-2 text-muted-foreground cursor-pointer"
            onClick={() => toggleIngredient(ingredient)}
          >
            {checkedIngredients.has(ingredient) ? (
              <CheckSquare className="w-4 h-4 text-primary" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            <span className={cn(
              checkedIngredients.has(ingredient) && "line-through"
            )}>
              {ingredient}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}