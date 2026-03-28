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
  vibe_notes: string;
}
