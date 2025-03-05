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
import i18n from '../../utils/i18n';

// Define cuisine categories
const CUISINE_CATEGORIES = [
  { id: 'asian', name: i18n.t('categories.asian'), icon: '🍜' },
  { id: 'italian', name: i18n.t('categories.italian'), icon: '🍝' },
  { id: 'mediterranean', name: i18n.t('categories.mediterranean'), icon: '🥗' },
  { id: 'german', name: i18n.t('categories.german'), icon: '🥨' },
  { id: 'mexican', name: i18n.t('categories.mexican'), icon: '🌮' },
  { id: 'vegetarian', name: i18n.t('categories.vegetarian'), icon: '🥦' },
  { id: 'quick', name: i18n.t('categories.quick'), icon: '⏱️' }
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
        i18n.t('chat.initialMessage') :
        i18n.t('chat.recipeRequestMessage'),
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
              text: i18n.t('chat.analyzingPreferences'),
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
              }${i18n.t('chat.recipeRequestMessage')}`,
              isUser: false
            };
            setMessages(prev => [...prev, confirmMessage]);
          } catch (error) {
            console.error('Error processing preferences:', error);
            const errorMessage: Message = {
              id: Date.now().toString(),
              text: i18n.t('chat.errorProcessingPreferences'),
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
          text: i18n.t('chat.recipeCountMessage'),
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
            text: i18n.t('chat.servingsMessage'),
            isUser: false,
            servingsOptions: true
          };
          setMessages(prev => [...prev, servingsPrompt]);
        } else {
          const retryPrompt: Message = {
            id: Date.now().toString(),
            text: i18n.t('chat.recipeCountMessage'),
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
            text: i18n.t('chat.servingsMessage'),
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
      text: i18n.t('chat.surpriseMe'),
      isUser: true,
    };

    setMessages(prev => [...prev, userMessage]);

    // Add AI response about the selected cuisine
    setTimeout(() => {
      const cuisineResponse = {
        id: Date.now().toString(),
        text: i18n.t('chat.surpriseMeMessage', { cuisine: randomCuisine.name.toLowerCase(), icon: randomCuisine.icon }),
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
        text: i18n.t('chat.servingsMessage'),
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
            text: i18n.t('chat.servingMessage', { servings, recipeCount }),
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
        { message: i18n.t('chat.progress.startRecipeSearch'), progress: 5 },
        { message: i18n.t('chat.progress.searchCookbooks'), progress: 15 },
        { message: i18n.t('chat.progress.analyzeIngredients'), progress: 25 },
        { message: i18n.t('chat.progress.createRecipeDrafts'), progress: 35 },
        { message: i18n.t('chat.progress.optimizeIngredientList'), progress: 45 },
        { message: i18n.t('chat.progress.refineSpices'), progress: 55 },
        { message: i18n.t('chat.progress.calculateQuantities'), progress: 65 },
        { message: i18n.t('chat.progress.checkCombinations'), progress: 75 },
        { message: i18n.t('chat.progress.finalizeRecipes'), progress: 85 },
        { message: i18n.t('chat.progress.prepareSuggestions'), progress: 95 }
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
          updateProgressMessage(i18n.t('chat.serveFinishedRecipes'), p);
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Update final message
        setMessages(prev => prev.map(msg => {
          if (msg.text.startsWith('Gerne. Ich plane mit') && msg.isGenerating) {
            return {
              ...msg,
              isGenerating: false,
              progressStage: i18n.t('chat.finishedRecipes'),
              progressPercent: 100
            };
          }
          return msg;
        }));

        // Prepare recipe list text
        // let recipeListText = `Hier sind ${result.recipes.length} Rezepte basierend auf deinen Wünschen:\n\n`;
        let recipeListText = i18n.t('chat.generatedRecipesResult', { count: result.recipes.length });
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
      updateProgressMessage(i18n.t('chat.soupBurnt'), 0);
      console.error('Error generating recipes:', error);
      const errorResponse: Message = {
        id: Date.now().toString(),
        // text: `Es gab ein Problem bei der Generierung der Rezepte: ${error.message || 'Unbekannter Fehler'}. Bitte versuche es später noch einmal.`,
        text: i18n.t('chat.errorGeneratingRecipes', { error: error.message}),
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
      text: servings === 'custom' ? i18n.t('chat.customize') : `${servings}x`,
      isUser: true,
    };
    setMessages(prev => [...prev, userMessage]);

    if (servings === 'custom') {
      setTimeout(() => {
        const aiResponse: Message = {
          id: Date.now().toString(),
          text: i18n.t('chat.pleaseSpecifyHowManyPortions'),
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
        text: i18n.t('chat.shoppingListUpdated'),
        isUser: false,
      };
      setMessages(prev => [...prev, confirmationMessage]);
    } catch (error) {
      console.error('Error adding to shopping list:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: i18n.t('chat.errorAddingToShoppingList'),
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
        text: i18n.t('chat.recipesAddedToWeekPlan'),
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
          <Text style={styles.greeting}>{i18n.t('common.greeting')}</Text>
          <Text style={styles.title}>{i18n.t('common.whatToCook')}</Text>

          <View style={styles.planningOptions}>
            <TouchableOpacity
              style={styles.planningOption}
              onPress={() => openChatModal(false)}
            >
              <Text style={styles.planningOptionText}>
                {i18n.t('common.singleRecipe')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.planningOption, styles.planningOptionSecondary]}
              onPress={() => openChatModal(true)}
            >
              <Text style={styles.planningOptionText}>
                {i18n.t('common.weeklyPlanning')}
              </Text>
              <Calendar size={16} color="#FFF" style={styles.planningOptionIcon} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => openChatModal(false)}
          >
            <View style={styles.chatButtonContent}>
              <Text style={styles.chatButtonText}>
                {i18n.t('common.whatToCook')}
              </Text>
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
