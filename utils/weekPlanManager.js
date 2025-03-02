// Week plan manager utility

// Format date as "DD.MM.YYYY"
const formatDate = (date) => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

// Get week number from date
const getWeekNumber = (date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

// Get week range (Monday to Sunday) from date
const getWeekRange = (date) => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  
  const monday = new Date(date);
  monday.setDate(diff);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  return {
    start: formatDate(monday),
    end: formatDate(sunday)
  };
};

// Mock data for recipes
const RECIPES = [
  {
    id: '1',
    title: 'Cremige Pasta mit Pilzen',
    image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?q=80&w=500',
    time: '25 min',
    rating: 4.8,
    tags: ['Vegetarisch', 'Italienisch'],
  },
  {
    id: '2',
    title: 'Mediterraner Quinoa-Salat',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=500',
    time: '15 min',
    rating: 4.5,
    tags: ['Vegan', 'Salat'],
  },
  {
    id: '3',
    title: 'Hähnchen-Curry mit Reis',
    image: 'https://images.unsplash.com/photo-1604152135912-04a022e23696?q=80&w=500',
    time: '35 min',
    rating: 4.7,
    tags: ['Asiatisch', 'Scharf'],
  },
  {
    id: '4',
    title: 'Avocado-Toast mit Ei',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=500',
    time: '10 min',
    rating: 4.3,
    tags: ['Frühstück', 'Schnell'],
  },
  {
    id: '5',
    title: 'Griechischer Bauernsalat',
    image: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?q=80&w=500',
    time: '15 min',
    rating: 4.6,
    tags: ['Vegetarisch', 'Salat'],
  },
];

// Mock storage for week plans
let weekPlans = [];

// Get all week plans
export const getWeekPlans = () => {
  return weekPlans;
};

// Add a new week plan for a specific week
export const addNewWeekPlan = (weeksAhead = 0) => {
  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + (weeksAhead * 7));
  
  const weekNumber = getWeekNumber(targetDate);
  const year = targetDate.getFullYear();
  const weekRange = getWeekRange(targetDate);
  
  // Check if a plan for this week already exists
  const existingPlanIndex = weekPlans.findIndex(
    plan => plan.weekNumber === weekNumber && plan.year === year
  );
  
  // If plan already exists, return it
  if (existingPlanIndex !== -1) {
    return weekPlans[existingPlanIndex];
  }
  
  // Create new plan with days of the week
  const newPlan = {
    id: `week-${weekNumber}-${year}`,
    name: `Woche ${weekNumber} (${weekRange.start} - ${weekRange.end})`,
    weekNumber,
    year,
    date: targetDate.toISOString(),
    days: {
      'Montag': [],
      'Dienstag': [],
      'Mittwoch': [],
      'Donnerstag': [],
      'Freitag': [],
      'Samstag': [],
      'Sonntag': []
    }
  };
  
  // Add to beginning of array
  weekPlans.unshift(newPlan);
  
  return newPlan;
};

// Move a recipe from one day to another
export const moveRecipe = (weekId, sourceDay, targetDay, recipe) => {
  const weekIndex = weekPlans.findIndex(plan => plan.id === weekId);
  
  if (weekIndex === -1) return false;
  
  // Check if source has the recipe
  const sourceRecipeIndex = weekPlans[weekIndex].days[sourceDay].findIndex(
    r => r.id === recipe.id
  );
  
  if (sourceRecipeIndex === -1) return false;
  
  // Remove from source
  const recipeToMove = weekPlans[weekIndex].days[sourceDay].splice(sourceRecipeIndex, 1)[0];
  
  // Add to target
  weekPlans[weekIndex].days[targetDay].push(recipeToMove);
  
  return true;
};

// Delete a specific recipe from a day
export const deleteRecipe = (weekId, day, recipeId) => {
  const weekIndex = weekPlans.findIndex(plan => plan.id === weekId);
  
  if (weekIndex === -1) return false;
  
  // Find the specific recipe in the day's array
  const recipeIndex = weekPlans[weekIndex].days[day].findIndex(
    recipe => recipe.id === recipeId
  );
  
  if (recipeIndex === -1) return false;
  
  // Remove only the specific recipe
  weekPlans[weekIndex].days[day].splice(recipeIndex, 1);
  
  return true;
};

// Add recipes to a week plan
export const addRecipesToWeekPlan = (weekId, recipes) => {
  const weekIndex = weekPlans.findIndex(plan => plan.id === weekId);
  
  if (weekIndex === -1) return false;
  
  // Simple distribution algorithm - just for demonstration
  const days = Object.keys(weekPlans[weekIndex].days);
  
  let recipeIndex = 0;
  
  // Distribute recipes across the week
  for (const day of days) {
    if (recipeIndex < recipes.length) {
      weekPlans[weekIndex].days[day].push(recipes[recipeIndex]);
      recipeIndex++;
    }
  }
  
  return true;
};

// Initialize with empty data (no sample data on first launch)
const initializeWithEmptyData = () => {
  weekPlans = [];
};

// Initialize with empty data instead of sample data
initializeWithEmptyData();