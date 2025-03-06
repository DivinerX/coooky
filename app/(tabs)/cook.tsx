import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play, Pause, SkipBack, SkipForward, Minus, Plus, Clock, Calendar, ChevronRight, X } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import PlatformIcon from '../../components/PlatformIcon';
import { getAllRecipes, getCurrentRecipe, getRecipeById, setCurrentRecipe } from '../../utils/recipeManager';
import { loadWeekPlans } from '../../utils/weekPlanManager';
import i18n from '@/utils/i18n';
import { Recipe } from '@/types';

export default function CookScreen() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [servings, setServings] = useState(2);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recipeModalVisible, setRecipeModalVisible] = useState(false);
  const [weekPlans, setWeekPlans] = useState([]);
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null);
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load the current recipe if available
        const currentRecipe = await getCurrentRecipe();
        if (currentRecipe) {
          // If the recipe doesn't have ingredients or steps, try to get the full recipe data
          if (!currentRecipe.ingredients || !currentRecipe.steps) {
            const fullRecipe = await getRecipeById(currentRecipe.id);
            if (fullRecipe) {
              setRecipe(fullRecipe);
              setServings(fullRecipe.servings || 2);
            } else {
              setRecipe(currentRecipe);
            }
          } else {
            setRecipe(currentRecipe);
            setServings(currentRecipe.servings || 2);
          }
        } else {
          // If no current recipe, show the recipe selection modal
          setRecipeModalVisible(true);
        }

        // Load all recipes
        const recipes = await getAllRecipes();
        setAllRecipes(recipes);

        // Load week plans for recipe selection
        const plans = await loadWeekPlans();
        setWeekPlans(plans);
        if (plans.length > 0) {
          setExpandedWeek(plans[0].id);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    loadInitialData();

    // Clean up speech when component unmounts
    return () => {
      if (Platform.OS !== 'web') {
        Speech.stop();
      }
    };
  }, []);

  const speakStep = () => {
    if (!recipe || !recipe.steps || recipe.steps.length === 0) return;
    
    if (Platform.OS !== 'web') {
      Speech.speak(recipe.steps[currentStep], {
        language: 'de',
        onDone: () => {
          if (isPlaying && currentStep < recipe.steps.length - 1) {
            setTimeout(() => {
              nextStep();
            }, 2000);
          }
        },
      });
    }
  };

  const togglePlayPause = () => {
    if (!recipe || !recipe.steps || recipe.steps.length === 0) return;
    
    if (isPlaying) {
      if (Platform.OS !== 'web') {
        Speech.stop();
      }
    } else {
      speakStep();
    }
    setIsPlaying(!isPlaying);
  };

  const prevStep = () => {
    if (!recipe || !recipe.steps || recipe.steps.length === 0) return;
    
    if (currentStep > 0) {
      if (Platform.OS !== 'web') {
        Speech.stop();
      }
      setCurrentStep(currentStep - 1);
      setIsPlaying(false);
    }
  };

  const nextStep = () => {
    if (!recipe || !recipe.steps || recipe.steps.length === 0) return;
    
    if (currentStep < recipe.steps.length - 1) {
      if (Platform.OS !== 'web') {
        Speech.stop();
      }
      setCurrentStep(currentStep + 1);
      setIsPlaying(false);
    }
  };

  const increaseServings = () => {
    setServings(servings + 1);
  };

  const decreaseServings = () => {
    if (servings > 1) {
      setServings(servings - 1);
    }
  };

  // Calculate adjusted ingredient amounts based on servings
  const getAdjustedAmount = (amount) => {
    if (!recipe || !recipe.servings) return amount;
    
    if (amount.includes('g')) {
      const numericPart = parseInt(amount);
      return `${Math.round((numericPart * servings) / recipe.servings)}g`;
    } else if (amount.includes('ml')) {
      const numericPart = parseInt(amount);
      return `${Math.round((numericPart * servings) / recipe.servings)}ml`;
    } else if (amount.includes('Stück')) {
      const numericPart = parseInt(amount);
      return `${Math.round((numericPart * servings) / recipe.servings)} Stück`;
    }
    return amount;
  };

  const selectRecipe = async (selectedRecipe: Recipe) => {
    try {
      // Get the full recipe data if needed
      const fullRecipe = await getRecipeById(selectedRecipe.id);
      if (fullRecipe) {
        setRecipe(fullRecipe);
        setServings(fullRecipe.servings || 2);
        await setCurrentRecipe(fullRecipe);
      } else {
        setRecipe(selectedRecipe);
        setServings(selectedRecipe.servings || 2);
        await setCurrentRecipe(selectedRecipe);
      }
      
      setCurrentStep(0);
      setIsPlaying(false);
      setRecipeModalVisible(false);
    } catch (error) {
      console.error('Error selecting recipe:', error);
    }
  };

  const toggleWeekExpansion = (weekId) => {
    setExpandedWeek(expandedWeek === weekId ? null : weekId);
    setExpandedDay(null);
  };

  const toggleDayExpansion = (day) => {
    setExpandedDay(expandedDay === day ? null : day);
  };

  const renderWeekPlanRecipes = () => {
    return (
      <View style={styles.recipeListContainer}>
        <View style={styles.recipeListHeader}>
          <PlatformIcon icon={Calendar} size={16} color="#333" style={styles.recipeListHeaderIcon} />
          <Text style={styles.recipeListHeaderText}>{i18n.t('cook.weekPlan')}</Text>
        </View>
        
        {weekPlans.map((weekPlan) => (
          <View key={weekPlan.id} style={styles.weekPlanItem}>
            <TouchableOpacity 
              style={styles.weekPlanHeader}
              onPress={() => toggleWeekExpansion(weekPlan.id)}
            >
              <Text style={styles.weekPlanTitle}>{weekPlan.name}</Text>
              <PlatformIcon 
                icon={expandedWeek === weekPlan.id ? ChevronRight : ChevronRight} 
                size={16} 
                color="#666" 
                style={[
                  styles.weekPlanIcon,
                  expandedWeek === weekPlan.id && { transform: [{ rotate: '90deg' }] }
                ]} 
              />
            </TouchableOpacity>
            
            {expandedWeek === weekPlan.id && (
              <View style={styles.weekPlanContent}>
                {Object.entries(weekPlan.days).map(([day, recipes]) => (
                  <View key={day} style={styles.dayItem}>
                    <TouchableOpacity 
                      style={styles.dayHeader}
                      onPress={() => toggleDayExpansion(day)}
                    >
                      <Text style={styles.dayTitle}>{day}</Text>
                      {recipes.length > 0 && (
                        <Text style={styles.recipeCount}>{recipes.length} Rezepte</Text>
                      )}
                    </TouchableOpacity>
                    
                    {expandedDay === day && recipes.length > 0 && (
                      <View style={styles.dayRecipes}>
                        {recipes.map((recipe) => (
                          <TouchableOpacity 
                            key={recipe.id}
                            style={styles.recipeListItem}
                            onPress={() => selectRecipe(recipe)}
                          >
                            <Image source={{ uri: recipe.image }} style={styles.recipeListItemImage} />
                            <View style={styles.recipeListItemInfo}>
                              <Text style={styles.recipeListItemTitle}>{recipe.title}</Text>
                              <Text style={styles.recipeListItemMeta}>{recipe.time}</Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderAllRecipes = () => {
    return (
      <View style={styles.recipeListContainer}>
        <View style={styles.recipeListHeader}>
          <PlatformIcon icon={ChevronRight} size={16} color="#333" style={styles.recipeListHeaderIcon} />
          <Text style={styles.recipeListHeaderText}>{i18n.t('cook.allRecipes')}</Text>
        </View>
        
        <FlatList
          data={allRecipes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.recipeListItem}
              onPress={() => selectRecipe(item)}
            >
              <Image source={{ uri: item.image }} style={styles.recipeListItemImage} />
              <View style={styles.recipeListItemInfo}>
                <Text style={styles.recipeListItemTitle}>{item.title}</Text>
                <Text style={styles.recipeListItemMeta}>{item.time}</Text>
              </View>
            </TouchableOpacity>
          )}
          scrollEnabled={false}
        />
      </View>
    );
  };

  // If no recipe is selected, show a loading state
  if (!recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{i18n.t('cook.pleaseSelectRecipe')}</Text>
          <TouchableOpacity 
            style={styles.selectRecipeButton}
            onPress={() => setRecipeModalVisible(true)}
          >
            <Text style={styles.selectRecipeButtonText}>{i18n.t('cook.selectRecipe')}</Text>
          </TouchableOpacity>
        </View>

        {/* Recipe Selection Modal */}
        <Modal
          visible={recipeModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setRecipeModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{i18n.t('cook.selectRecipe')}</Text>
                <TouchableOpacity onPress={() => setRecipeModalVisible(false)}>
                  <PlatformIcon icon={X} size={24} color="#333" />
                </TouchableOpacity>
              </View>
              
              <ScrollView>
                {renderWeekPlanRecipes()}
                {renderAllRecipes()}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: recipe.image }} style={styles.recipeImage} />

        <View style={styles.recipeHeader}>
          <Text style={styles.recipeTitle}>{recipe.title}</Text>
          <View style={styles.recipeMetaContainer}>
            <View style={styles.recipeMeta}>
              <Clock size={16} color="#666" />
              <Text style={styles.recipeMetaText}>{recipe.time}</Text>
            </View>
          </View>
        </View>

        <View style={styles.servingsContainer}>
          <Text style={styles.sectionTitle}>{i18n.t('cook.portions')}</Text>
          <View style={styles.servingsControls}>
            <TouchableOpacity style={styles.servingsButton} onPress={decreaseServings}>
              <Minus size={20} color="#FF6B35" />
            </TouchableOpacity>
            <Text style={styles.servingsText}>{servings}</Text>
            <TouchableOpacity style={styles.servingsButton} onPress={increaseServings}>
              <Plus size={20} color="#FF6B35" />
            </TouchableOpacity>
          </View>
        </View>

        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <View style={styles.ingredientsContainer}>
            <Text style={styles.sectionTitle}>{i18n.t('cook.ingredients')}</Text>
            {recipe.ingredients.map((ingredient) => (
              <View key={ingredient.id} style={styles.ingredientRow}>
                <Text style={styles.ingredientName}>{ingredient.name}</Text>
                <Text style={styles.ingredientAmount}>{getAdjustedAmount(ingredient.amount)}</Text>
              </View>
            ))}
          </View>
        )}

        {recipe.steps && recipe.steps.length > 0 && (
          <View style={styles.stepsContainer}>
            <Text style={styles.sectionTitle}>{i18n.t('cook.stepByStepInstructions')}</Text>
            <View style={styles.stepCard}>
              <Text style={styles.stepNumber}>{i18n.t('cook.step')} {currentStep + 1} {i18n.t('cook.of')} {recipe.steps.length}</Text>
              <Text style={styles.stepText}>{recipe.steps[currentStep]}</Text>

              <View style={styles.stepControls}>
                <TouchableOpacity style={styles.stepButton} onPress={prevStep} disabled={currentStep === 0}>
                  <SkipBack size={24} color={currentStep === 0 ? '#CCC' : '#333'} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
                  {isPlaying ? (
                    <Pause size={24} color="#FFF" />
                  ) : (
                    <Play size={24} color="#FFF" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.stepButton} onPress={nextStep} disabled={currentStep === recipe.steps.length - 1}>
                  <SkipForward size={24} color={currentStep === recipe.steps.length - 1 ? '#CCC' : '#333'} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.stepProgress}>
              {recipe.steps.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.stepDot,
                    index === currentStep && styles.stepDotActive,
                  ]}
                  onPress={() => {
                    setCurrentStep(index);
                    setIsPlaying(false);
                    if (Platform.OS !== 'web') {
                      Speech.stop();
                    }
                  }}
                />
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={styles.changeRecipeButton}
          onPress={() => setRecipeModalVisible(true)}
        >
          <Text style={styles.changeRecipeButtonText}>{i18n.t('cook.changeRecipe')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Recipe Selection Modal */}
      <Modal
        visible={recipeModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setRecipeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{i18n.t('cook.selectRecipe')}</Text>
              <TouchableOpacity onPress={() => setRecipeModalVisible(false)}>
                <PlatformIcon icon={X} size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView>
              {renderWeekPlanRecipes()}
              {renderAllRecipes()}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  selectRecipeButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  selectRecipeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recipeImage: {
    width: '100%',
    height: 250,
  },
  recipeHeader: {
    padding: 20,
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  recipeMetaContainer: {
    flexDirection: 'row',
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  recipeMetaText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  servingsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  servingsControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  servingsButton: {
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  servingsText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 15,
  },
  ingredientsContainer: {
    padding: 20,
    backgroundColor: '#FFF',
    marginBottom: 15,
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  ingredientName: {
    fontSize: 16,
    color: '#333',
  },
  ingredientAmount: {
    fontSize: 16,
    color: '#666',
  },
  stepsContainer: {
    padding: 20,
    backgroundColor: '#FFF',
    marginBottom: 30,
  },
  stepCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 15,
    padding: 20,
    marginTop: 15,
    marginBottom: 20,
  },
  stepNumber: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  stepText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 20,
  },
  stepControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepButton: {
    padding: 10,
  },
  playButton: {
    backgroundColor: '#FF6B35',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  stepProgress: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#DDD',
    margin: 5,
  },
  stepDotActive: {
    backgroundColor: '#FF6B35',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  changeRecipeButton: {
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 30,
  },
  changeRecipeButtonText: {
    color: '#666',
    fontSize: 16,
  },
  // Recipe Selection Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    width: '90%',
    maxWidth: 400,
    height: '80%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    fontSize: 20,
    color: '#666',
    padding: 5,
  },
  recipeListContainer: {
    marginBottom: 20,
  },
  recipeListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  recipeListHeaderIcon: {
    marginRight: 8,
  },
  recipeListHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  weekPlanItem: {
    marginBottom: 15,
  },
  weekPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 8,
  },
  weekPlanTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  weekPlanIcon: {
    marginLeft: 5,
  },
  weekPlanContent: {
    paddingLeft: 10,
  },
  dayItem: {
    marginTop: 8,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  dayTitle: {
    fontSize: 14,
    color: '#333',
  },
  recipeCount: {
    fontSize: 12,
    color: '#666',
  },
  dayRecipes: {
    paddingLeft: 10,
  },
  recipeListItem: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  recipeListItemImage: {
    width: 80,
    height: 80,
  },
  recipeListItemInfo: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  recipeListItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  recipeListItemMeta: {
    fontSize: 14,
    color: '#666',
  },
});
