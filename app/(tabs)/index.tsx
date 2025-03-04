import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mic, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { addToShoppingList as addItemsToShoppingList } from '../../utils/shoppingListManager';
import { checkIfCookingRelated, generateCookingSuggestions } from '../../utils/openAiService';
import { setCurrentRecipe } from '../../utils/recipeManager';
import { Message, Recipe, ShoppingListItem } from '../../types';
import { ChatModal } from '@/components/ChatModal';
import { addRecipesToWeekPlan, addNewWeekPlan, getWeekPlans } from '@/utils/weekPlanManager';
import { loadUserPreferences, saveUserPreferences, analyzeUserInput } from '@/utils/userPreferencesManager';

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
  const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[]>([]);
  const [isGeneratingRecipes, setIsGeneratingRecipes] = useState<boolean>(false);
  const [conversationStage, setConversationStage] = useState<'initial' | 'preferences' | 'recipe_request' | 'recipe_count' | 'servings' | 'generating'>('initial');
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

  const openChatModal = async (isWeekly: boolean) => {
    setIsWeeklyPlanning(isWeekly);
    setChatModalVisible(true);
    
    // Reset all states
    setSelectedRecipeCount(null);
    setSelectedServings(null);
    setGeneratedRecipes([]);
    setUserPreferences(null);
    
    // Check if user preferences exist
    const userPrefs = await loadUserPreferences();
    
    // Set the initial conversation stage
    setConversationStage(userPrefs ? 'recipe_request' : 'initial');
    
    // Set initial message
    const initialMessage: Message = {
      id: Date.now().toString(),
      text: !userPrefs ? 
        "Bevor wir anfangen: Hast du bestimmte Ernährungsgewohnheiten oder Allergien, die ich berücksichtigen soll?" :
        "Worauf hast Du Hunger? Was wollen wir kochen?",
      isUser: false,
      showSurpriseMe: userPrefs !== null // Remove isWeeklyPlanning condition
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

  const processUserMessage = async (message: string) => {
    if (isGeneratingRecipes) return;

    // First check if we have user preferences
    const existingPrefs = await loadUserPreferences();

    switch (conversationStage) {
      case 'initial':
        if (!existingPrefs) {
          try {
            // Add a loading message
            const loadingMessage: Message = {
              id: Date.now().toString(),
              text: "Ich analysiere deine Vorlieben...",
              isUser: false,
              isLoading: true
            };
            setMessages(prev => [...prev, loadingMessage]);

            // Analyze and save the initial preferences
            const preferences = await analyzeUserInput(message);
            await saveUserPreferences(preferences);
            
            // Remove loading message and move to recipe request stage
            setMessages(prev => prev.filter(msg => !msg.isLoading));
            setConversationStage('recipe_request');
            
            // Confirm preferences were saved
            const confirmMessage: Message = {
              id: Date.now().toString(),
              text: `Ich habe deine Vorlieben gespeichert. ${
                preferences.allergies.length ? 
                `Ich werde besonders auf diese Allergien achten: ${preferences.allergies.join(', ')}. ` : 
                ''
              }Was möchtest du kochen?`,
              isUser: false
            };
            setMessages(prev => [...prev, confirmMessage]);
          } catch (error) {
            console.error('Error processing preferences:', error);
            const errorMessage: Message = {
              id: Date.now().toString(),
              text: "Entschuldigung, ich konnte deine Vorlieben nicht richtig verarbeiten. Kannst du sie bitte noch einmal anders formulieren?",
              isUser: false
            };
            setMessages(prev => prev.filter(msg => !msg.isLoading).concat(errorMessage));
          }
        }
        break;

      case 'recipe_request':
        // Save the recipe request and move to count selection
        setUserPreferences(message);
        setConversationStage('recipe_count');
        const countPrompt: Message = {
          id: Date.now().toString(),
          text: "Wie viele Rezepte möchtest du?",
          isUser: false,
          recipeCountOptions: true
        };
        setMessages(prev => [...prev, countPrompt]);
        break;

      case 'recipe_count':
        const count = parseRecipeCount(message);
        if (count) {
          setSelectedRecipeCount(count);
          setConversationStage('servings');
          const servingsPrompt: Message = {
            id: Date.now().toString(),
            text: "Wieviel Portionen soll ich pro Rezept planen?",
            isUser: false,
            servingsOptions: true
          };
          setMessages(prev => [...prev, servingsPrompt]);
        } else {
          const retryPrompt: Message = {
            id: Date.now().toString(),
            text: "Bitte wähle, wie viele Rezepte ich erstellen soll (2-5):",
            isUser: false,
            recipeCountOptions: true
          };
          setMessages(prev => [...prev, retryPrompt]);
        }
        break;

      case 'servings':
        const servings = parseServings(message);
        if (servings) {
          setSelectedServings(servings);
          setConversationStage('generating');
          generateRecipesWithAI(userPreferences!, selectedRecipeCount!, servings);
        } else {
          const retryPrompt: Message = {
            id: Date.now().toString(),
            text: "Wieviel Portionen soll ich pro Rezept planen?",
            isUser: false,
            servingsOptions: true
          };
          setMessages(prev => [...prev, retryPrompt]);
        }
        break;
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

    // Calculate total expected time (55 seconds as base + 5 seconds per recipe)
    const totalExpectedTime = 55000 + (recipeCount * 5000); // in milliseconds
    
    const updateProgressMessage = (stage: string, progress: number) => {
      setMessages(prev => prev.map(msg => {
        if (msg.text.startsWith('Gerne. Ich plane mit') && msg.isGenerating) {
          return {
            ...msg,
            text: `Gerne. Ich plane mit ${servings} Portionen pro Rezept und erstelle jetzt ${recipeCount} passende Rezepte für dich...\n\n${stage}`,
            progressStage: stage,
            progressPercent: progress,
            isGenerating: true
          };
        }
        return msg;
      }));
    };

    try {
      // Start the actual API call early
      const recipePromise = generateCookingSuggestions(preferences, recipeCount, servings);

      // Progress stages without any emojis or special characters
      const stages = [
        { message: 'Starte Rezeptsuche...', progress: 5 },
        { message: 'Durchsuche Kochbücher...', progress: 15 },
        { message: 'Analysiere Zutaten...', progress: 25 },
        { message: 'Erstelle Rezeptentwürfe...', progress: 35 },
        { message: 'Optimiere Zutatenliste...', progress: 45 },
        { message: 'Verfeinere Gewürze...', progress: 55 },
        { message: 'Berechne Mengen...', progress: 65 },
        { message: 'Prüfe Kombinationen...', progress: 75 },
        { message: 'Finalisiere Rezepte...', progress: 85 },
        { message: 'Bereite Vorschläge vor...', progress: 95 }
      ];

      // Calculate base interval between updates
      const baseInterval = Math.floor(totalExpectedTime / (stages.length + 1));

      // Function to add random variation to intervals
      const getRandomizedInterval = (baseTime: number) => {
        const variation = baseTime * 0.4; // 40% variation for more unpredictability
        return baseTime + (Math.random() * variation - variation / 2);
      };

      // Show initial stage with bounce animation
      updateProgressMessage(stages[0].message, stages[0].progress);

      // Progress through stages with randomized timing and bounce effects
      for (let i = 1; i < stages.length; i++) {
        const stage = stages[i];
        const interval = getRandomizedInterval(baseInterval);
        
        await new Promise(resolve => setTimeout(resolve, interval));
        
        // Add multiple intermediate steps with micro-animations
        const intermediateSteps = 4;
        const progressDiff = stage.progress - stages[i-1].progress;
        const smallIncrement = progressDiff / intermediateSteps;
        
        for (let j = 1; j <= intermediateSteps; j++) {
          const intermediateProgress = stages[i-1].progress + (smallIncrement * j);
          
          // Add random "bounce" effect
          const bounceVariation = Math.sin(j * Math.PI / 2) * 2;
          const adjustedProgress = Math.min(100, Math.max(0, intermediateProgress + bounceVariation));
          
          updateProgressMessage(stage.message, adjustedProgress);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Settle on the actual target progress
        updateProgressMessage(stage.message, stage.progress);
      }

      // Wait for the API response
      const result = await recipePromise;

      if (result && result.recipes && result.recipes.length > 0) {
        setGeneratedRecipes(result.recipes);

        // Smooth transition to completion
        for (let p = 95; p <= 100; p++) {
          updateProgressMessage('✨ Serviere die fertigen Rezepte...', p);
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Update final message
        setMessages(prev => prev.map(msg => {
          if (msg.text.startsWith('Gerne. Ich plane mit') && msg.isGenerating) {
            return {
              ...msg,
              isGenerating: false,
              progressStage: '🎉 Fertig! Lass es dir schmecken!',
              progressPercent: 100
            };
          }
          return msg;
        }));

        // Prepare recipe list text
        let recipeListText = `Hier sind ${result.recipes.length} Rezepte basierend auf deinen Wünschen:\n\n`;
        result.recipes.forEach((recipe: { title: any; time: any; }, index: number) => {
          recipeListText += `${index + 1}. ${recipe.title} (${recipe.time})\n`;
        });

        // Add success message
        const successResponse: Message = {
          id: Date.now().toString(),
          text: recipeListText,
          isUser: false,
        };
        setMessages(prev => [...prev, successResponse]);
      } else {
        throw new Error('Keine Rezepte generiert');
      }
    } catch (error: any) {
      updateProgressMessage('❌ Ups! Die Suppe ist angebrannt...', 0);
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

  const addToShoppingList = async () => {
    try {
      if (!generatedRecipes || generatedRecipes.length === 0) return;

      // Extract ingredients from generated recipes
      const ingredients = generatedRecipes.flatMap(recipe => 
        recipe.ingredients.map(ingredient => ({
          name: ingredient.name,
          amount: ingredient.amount || '',
          unit: ingredient.unit || '',
          category: ingredient.category || 'Sonstiges'
        }))
      );

      // Add ingredients to shopping list
      await addItemsToShoppingList(ingredients);

      // Show confirmation message
      const confirmationMessage: Message = {
        id: Date.now().toString(),
        text: "Ich habe alle notwendigen Zutaten auf die Einkaufsliste geschrieben.",
        isUser: false,
      };
      setMessages(prev => [...prev, confirmationMessage]);
    } catch (error) {
      console.error('Error adding to shopping list:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Es gab ein Problem beim Hinzufügen der Zutaten zur Einkaufsliste.",
        isUser: false
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const navigateToShoppingList = async () => {
    // Close modal and navigate to shopping list
    setChatModalVisible(false);
    
    // Small delay to ensure the modal is closed before navigation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Navigate to shopping list
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

  const handleAddToWeekPlan = async () => {
    // Create a new week plan if none exists
    const weekPlans = getWeekPlans();
    let currentWeekPlan;
    
    if (weekPlans.length === 0) {
      currentWeekPlan = await addNewWeekPlan(0); // Create plan for current week
    } else {
      currentWeekPlan = weekPlans[0]; // Use the most recent week plan
    }

    // Add the generated recipes to the week plan
    const success = await addRecipesToWeekPlan(currentWeekPlan.id, generatedRecipes);

    if (success) {
      // Add a success message to the chat
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: 'Die Rezepte wurden erfolgreich zum Wochenplan hinzugefügt.',
        isUser: false,
      }]);

      // Optional: Navigate to the planner screen
      router.push('/planner');
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
        addToWeekPlan={handleAddToWeekPlan}
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
