// Shopping list manager utility

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

// Mock storage for shopping lists
let shoppingLists = [];

// Get all shopping lists
export const getShoppingLists = () => {
  return shoppingLists;
};

// Add a new shopping list for a specific week
export const addNewShoppingList = (weeksAhead = 0) => {
  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + (weeksAhead * 7));
  
  const weekNumber = getWeekNumber(targetDate);
  const year = targetDate.getFullYear();
  const weekRange = getWeekRange(targetDate);
  
  // Check if a list for this week already exists
  const existingListIndex = shoppingLists.findIndex(
    list => list.weekNumber === weekNumber && list.year === year
  );
  
  // If list already exists, return it
  if (existingListIndex !== -1) {
    return shoppingLists[existingListIndex];
  }
  
  // Create new list
  const newList = {
    id: `week-${weekNumber}-${year}`,
    name: `Woche ${weekNumber} (${weekRange.start} - ${weekRange.end})`,
    weekNumber,
    year,
    date: targetDate.toISOString(),
    categories: []
  };
  
  // Add to beginning of array
  shoppingLists.unshift(newList);
  
  return newList;
};

// Add ingredients to shopping list
export const addToShoppingList = (ingredients, date = new Date(), targetWeekNumber = null, targetYear = null) => {
  let weekNumber, year, weekRange;
  
  if (targetWeekNumber && targetYear) {
    // Use specified week and year
    weekNumber = targetWeekNumber;
    year = targetYear;
    
    // Create a date for this week to get the range
    const targetDate = new Date(date);
    // Adjust to the target week
    const currentWeekNumber = getWeekNumber(targetDate);
    const weekDiff = targetWeekNumber - currentWeekNumber;
    targetDate.setDate(targetDate.getDate() + (weekDiff * 7));
    
    weekRange = getWeekRange(targetDate);
  } else {
    // Use current date
    weekNumber = getWeekNumber(date);
    year = date.getFullYear();
    weekRange = getWeekRange(date);
  }
  
  // Check if a list for this week already exists
  let listIndex = shoppingLists.findIndex(
    list => list.weekNumber === weekNumber && list.year === year
  );
  
  // Create new list if it doesn't exist
  if (listIndex === -1) {
    const newList = {
      id: `week-${weekNumber}-${year}`,
      name: `Woche ${weekNumber} (${weekRange.start} - ${weekRange.end})`,
      weekNumber,
      year,
      date: date.toISOString(),
      categories: []
    };
    
    shoppingLists.unshift(newList); // Add to beginning of array
    listIndex = 0;
  }
  
  // Group ingredients by category
  const categorizedIngredients = {};
  
  ingredients.forEach(ingredient => {
    if (!categorizedIngredients[ingredient.category]) {
      categorizedIngredients[ingredient.category] = [];
    }
    
    // Check if ingredient already exists in this category
    const existingIngredientIndex = categorizedIngredients[ingredient.category].findIndex(
      item => item.name.toLowerCase() === ingredient.name.toLowerCase()
    );
    
    if (existingIngredientIndex !== -1) {
      // Combine amounts if possible
      const existingAmount = categorizedIngredients[ingredient.category][existingIngredientIndex].amount;
      const newAmount = ingredient.amount;
      
      // Simple amount combination (this could be more sophisticated)
      if (existingAmount.includes('g') && newAmount.includes('g')) {
        const existingGrams = parseInt(existingAmount);
        const newGrams = parseInt(newAmount);
        if (!isNaN(existingGrams) && !isNaN(newGrams)) {
          categorizedIngredients[ingredient.category][existingIngredientIndex].amount = 
            `${existingGrams + newGrams}g`;
        }
      } else if (existingAmount.includes('ml') && newAmount.includes('ml')) {
        const existingMl = parseInt(existingAmount);
        const newMl = parseInt(newAmount);
        if (!isNaN(existingMl) && !isNaN(newMl)) {
          categorizedIngredients[ingredient.category][existingIngredientIndex].amount = 
            `${existingMl + newMl}ml`;
        }
      } else if (existingAmount.includes('Stück') && newAmount.includes('Stück')) {
        const existingCount = parseInt(existingAmount);
        const newCount = parseInt(newAmount);
        if (!isNaN(existingCount) && !isNaN(newCount)) {
          categorizedIngredients[ingredient.category][existingIngredientIndex].amount = 
            `${existingCount + newCount} Stück`;
        }
      } else {
        // If we can't combine, just keep both
        categorizedIngredients[ingredient.category].push({
          ...ingredient,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          checked: false
        });
      }
    } else {
      // Add new ingredient
      categorizedIngredients[ingredient.category].push({
        ...ingredient,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        checked: false
      });
    }
  });
  
  // Update or add categories to the shopping list
  Object.keys(categorizedIngredients).forEach(categoryName => {
    // Check if category already exists in the list
    const categoryIndex = shoppingLists[listIndex].categories.findIndex(
      category => category.category === categoryName
    );
    
    if (categoryIndex !== -1) {
      // Add items to existing category
      shoppingLists[listIndex].categories[categoryIndex].items.push(
        ...categorizedIngredients[categoryName]
      );
    } else {
      // Create new category
      shoppingLists[listIndex].categories.push({
        category: categoryName,
        items: categorizedIngredients[categoryName]
      });
    }
  });
  
  // Sort categories alphabetically
  shoppingLists[listIndex].categories.sort((a, b) => 
    a.category.localeCompare(b.category)
  );
  
  return shoppingLists[listIndex];
};

// Get available weeks for selection
export const getAvailableWeeks = () => {
  const today = new Date();
  const currentWeekNumber = getWeekNumber(today);
  const currentYear = today.getFullYear();
  
  // Create an array of the next 4 weeks
  const availableWeeks = [];
  
  for (let i = 0; i < 5; i++) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + (i * 7));
    
    const weekNumber = getWeekNumber(targetDate);
    const year = targetDate.getFullYear();
    const weekRange = getWeekRange(targetDate);
    
    availableWeeks.push({
      id: `week-${weekNumber}-${year}`,
      name: i === 0 ? `Diese Woche (${weekRange.start} - ${weekRange.end})` : 
             i === 1 ? `Nächste Woche (${weekRange.start} - ${weekRange.end})` :
             `Woche ${weekNumber} (${weekRange.start} - ${weekRange.end})`,
      weekNumber,
      year,
      date: targetDate.toISOString()
    });
  }
  
  return availableWeeks;
};

// Initialize with empty shopping lists
const initializeWithEmptyData = () => {
  shoppingLists = [];
};

// Initialize with empty data instead of sample data
initializeWithEmptyData();