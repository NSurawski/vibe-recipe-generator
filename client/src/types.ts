export type DietaryFilter = "vegetarian" | "vegan" | "gluten-free" | "dairy-free" | "nut-free" | "keto";

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

export interface Nutrition {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
}

export interface Preferences {
  diet: string[];
  time: string;
  skill: string;
  cuisine: string;
  mealType: string;
  ingredients?: string;
}
