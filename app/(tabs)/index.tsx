import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Modal, Image, FlatList, Animated, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mic, Send, X, Calendar, ShoppingCart, ChevronRight, AlertCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';
import { addToShoppingList as addItemsToShoppingList } from '../../utils/shoppingListManager';
import { generateCookingSuggestions } from '../../utils/openAiService';
import { setCurrentRecipe } from '../../utils/recipeManager';
import { Message, Recipe, ShoppingListItem } from '../../types';
import { ChatModal } from '@/components/ChatModal';

// Define cuisine categories
const CUISINE_CATEGORIES = [
  { id: 'asian', name: 'Asiatisch', icon: '🍜' },
  { id: 'italian', name: 'Italienisch', icon: '🍝' },
  { id: 'mediterranean', name: 'Mediterran', icon: '🥗' },
  { id: 'german', name: 'Deutsch', icon: '🥨' },
  { id: 'mexican', name: 'Mexikanisch', icon: '🌮' },
  { id: 'vegetarian', name: 'Vegetarisch', icon: '🥦' },
  { id: 'quick', name: 'Schnell & Einfach', icon: '⏱️' }
];

export default function MainScreen() {
  const router = useRouter();
  const [chatModalVisible, setChatModalVisible] = useState<boolean>(false);
  const [isWeeklyPlanning, setIsWeeklyPlanning] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userPreferences, setUserPreferences] = useState<string | null>(null);
  const [selectedRecipeCount, setSelectedRecipeCount] = useState<number | null>(null);
  const [selectedServings, setSelectedServings] = useState<number | null>(null);
  const [showShoppingListButton, setShowShoppingListButton] = useState(false);
  const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[]>([]);
  const [shoppingListItems, setShoppingListItems] = useState<ShoppingListItem[]>([]);
  const [isGeneratingRecipes, setIsGeneratingRecipes] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    // Keep the scroll behavior
    if (scrollViewRef.current) {
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
    }
  }, [messages]);

  const openChatModal = (isWeekly: boolean) => {
    setIsWeeklyPlanning(isWeekly);
    setChatModalVisible(true);

    // Reset state variables
    setUserPreferences('');
    setSelectedRecipeCount(null);
    setSelectedServings(null);
    setShowShoppingListButton(false);
    setGeneratedRecipes([]);

    // Set initial message based on planning type
    const initialMessage: Message = {
      id: Date.now().toString(),
      text: isWeekly
        ? "Was wollen wir diese Woche kochen? Worauf hast Du Lust?"
        : "Worauf hast Du Hunger? Was wollen wir kochen?",
      isUser: false,
      showSurpriseMe: isWeekly // Show "Überrasch mich" option for weekly planning
    };

    setMessages([initialMessage]);
  };

  const handleSendMessage = () => {
    if (currentMessage.trim() === '') return;

    // Add user message to chat
    const userMessage = {
      id: Date.now().toString(),
      text: currentMessage,
      isUser: true,
    };

    setMessages(prev => [...prev, userMessage]);

    // Store user food preferences for later recipe generation
    if (!userPreferences) {
      setUserPreferences(currentMessage);
    }

    // Process message based on current state
    processUserMessage(currentMessage);

    // Clear current message
    setCurrentMessage('');
  };

  const processUserMessage = (message: string) => {
    // If we're currently generating recipes, don't process new messages
    if (isGeneratingRecipes) return;

    // If "Überrasch mich" clicked, select a random cuisine category
    if (message.toLowerCase().includes('überrasch') && !userPreferences) {
      handleSurpriseMe();
      return;
    }

    // If user preferences set but no recipe count yet
    if (userPreferences && !selectedRecipeCount) {
      const count = parseRecipeCount(message);
      if (count) {
        handleRecipeCountSelection(count);
      } else {
        // If invalid input, ask again
        setTimeout(() => {
          const aiResponse = {
            id: Date.now().toString(),
            text: "Bitte wähle, wie viele Rezepte ich erstellen soll (2-5):",
            isUser: false,
            recipeCountOptions: true
          };
          setMessages(prev => [...prev, aiResponse]);
        }, 500);
      }
      return;
    }

    // If recipe count is selected but servings aren't
    if (selectedRecipeCount && !selectedServings) {
      const servings = parseServings(message);
      if (servings) {
        handleServingsSelection(servings);
      } else {
        // If invalid input, ask again
        setTimeout(() => {
          const aiResponse = {
            id: Date.now().toString(),
            text: "Wieviel Portionen soll ich pro Rezept planen?",
            isUser: false,
            servingsOptions: true
          };
          setMessages(prev => [...prev, aiResponse]);
        }, 500);
      }
      return;
    }

    // If no user preferences yet (first message)
    if (!userPreferences) {
      // Store the user's food preferences
      setUserPreferences(message);

      // Ask for recipe count
      setTimeout(() => {
        const aiResponse = {
          id: Date.now().toString(),
          text: `Super, wie viele Rezepte möchtest du?`,
          isUser: false,
          recipeCountOptions: true
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 500);
      return;
    }

    // Handle confirmation or changes if we already have all necessary selections
    if (userPreferences && selectedRecipeCount && selectedServings && generatedRecipes.length > 0) {
      setTimeout(() => {
        const aiResponse = {
          id: Date.now().toString(),
          text: "Möchtest du die Zutatenliste zur Einkaufsliste hinzufügen?",
          isUser: false,
          showAddToShoppingListButton: true
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 500);
    }
  };

  const handleSurpriseMe = () => {
    // Generate surprise message with random cuisine preference
    const randomIndex = Math.floor(Math.random() * CUISINE_CATEGORIES.length);
    const randomCuisine = CUISINE_CATEGORIES[randomIndex];

    // Set user preferences to the random cuisine
    setUserPreferences(`Ich möchte ${randomCuisine.name.toLowerCase()} Gerichte`);

    // Add user message "Überrasch mich" to chat
    const userMessage = {
      id: Date.now().toString(),
      text: "Überrasch mich",
      isUser: true,
    };

    setMessages(prev => [...prev, userMessage]);

    // Add AI response about the selected cuisine
    setTimeout(() => {
      const cuisineResponse = {
        id: Date.now().toString(),
        text: `Ich überrasche dich mit ${randomCuisine.icon} ${randomCuisine.name.toLowerCase()} Gerichten! Wie viele Rezepte soll ich dir vorschlagen?`,
        isUser: false,
        recipeCountOptions: true
      };
      setMessages(prev => [...prev, cuisineResponse]);
    }, 500);
  };

  const parseRecipeCount = (message: string) => {
    // Extract recipe count from message
    if (message.includes('2x')) return 2;
    if (message.includes('3x')) return 3;
    if (message.includes('4x')) return 4;
    if (message.includes('5x')) return 5;

    // Try to parse numeric values
    const match = message.match(/\d+/);
    if (match && parseInt(match[0]) >= 2 && parseInt(match[0]) <= 5) {
      return parseInt(match[0]);
    }

    return null;
  };

  const parseServings = (message: string) => {
    // Extract servings from message
    if (message.includes('2x')) return 2;
    if (message.includes('3x')) return 3;
    if (message.includes('4x')) return 4;

    // Extract custom servings from message
    if (message.includes('anpassen')) return 6; // Default to 6 for custom

    // Try to parse numeric values
    const match = message.match(/\d+/);
    if (match) {
      return parseInt(match[0]);
    }

    return null;
  };

  const handleRecipeCountSelection = (count: number): void => {
    setSelectedRecipeCount(count);
  
    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now().toString(),
        text: "Wieviel Portionen soll ich pro Rezept planen?",
        isUser: false,
        servingsOptions: true
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 500);
  };

  const handleServingsSelection = (servings: number): void => {
    setSelectedServings(servings);

    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now().toString(),
        text: `Gerne. Ich plane mit ${servings} Portionen pro Rezept und erstelle jetzt ${selectedRecipeCount} passende Rezepte für dich...`,
        isUser: false,
        isGenerating: true
      };
      setMessages(prev => [...prev, aiResponse]);

      generateRecipesWithAI(userPreferences!, selectedRecipeCount!, servings);
    }, 500);
  };

  const generateRecipesWithAI = async (
    preferences: string,
    recipeCount: number,
    servings: number
  ): Promise<void> => {
    setIsGeneratingRecipes(true);

    try {
      const result = await generateCookingSuggestions(preferences, recipeCount, servings);

      if (result && result.recipes && result.recipes.length > 0) {
        setGeneratedRecipes(result.recipes);

        // Prepare recipe list text
        let recipeListText = `Hier sind ${result.recipes.length} Rezepte basierend auf deinen Wünschen:\n\n`;
        result.recipes.forEach((recipe: { title: any; time: any; }, index: number) => {
          recipeListText += `${index + 1}. ${recipe.title} (${recipe.time})\n`;
        });

        // Send recipe list as a message
        const recipesResponse: Message = {
          id: Date.now().toString(),
          text: recipeListText,
          isUser: false,
        };
        setMessages(prev => [...prev, recipesResponse]);

        // Aggregate ingredients for shopping list
        const allIngredients: any[] = [];
        result.recipes.forEach((recipe: any) => {
          if (recipe.ingredients && recipe.ingredients.length > 0) {
            allIngredients.push(...recipe.ingredients);
          }
        });

        setShoppingListItems(allIngredients);

        // Show shopping list button immediately after recipes
        const shoppingListResponse: Message = {
          id: Date.now().toString(),
          text: "Soll ich die Zutaten auf die Einkaufsliste setzen?",
          isUser: false,
          showAddToShoppingListButton: true  // Using consistent property name
        };
        setMessages(prev => [...prev, shoppingListResponse]);
      } else {
        throw new Error('Keine Rezepte generiert');
      }
    } catch (error: any) {
      console.error('Error generating recipes:', error);
      const errorResponse: Message = {
        id: Date.now().toString(),
        text: `Es gab ein Problem bei der Generierung der Rezepte: ${error.message || 'Unbekannter Fehler'}. Bitte versuche es später noch einmal.`,
        isUser: false,
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsGeneratingRecipes(false);
    }
  };

  const handleRecipeCountOption = (count: number): void => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: `${count}x`,
      isUser: true,
    };
    setMessages(prev => [...prev, userMessage]);
    handleRecipeCountSelection(count);
  };

  const handleServingsOption = (servings: number | 'custom'): void => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: servings === 'custom' ? 'anpassen' : `${servings}x`,
      isUser: true,
    };
    setMessages(prev => [...prev, userMessage]);

    if (servings === 'custom') {
      setTimeout(() => {
        const aiResponse: Message = {
          id: Date.now().toString(),
          text: "Bitte gib an, wie viele Portionen du pro Rezept haben möchtest:",
          isUser: false,
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 500);
    } else {
      handleServingsSelection(servings);
    }
  };

  const addToShoppingList = () => {
    // Add the items to the shopping list using the shopping list manager
    if (shoppingListItems.length > 0) {
      // Create a current date to add the items to the current week's shopping list
      const today = new Date();
      addItemsToShoppingList(shoppingListItems, today);

      // Show confirmation message
      const confirmationMessage: Message = {
        id: Date.now().toString(),
        text: "Ich habe alle notwendigen Zutaten auf die Einkaufsliste geschrieben.",
        isUser: false,
        showShoppingListNavigateButton: true
      };
      setMessages(prev => [...prev, confirmationMessage]);
    }
  };

  const navigateToShoppingList = () => {
    // Close modal and navigate to shopping list
    setChatModalVisible(false);
    router.push('/shopping');
  };

  const startCookingRecipe = (recipe: Recipe): void => {
    setCurrentRecipe(recipe);
    setChatModalVisible(false);
    router.push('/cook');
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);

    // Simulate voice recording (in a real app, this would use speech recognition)
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);

        // Simulate user voice input
        const voiceText = "Ich hätte gerne etwas Vegetarisches";

        const voiceMessage: Message = {
          id: Date.now().toString(),
          text: voiceText,
          isUser: true,
        };

        setMessages(prev => [...prev, voiceMessage]);
        processUserMessage(voiceText);
      }, 2000);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.greeting}>Guten Tag!</Text>
          <Text style={styles.title}>Was möchtest du heute kochen?</Text>

          <View style={styles.planningOptions}>
            <TouchableOpacity
              style={styles.planningOption}
              onPress={() => openChatModal(false)}
            >
              <Text style={styles.planningOptionText}>Einzelnes Rezept</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.planningOption, styles.planningOptionSecondary]}
              onPress={() => openChatModal(true)}
            >
              <Text style={styles.planningOptionText}>Gesamte Woche planen</Text>
              <Calendar size={16} color="#FFF" style={styles.planningOptionIcon} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => openChatModal(false)}
          >
            <View style={styles.chatButtonContent}>
              <Text style={styles.chatButtonText}>Worauf hast Du Hunger? Was wollen wir kochen?</Text>
              <Mic size={20} color="#FF6B35" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Chat Modal */}
      <ChatModal
        isGeneratingRecipes={isGeneratingRecipes}
        chatModalVisible={chatModalVisible}
        setChatModalVisible={setChatModalVisible}
        isWeeklyPlanning={isWeeklyPlanning}
        currentMessage={currentMessage}
        setCurrentMessage={setCurrentMessage}
        isRecording={isRecording}
        toggleRecording={toggleRecording}
        messages={messages}
        setMessages={setMessages}
        handleSendMessage={handleSendMessage}
        handleSurpriseMe={handleSurpriseMe}
        handleRecipeCountOption={handleRecipeCountOption}
        handleServingsOption={handleServingsOption}
        generatedRecipes={generatedRecipes}
        addToShoppingList={addToShoppingList}
        navigateToShoppingList={navigateToShoppingList}
        startCookingRecipe={startCookingRecipe}
        scrollViewRef={scrollViewRef}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
    marginBottom: 25,
  },
  planningOptions: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  planningOption: {
    flex: 1,
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginRight: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  planningOptionSecondary: {
    backgroundColor: '#4A6572',
    marginRight: 0,
  },
  planningOptionText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  planningOptionIcon: {
    marginLeft: 8,
  },
  chatButton: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chatButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatButtonText: {
    fontSize: 16,
    color: '#666',
    flex: 1,
    marginRight: 10,
  },
});
