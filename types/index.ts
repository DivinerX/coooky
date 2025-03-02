export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  servingsOptions?: boolean;
  isGenerating?: boolean;
  showSurpriseMe?: boolean;
  showShoppingListButton?: boolean;
  showShoppingListNavigateButton?: boolean;
  recipeCountOptions?: boolean;
  showAddToShoppingListButton?: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  image: string;
  time: string;
  servings: number;
}