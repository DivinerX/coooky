export default {
  common: {
    greeting: "Hello!",
    whatToCook: "What do you want to cook today?",
    singleRecipe: "Single Recipe",
    weeklyPlanning: "Weekly Planning",
    surpriseMe: "Surprise me",
    deleteItemConfirmationTitle: "Delete Item",
    deleteItemConfirmationMessage: "Are you sure you want to delete this item?",
    deleteAllConfirmationMessage: "Are you sure you want to delete?",
    deleteAllConfirmationTitle: "Delete All Items",
    cancel: "Cancel",
    move: "Move",
    week: "Week",
    days: {
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday",
    }
  },
  tabs: {
    discover: "Discover",
    cook: "Cook",
    planner: "Planner",
    shopping: "Shopping",
    settings: "Settings",
  },
  plan: {
    addRecipe: "Add Recipe",
    generateSuggestions: "Generate Suggestions",
    shoppingList: "Shopping List",
    addWeek: "Add Week",
    weekPlan: "Week Plan",
    selectWeek: "Select Week",
    nextWeek: "Next Week",
    twoWeeks: "In 2 Weeks",
    threeWeeks: "In 3 Weeks",
    fourWeeks: "In 4 Weeks",
    existingWeeks: "Existing Weeks",
    moveRecipe: "Move Recipe",
    selectTargetDay: "Select Target Day:",
    day: "Day",
    editRecipe: "Edit Recipe",
    editRecipeWarning: "This will move the recipe to the selected day and remove it from the current day. This can affect your shopping list.",
    cookRecipe: "Cook Recipe",
    cookNow: "Cook Now",
    noWeekPlans: "No week plans found. Create a new week plan or plan your week.",
  },
  cook: {
    portions: "Portions",
    selectRecipe: "Select Recipe",
    pleaseSelectRecipe: "Please select a recipe",
    weekPlan: "Week Plan",
    allRecipes: "All Recipes",
    ingredients: "Ingredients",
    stepByStepInstructions: "Step by Step Instructions",
    step: "Step",
    of: "of",
    changeRecipe: "Change Recipe",
  },
  chat: {
    cookingAssistant: "Cooking Assistant",
    weeklyPlanning: "Weekly Planning",
    initialMessage: "Before we begin, do you have any special dietary requirements or allergies I should consider?",
    writeMessage: "Write a message...",
    analyzingPreferences: "Analyzing preferences",
    recipeRequestMessage: "What do you hunger for today?",
    surpriseMe: "Surprise me",
    servingsMessage: "How many servings would you like?",
    recipeCountMessage: "How many recipes would you like to generate?",
    custom: "Custom",
    servingMessage: "I plan with {{servings}} servings per recipe and create {{recipeCount}} suitable recipes for you...",
    progress: {
      startRecipeSearch: "Starting recipe search...",
      searchCookbooks: "Searching cookbooks...",
      analyzeIngredients: "Analyzing ingredients...",
      createRecipeDrafts: "Creating recipe drafts...",
      optimizeIngredientList: "Optimizing ingredient list...",
      refineSpices: "Refining spices...",
      calculateQuantities: "Calculating quantities...",
      checkCombinations: "Checking combinations...",
      finalizeRecipes: "Finalizing recipes...",
      prepareSuggestions: "Preparing suggestions...",
    },
    soupBurnt: "Oops! The soup is burnt..",
    errorGeneratingRecipes: "There was a problem generating the recipes: {{error.message || 'Unknown error'}}. Please try again later.",
    surpriseMeMessage: "I'll surprise you with {{cuisine}} {{icon}} recipes! How many recipes should I suggest?",
    portions: "Portions",
    generatedRecipes: "Generated recipes",
    generatedRecipesResult: "Here are {{count}} recipes based on your preferences:",
    addToShoppingList: "Add to shopping list",
    addToWeekPlan: "Add to week plan",
    shoppingList: "Shopping List",
  },
  categories: {
    asian: "Asian",
    italian: "Italian",
    mediterranean: "Mediterranean",
    german: "German",
    mexican: "Mexican",
    vegetarian: "Vegetarian",
    quick: "Quick",
  },
  shopping:{
    title: "Shopping List",
    addWeek: "Add Week",
    selectWeek: "Select Week",
    addNewWeek: "Add New Week",
    nextWeek: "Next Week",
    twoWeeks: "In 2 Weeks",
    threeWeeks: "In 3 Weeks",
    fourWeeks: "In 4 Weeks",
    existingWeeks: "Existing Weeks",
    hideCompleted: "Hide Completed",
    showCompleted: "Show Completed",
    share: "Share",
    addItemPlaceholder: "Add item...",
    deleteAll: "Delete All",
    noLists: "No shopping lists found. Create a new shopping list or add items to your shopping list.",
  },
  settings: {
    title: "Settings",
    edit: "Edit",
    notifications: "Notifications",
    general: "General",
    appSettings: "App Settings",
    darkMode: "Dark Mode",
    voiceGuide: "Voice Guide",  
    language: "Language",
    nutritionalPreferences: "Nutritional Preferences",
    helpSupport: "Help & Support",
    faq: "FAQ",
    contact: "Contact",
    privacy: "Privacy",
    terms: "Terms",
    logout: "Logout",
    version: "Version 1.0.0",
    selectLanguage: "Select Language",
  }
};