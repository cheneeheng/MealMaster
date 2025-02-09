import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { insertMealSchema, type InsertMeal } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const mealTypes = [
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "dinner", label: "Dinner" }
] as const;

type MealFormProps = {
  onSuccess?: () => void;
};

export default function MealForm({ onSuccess }: MealFormProps) {
  const { toast } = useToast();
  const form = useForm<InsertMeal>({
    resolver: zodResolver(insertMealSchema),
    defaultValues: {
      name: "",
      types: [],
      description: "",
      ingredients: [],
      imageUrl: ""
    }
  });

  const createMeal = useMutation({
    mutationFn: async (data: InsertMeal) => {
      const res = await apiRequest("POST", "/api/meals", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meals"] });
      toast({
        title: "Success",
        description: "Meal created successfully"
      });
      onSuccess?.();
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(data => createMeal.mutate(data))} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="types"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meal Types</FormLabel>
              <div className="grid grid-cols-3 gap-4">
                {mealTypes.map((type) => (
                  <FormField
                    key={type.id}
                    control={form.control}
                    name="types"
                    render={({ field }) => (
                      <FormItem
                        key={type.id}
                        className="flex flex-row items-center space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(type.id)}
                            onCheckedChange={(checked) => {
                              const value = field.value || [];
                              return checked
                                ? field.onChange([...value, type.id])
                                : field.onChange(value.filter((val) => val !== type.id));
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {type.label}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ingredients"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ingredients</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value.join(", ")}
                  onChange={e => field.onChange(e.target.value.split(",").map(i => i.trim()))}
                  placeholder="Enter ingredients separated by commas"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={createMeal.isPending}>
          {createMeal.isPending ? "Creating..." : "Create Meal"}
        </Button>
      </form>
    </Form>
  );
}