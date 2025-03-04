export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  isGenerating?: boolean;
  showSurpriseMe?: boolean;
  recipeCountOptions?: boolean;
  servingsOptions?: boolean;
  showAddToShoppingListButton?: boolean;
  showShoppingListNavigateButton?: boolean;
  progressStage?: string;
  progressPercent?: number;
}

export interface Recipe {
  id: string;
  title: string;
  image: string;
  time: string;
  servings: number;
}

export interface ShoppingListItem {
  name: string;
  amount: string;
  unit: string;
}
