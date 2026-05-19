export type DietaryFilter = "vegetarian" | "vegan" | "gluten-free";

export interface Ingredient {
  item: string;
  amount: string;
  note?: string;
}

export interface Recipe {
  title: string;
  description: string;
  ingredients: Ingredient[];
  steps: string[];
  time: string;
  difficulty: "Easy" | "Medium" | "Hard";
  servings: string;
  tags: string[];
  vibe_notes: string;
}

export interface Preferences {
  diet: string[];
  time: string;
  skill: string;
  cuisine: string;
}
