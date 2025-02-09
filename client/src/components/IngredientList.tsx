import { CheckSquare } from "lucide-react";

type IngredientListProps = {
  ingredients: string[];
};

export default function IngredientList({ ingredients }: IngredientListProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Ingredients</h3>
      <ul className="space-y-2">
        {ingredients.map((ingredient, i) => (
          <li key={i} className="flex items-center gap-2 text-muted-foreground">
            <CheckSquare className="w-4 h-4 text-primary" />
            <span>{ingredient}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
