// Recipe manager utility

// Mock data for recipes
const RECIPES = [
  {
    id: '1',
    title: 'Cremige Pasta mit Pilzen',
    image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?q=80&w=500',
    time: '25 min',
    rating: 4.8,
    tags: ['Vegetarisch', 'Italienisch'],
    servings: 2,
    ingredients: [
      { id: '1', name: 'Pasta', amount: '200g' },
      { id: '2', name: 'Champignons', amount: '250g' },
      { id: '3', name: 'Zwiebel', amount: '1 Stück' },
      { id: '4', name: 'Knoblauch', amount: '2 Zehen' },
      { id: '5', name: 'Sahne', amount: '200ml' },
      { id: '6', name: 'Parmesan', amount: '50g' },
      { id: '7', name: 'Petersilie', amount: 'nach Geschmack' },
      { id: '8', name: 'Salz & Pfeffer', amount: 'nach Geschmack' },
    ],
    steps: [
      'Wasser in einem großen Topf zum Kochen bringen und salzen.',
      'Pasta nach Packungsanweisung kochen.',
      'In der Zwischenzeit Zwiebel und Knoblauch fein hacken.',
      'Pilze putzen und in Scheiben schneiden.',
      'Zwiebel und Knoblauch in Olivenöl anschwitzen, bis sie glasig sind.',
      'Pilze hinzufügen und bei mittlerer Hitze ca. 5 Minuten braten.',
      'Sahne hinzufügen und kurz aufkochen lassen.',
      'Mit Salz und Pfeffer abschmecken.',
      'Gekochte Pasta abgießen und zur Sauce geben.',
      'Parmesan unterrühren und mit gehackter Petersilie garnieren.',
    ],
  },
  {
    id: '2',
    title: 'Mediterraner Quinoa-Salat',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=500',
    time: '15 min',
    rating: 4.5,
    tags: ['Vegan', 'Salat'],
    servings: 2,
    ingredients: [
      { id: '1', name: 'Quinoa', amount: '150g' },
      { id: '2', name: 'Gurke', amount: '1 Stück' },
      { id: '3', name: 'Tomaten', amount: '2 Stück' },
      { id: '4', name: 'Rote Zwiebel', amount: '1 Stück' },
      { id: '5', name: 'Feta', amount: '100g' },
      { id: '6', name: 'Oliven', amount: '50g' },
      { id: '7', name: 'Olivenöl', amount: '3 EL' },
      { id: '8', name: 'Zitronensaft', amount: '2 EL' },
    ],
    steps: [
      'Quinoa nach Packungsanweisung kochen und abkühlen lassen.',
      'Gurke, Tomaten und rote Zwiebel in kleine Würfel schneiden.',
      'Feta würfeln und Oliven halbieren.',
      'Alle Zutaten in einer großen Schüssel mischen.',
      'Olivenöl und Zitronensaft verquirlen und über den Salat gießen.',
      'Mit Salz und Pfeffer abschmecken und gut durchmischen.',
      'Vor dem Servieren 30 Minuten im Kühlschrank ziehen lassen.',
    ],
  },
  {
    id: '3',
    title: 'Hähnchen-Curry mit Reis',
    image: 'https://images.unsplash.com/photo-1604152135912-04a022e23696?q=80&w=500',
    time: '35 min',
    rating: 4.7,
    tags: ['Asiatisch', 'Scharf'],
    servings: 3,
    ingredients: [
      { id: '1', name: 'Hähnchenbrust', amount: '300g' },
      { id: '2', name: 'Reis', amount: '200g' },
      { id: '3', name: 'Zwiebel', amount: '1 Stück' },
      { id: '4', name: 'Knoblauch', amount: '2 Zehen' },
      { id: '5', name: 'Currypaste', amount: '2 EL' },
      { id: '6', name: 'Kokosmilch', amount: '400ml' },
      { id: '7', name: 'Paprika', amount: '1 Stück' },
      { id: '8', name: 'Koriander', amount: 'nach Geschmack' },
    ],
    steps: [
      'Reis nach Packungsanweisung kochen.',
      'Hähnchenbrust in mundgerechte Stücke schneiden.',
      'Zwiebel und Knoblauch fein hacken, Paprika in Streifen schneiden.',
      'Hähnchen in einer Pfanne mit etwas Öl anbraten, bis es goldbraun ist.',
      'Zwiebel und Knoblauch hinzufügen und glasig dünsten.',
      'Currypaste einrühren und kurz mitbraten.',
      'Kokosmilch und Paprika hinzufügen und alles ca. 10 Minuten köcheln lassen.',
      'Mit Salz und Pfeffer abschmecken.',
      'Curry mit Reis servieren und mit frischem Koriander garnieren.',
    ],
  },
  {
    id: '4',
    title: 'Avocado-Toast mit Ei',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=500',
    time: '10 min',
    rating: 4.3,
    tags: ['Frühstück', 'Schnell'],
    servings: 1,
    ingredients: [
      { id: '1', name: 'Brot', amount: '2 Scheiben' },
      { id: '2', name: 'Avocado', amount: '1 Stück' },
      { id: '3', name: 'Eier', amount: '2 Stück' },
      { id: '4', name: 'Zitronensaft', amount: '1 EL' },
      { id: '5', name: 'Chiliflocken', amount: 'nach Geschmack' },
      { id: '6', name: 'Salz & Pfeffer', amount: 'nach Geschmack' },
    ],
    steps: [
      'Brot toasten.',
      'Avocado halbieren, entkernen und das Fruchtfleisch in eine Schüssel geben.',
      'Avocado mit einer Gabel zerdrücken und mit Zitronensaft, Salz und Pfeffer abschmecken.',
      'Eier in einer Pfanne nach Belieben braten (Spiegelei oder Rührei).',
      'Avocadocreme auf dem getoasteten Brot verteilen.',
      'Eier auf die Avocadocreme legen.',
      'Mit Chiliflocken bestreuen und sofort servieren.',
    ],
  },
  {
    id: '5',
    title: 'Griechischer Bauernsalat',
    image: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?q=80&w=500',
    time: '15 min',
    rating: 4.6,
    tags: ['Vegetarisch', 'Salat'],
    servings: 2,
    ingredients: [
      { id: '1', name: 'Tomaten', amount: '4 Stück' },
      { id: '2', name: 'Gurke', amount: '1 Stück' },
      { id: '3', name: 'Rote Zwiebel', amount: '1 Stück' },
      { id: '4', name: 'Feta', amount: '200g' },
      { id: '5', name: 'Oliven', amount: '100g' },
      { id: '6', name: 'Olivenöl', amount: '4 EL' },
      { id: '7', name: 'Oregano', amount: '1 TL' },
      { id: '8', name: 'Salz & Pfeffer', amount: 'nach Geschmack' },
    ],
    steps: [
      'Tomaten in grobe Stücke schneiden.',
      'Gurke in Scheiben schneiden.',
      'Rote Zwiebel in dünne Ringe schneiden.',
      'Feta in grobe Würfel schneiden.',
      'Alle Zutaten in einer Schüssel mischen.',
      'Mit Olivenöl beträufeln und mit Oregano, Salz und Pfeffer würzen.',
      'Vor dem Servieren 10 Minuten ziehen lassen.',
    ],
  },
];

