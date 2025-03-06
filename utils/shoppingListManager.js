import AsyncStorage from '@react-native-async-storage/async-storage';

const SHOPPING_LISTS_KEY = 'shopping_lists';

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

// Initialize shopping lists from storage
let shoppingLists = [];

// Load shopping lists from storage
const loadShoppingLists = async () => {
  try {
    const storedLists = await AsyncStorage.getItem(SHOPPING_LISTS_KEY);
    if (storedLists) {
      shoppingLists = JSON.parse(storedLists);
    }
  } catch (error) {
    console.error('Error loading shopping lists:', error);
  }
};

// Save shopping lists to storage
const saveShoppingLists = async () => {
  try {
    await AsyncStorage.setItem(SHOPPING_LISTS_KEY, JSON.stringify(shoppingLists));
  } catch (error) {
    console.error('Error saving shopping lists:', error);
  }
};

// Get all shopping lists
export const getShoppingLists = async () => {
  await loadShoppingLists();
  return shoppingLists;
};

// Add a new shopping list
export const addNewShoppingList = async (weeksAhead = 0) => {
  await loadShoppingLists();
  
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
  
  const newList = {
    id: `shopping-week-${weekNumber}-${year}`,
    name: `Woche ${weekNumber} (${weekRange.start} - ${weekRange.end})`,
    weekNumber,
    year,
    date: targetDate.toISOString(),
    categories: []
  };
  
  shoppingLists.unshift(newList);
  await saveShoppingLists();
  return newList;
};

// Add ingredients to shopping list
export const addToShoppingList = async (ingredients, listId) => {
  await loadShoppingLists();
  
  let listIndex = shoppingLists.findIndex(list => list.id === listId);
  
  if (listIndex === -1) {
    console.error('Shopping list not found:', {
      providedListId: listId,
      availableLists: shoppingLists.map(list => ({ id: list.id, name: list.name }))
    });
    // Create a new list if none exists
    const newList = await addNewShoppingList(0);
    listIndex = 0; // The new list is added at the beginning of the array
    console.log('Created new shopping list:', newList.id);
  }
  
  // Categorize ingredients
  const categorizedIngredients = {};
  ingredients.forEach(ingredient => {
    const category = ingredient.category || 'Sonstiges';
    if (!categorizedIngredients[category]) {
      categorizedIngredients[category] = [];
    }
    
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${ingredient.name.toLowerCase().replace(/\s+/g, '-')}`;
    
    // Check for duplicates by name in the specific list and category
    const existingCategory = shoppingLists[listIndex].categories.find(c => c.category === category);
    const existingItem = existingCategory?.items.find(
      item => item.name.toLowerCase() === ingredient.name.toLowerCase()
    );
    
    if (existingItem) {
      // Update existing item but keep its original ID
      categorizedIngredients[category].push({
        ...ingredient,
        id: existingItem.id,
        checked: existingItem.checked
      });
    } else {
      // Add new item with unique ID
      categorizedIngredients[category].push({
        ...ingredient,
        id: uniqueId,
        checked: false
      });
    }
  });
  
  // Update categories in the shopping list
  Object.entries(categorizedIngredients).forEach(([categoryName, items]) => {
    const categoryIndex = shoppingLists[listIndex].categories.findIndex(
      category => category.category === categoryName
    );
    
    if (categoryIndex !== -1) {
      // Add new items to existing category
      const existingItems = shoppingLists[listIndex].categories[categoryIndex].items;
      items.forEach(newItem => {
        const existingItemIndex = existingItems.findIndex(
          item => item.name.toLowerCase() === newItem.name.toLowerCase()
        );
        if (existingItemIndex === -1) {
          existingItems.push(newItem);
        }
      });
    } else {
      // Create new category with items
      shoppingLists[listIndex].categories.push({
        category: categoryName,
        items: items
      });
    }
  });

  await saveShoppingLists();
  return shoppingLists[listIndex];
};

// Toggle item check status
export const toggleItemCheck = async (listId, categoryName, itemId) => {
  await loadShoppingLists();
  
  const listIndex = shoppingLists.findIndex(list => list.id === listId);
  if (listIndex !== -1) {
    const categoryIndex = shoppingLists[listIndex].categories.findIndex(
      category => category.category === categoryName
    );
    
    if (categoryIndex !== -1) {
      const itemIndex = shoppingLists[listIndex].categories[categoryIndex].items.findIndex(
        item => item.id === itemId
      );
      
      if (itemIndex !== -1) {
        shoppingLists[listIndex].categories[categoryIndex].items[itemIndex].checked = 
          !shoppingLists[listIndex].categories[categoryIndex].items[itemIndex].checked;
        
        await saveShoppingLists();
      }
    }
  }
};

// Delete all items from a list
export const deleteAllItems = async (listId) => {
  await loadShoppingLists();
  
  const listIndex = shoppingLists.findIndex(list => list.id === listId);
  if (listIndex !== -1) {
    // Reset categories to empty array but maintain the list structure
    shoppingLists[listIndex] = {
      ...shoppingLists[listIndex],
      categories: []
    };
    await saveShoppingLists();
  }
};

// Delete individual item from a list
export const deleteItem = async (listId, categoryName, itemId) => {
  await loadShoppingLists();
  
  const listIndex = shoppingLists.findIndex(list => list.id === listId);
  if (listIndex !== -1) {
    const categoryIndex = shoppingLists[listIndex].categories.findIndex(
      category => category.category === categoryName
    );
    
    if (categoryIndex !== -1) {
      // Remove the item
      shoppingLists[listIndex].categories[categoryIndex].items = 
        shoppingLists[listIndex].categories[categoryIndex].items.filter(
          item => item.id !== itemId
        );
      
      // If category is empty after deletion, remove the category
      if (shoppingLists[listIndex].categories[categoryIndex].items.length === 0) {
        shoppingLists[listIndex].categories = shoppingLists[listIndex].categories.filter(
          (_, index) => index !== categoryIndex
        );
      }
      
      await saveShoppingLists();
    }
  }
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
