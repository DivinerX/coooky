export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  isGenerating?: boolean;
  isLoading?: boolean;
  showSurpriseMe?: boolean;
  recipeCountOptions?: boolean;
  servingsOptions?: boolean;
  progressStage?: string;
  progressPercent?: number;
}

export interface Recipe {
  id: string;
  title: string;
  image: string;
  time: string;
  servings: number;
  ingredients: any[];
}

export interface ShoppingListItem {
  name: string;
  amount: string;
  unit: string;
}