// Store the current recipe
let currentRecipe = null;

// Get all recipes
export const getAllRecipes = () => {
  return RECIPES;
};

// Get a recipe by ID
export const getRecipeById = (id) => {
  return RECIPES.find(recipe => recipe.id === id) || null;
};

// Set the current recipe
export const setCurrentRecipe = (recipe) => {
  currentRecipe = recipe;
};

// Get the current recipe
export const getCurrentRecipe = () => {
  return currentRecipe;
};

// Search recipes by query
export const searchRecipes = (query) => {
  if (!query || query.trim() === '') {
    return RECIPES;
  }
  
  const normalizedQuery = query.toLowerCase().trim();
  
  return RECIPES.filter(recipe => {
    // Search in title
    if (recipe.title.toLowerCase().includes(normalizedQuery)) {
      return true;
    }
    
    // Search in tags
    if (recipe.tags.some(tag => tag.toLowerCase().includes(normalizedQuery))) {
      return true;
    }
    
    // Search in ingredients
    if (recipe.ingredients && recipe.ingredients.some(ingredient => 
      ingredient.name.toLowerCase().includes(normalizedQuery)
    )) {
      return true;
    }
    
    return false;
  });
};

// Filter recipes by tags
export const filterRecipesByTags = (tags) => {
  if (!tags || tags.length === 0) {
    return RECIPES;
  }
  
  return RECIPES.filter(recipe => {
    return tags.some(tag => recipe.tags.includes(tag));
  });
};