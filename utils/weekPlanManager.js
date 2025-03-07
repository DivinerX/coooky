import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@/utils/i18n';

const WEEK_PLANS_KEY = 'week_plans';

// Initialize week plans array
let weekPlans = [];

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

// Load week plans from storage
export const loadWeekPlans = async () => {
  try {
    const storedPlans = await AsyncStorage.getItem(WEEK_PLANS_KEY);
    if (storedPlans) {
      weekPlans = JSON.parse(storedPlans);
    }
    return weekPlans;
  } catch (error) {
    console.error('Error loading week plans:', error);
    return [];
  }
};

// Save week plans to storage
const saveWeekPlans = async () => {
  try {
    await AsyncStorage.setItem(WEEK_PLANS_KEY, JSON.stringify(weekPlans));
  } catch (error) {
    console.error('Error saving week plans:', error);
  }
};

// Add a new week plan for a specific week
export const addNewWeekPlan = async (weeksAhead = 0) => {
  await loadWeekPlans();
  
  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + (weeksAhead * 7));
  
  const weekNumber = getWeekNumber(targetDate);
  const year = targetDate.getFullYear();
  const weekRange = getWeekRange(targetDate);
  
  const existingPlanIndex = weekPlans.findIndex(
    plan => plan.weekNumber === weekNumber && plan.year === year
  );
  
  if (existingPlanIndex !== -1) {
    return weekPlans[existingPlanIndex];
  }
  
  const newPlan = {
    id: `week-${weekNumber}-${year}`,
    name: `${weekNumber}`,
    weekNumber,
    year,
    date: targetDate.toISOString(),
    days: {
      'monday': [],
      'tuesday': [],
      'wednesday': [],
      'thursday': [],
      'friday': [],
      'saturday': [],
      'sunday': []
    }
  };
  
  weekPlans.unshift(newPlan);
  await saveWeekPlans();
  
  return newPlan;
};

// Move a recipe from one day to another
export const moveRecipe = async (weekId, sourceDay, targetDay, recipe) => {
  await loadWeekPlans();
  
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
  
  // Save changes to storage
  await saveWeekPlans();
  
  return true;
};

// Delete a specific recipe from a day
export const deleteRecipe = async (weekId, day, recipeId) => {
  await loadWeekPlans();
  
  const weekIndex = weekPlans.findIndex(plan => plan.id === weekId);
  
  if (weekIndex === -1) return false;
  
  // Find the specific recipe in the day's array
  const recipeIndex = weekPlans[weekIndex].days[day].findIndex(
    recipe => recipe.id === recipeId
  );
  
  if (recipeIndex === -1) return false;
  
  // Remove only the specific recipe
  weekPlans[weekIndex].days[day].splice(recipeIndex, 1);
  
  // Save changes to storage
  await saveWeekPlans();
  
  return true;
};

// Add recipes to a week plan
export const addRecipesToWeekPlan = async (weekId, recipes) => {
  await loadWeekPlans();
  
  const weekIndex = weekPlans.findIndex(plan => plan.id === weekId);
  
  if (weekIndex === -1) return false;
  
  const days = Object.keys(weekPlans[weekIndex].days);
  let recipeIndex = 0;
  
  for (const day of days) {
    if (recipeIndex < recipes.length) {
      weekPlans[weekIndex].days[day].push(recipes[recipeIndex]);
      recipeIndex++;
    }
  }
  
  await saveWeekPlans();
  return true;
};
