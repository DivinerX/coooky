import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Plus, ChevronRight, Pencil, Trash2, ChevronDown, X, ChevronUp, TriangleAlert as AlertTriangle, ChefHat } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import PlatformIcon from '@/components/PlatformIcon';
import { addNewWeekPlan, moveRecipe, deleteRecipe, loadWeekPlans } from '@/utils/weekPlanManager';
import { setCurrentRecipe } from '@/utils/recipeManager';
import i18n, { onLanguageChange } from '@/utils/i18n';
import { Recipe, WeekPlan } from '@/types';
export default function PlannerScreen() {
  const router = useRouter();
  const [weekPlans, setWeekPlans] = useState<WeekPlan[]>([]);
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);
  const [weekSelectorVisible, setWeekSelectorVisible] = useState(false);
  const [moveModalVisible, setMoveModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [cookModalVisible, setCookModalVisible] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [targetDay, setTargetDay] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [, forceUpdate] = useState(0);

  // Add language change subscription
  useEffect(() => {
    const unsubscribe = onLanguageChange(() => {
      forceUpdate(prev => prev + 1);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Load week plans when component mounts
    const initWeekPlans = async () => {
      const plans = await loadWeekPlans();
      setWeekPlans(plans);
      
      // If there's a current week plan, expand it by default
      if (plans.length > 0) {
        setExpandedWeek(plans[0].id);
      }
    };

    initWeekPlans();
  }, []);

  const toggleWeekExpansion = (weekId: string) => {
    setExpandedWeek(expandedWeek === weekId ? null : weekId);
  };

  const createNewWeek = async (weeksAhead: number) => {
    try {
      // Add new week plan and get updated plans
      const newPlan = await addNewWeekPlan(weeksAhead);
      const updatedPlans = await loadWeekPlans(); // Get fresh plans from storage
      
      setWeekPlans(updatedPlans);
      setExpandedWeek(newPlan.id);
      setWeekSelectorVisible(false);
    } catch (error) {
      console.error('Error creating new week:', error);
      // Optionally add error handling here (e.g., show alert to user)
    }
  };

  const handleMoveRecipe = async () => {
    if (!selectedRecipe || !targetDay) return;
    
    const updatedPlans = [...weekPlans];
    const weekIndex = updatedPlans.findIndex(week => week.id === expandedWeek);
    
    if (weekIndex !== -1) {
      // Move recipe in the week plan
      await moveRecipe(
        expandedWeek,
        selectedDay,
        targetDay,
        selectedRecipe
      );
      
      // Update state with the new plans
      const updatedWeekPlans = await loadWeekPlans();
      setWeekPlans(updatedWeekPlans);
    }
    
    // Reset and close modal
    setSelectedRecipe(null);
    setSelectedDay(null);
    setTargetDay(null);
    setMoveModalVisible(false);
  };

  const handleDeleteRecipe = async (weekId: string, day: string, recipeId: string) => {
    // Show confirmation dialog
    if (Platform.OS === 'web') {
      if (window.confirm(i18n.t('common.deleteItemConfirmationMessage'))) {
        await deleteRecipe(weekId, day, recipeId);
        // Use loadWeekPlans instead of getWeekPlans
        const updatedWeekPlans = await loadWeekPlans();
        setWeekPlans(updatedWeekPlans);
      }
    } else {
      Alert.alert(
        i18n.t('common.deleteItemConfirmationTitle'),
        i18n.t('common.deleteItemConfirmationMessage'),
        [
          {
            text: i18n.t('common.cancel'),
            style: 'cancel'
          },
          {
            text: i18n.t('common.delete'),
            onPress: async () => {
              await deleteRecipe(weekId, day, recipeId);
              // Use loadWeekPlans instead of getWeekPlans
              const updatedWeekPlans = await loadWeekPlans();
              setWeekPlans(updatedWeekPlans);
            },
            style: 'destructive'
          }
        ]
      );
    }
  };

  const openMoveModal = (day: string, recipe: Recipe) => {
    setSelectedDay(day);
    setSelectedRecipe(recipe);
    setMoveModalVisible(true);
  };

  const openEditModal = (day: string, recipe: Recipe) => {
    setSelectedDay(day);
    setSelectedRecipe(recipe);
    setEditModalVisible(true);
  };

  const openCookModal = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setCookModalVisible(true);
  };

  const startCooking = async () => {
    if (selectedRecipe) {
      try {
        // Set the current recipe in the recipe manager
        await setCurrentRecipe(selectedRecipe);
        
        // Close the modal
        setCookModalVisible(false);
        router.push('/cook');
      } catch (error) {
        console.error('Error starting cooking:', error);
      }
    }
  };

  const renderRecipeItem = (weekId: string, day: string, recipe: Recipe) => {
    if (!recipe) return null;
    
    return (
      <TouchableOpacity 
        style={styles.recipeItem} 
        key={`${weekId}-${day}-${recipe.id}`}
        onLongPress={() => {
          setIsDragging(true);
          openMoveModal(day, recipe);
        }}
        delayLongPress={200}
        onPress={() => openCookModal(recipe)}
      >
        <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
        <View style={styles.recipeInfo}>
          <Text style={styles.recipeTitle}>{recipe.title}</Text>
        </View>
        <View style={styles.recipeActions}>
          <TouchableOpacity 
            style={styles.recipeActionButton}
            onPress={() => openMoveModal(day, recipe)}
          >
            <View style={styles.moveIconContainer}>
              <PlatformIcon icon={ChevronUp} size={14} color="#666" />
              <PlatformIcon icon={ChevronDown} size={14} color="#666" style={styles.downArrow} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.recipeActionButton}
            onPress={() => openEditModal(day, recipe)}
          >
            <PlatformIcon icon={Pencil} size={16} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.recipeActionButton}
            onPress={() => handleDeleteRecipe(weekId, day, recipe.id)} // Passing the recipe.id
          >
            <PlatformIcon icon={Trash2} size={16} color="#666" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDayRecipes = (weekId: string, day: string) => {
    const weekIndex = weekPlans.findIndex(week => week.id === weekId);
    if (weekIndex === -1) return null;
    
    const dayRecipes = weekPlans[weekIndex].days[day];
    if (!dayRecipes) return null;
    
    const hasRecipes = dayRecipes.length > 0;
    
    return (
      <View style={styles.dayContainer} key={`${weekId}-${day}`}>
        <Text style={styles.dayTitle}>{i18n.t(`common.days.${day}`)}</Text>
        {hasRecipes ? (
          <View style={styles.recipesContainer}>
            {dayRecipes.map((recipe, index) => (
              <View key={`${weekId}-${day}-${recipe.id}-${index}`}>
                {renderRecipeItem(weekId, day, recipe)}
              </View>
            ))}
          </View>
        ) : (
          <TouchableOpacity style={styles.addMealButton}>
            <Plus size={20} color="#FF6B35" />
            <Text style={styles.addMealText}>{i18n.t('plan.addRecipe')}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderWeekPlan = (weekPlan: WeekPlan) => {
    const isExpanded = expandedWeek === weekPlan.id;
    
    return (
      <View key={weekPlan.id} style={styles.weekContainer}>
        <TouchableOpacity 
          style={styles.weekHeader} 
          onPress={() => toggleWeekExpansion(weekPlan.id)}
        >
          <View style={styles.weekHeaderLeft}>
            <PlatformIcon icon={Calendar} size={20} color="#FF6B35" style={styles.weekIcon} />
            <Text style={styles.weekTitle}>{i18n.t('common.week')} {weekPlan.name}</Text>
          </View>
          <PlatformIcon 
            icon={isExpanded ? ChevronDown : ChevronRight} 
            size={20} 
            color="#666" 
          />
        </TouchableOpacity>
        
        {isExpanded ? (
          <View style={styles.weekContent}>
            {Object.keys(weekPlan.days).map((day) => (
              renderDayRecipes(weekPlan.id, day)
            ))}
            
            <TouchableOpacity 
              style={styles.generateButton}
              onPress={() => router.push('/')}
            >
              <Text style={styles.generateButtonText}>{i18n.t('plan.generateSuggestions')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.shoppingListButton}
              onPress={() => router.push('/shopping')}
            >
              <Text style={styles.shoppingListText}>{i18n.t('plan.shoppingList')}</Text>
              <ChevronRight size={16} color="#FF6B35" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.addWeekButtonCollapsed}
            onPress={() => setWeekSelectorVisible(true)}
          >
            <PlatformIcon icon={Plus} size={16} color="#FF6B35" />
            <Text style={styles.addWeekButtonText}>{i18n.t('plan.addWeek')}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{i18n.t('plan.weekPlan')}</Text>
        <TouchableOpacity 
          style={styles.addWeekButton}
          onPress={() => setWeekSelectorVisible(true)}
        >
          <PlatformIcon icon={Calendar} size={20} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {weekPlans.length > 0 ? (
          weekPlans.map(renderWeekPlan)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {i18n.t('plan.noWeekPlans')}
            </Text>
            <TouchableOpacity 
              style={styles.addWeekButtonEmpty}
              onPress={() => setWeekSelectorVisible(true)}
            >
              <PlatformIcon icon={Plus} size={16} color="#FFF" />
              <Text style={styles.addWeekButtonEmptyText}>{i18n.t('plan.addWeek')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      
      {/* Week Selector Modal */}
      <Modal
        visible={weekSelectorVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setWeekSelectorVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{i18n.t('plan.selectWeek')}</Text>
              <TouchableOpacity onPress={() => setWeekSelectorVisible(false)}>
                <PlatformIcon icon={X} size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>{i18n.t('plan.addWeek')}:</Text>
            
            <View style={styles.weekOptions}>
              <TouchableOpacity 
                style={styles.weekOption}
                onPress={() => createNewWeek(1)}
              >
                <Text style={styles.weekOptionText}>{i18n.t('plan.nextWeek')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.weekOption}
                onPress={() => createNewWeek(2)}
              >
                <Text style={styles.weekOptionText}>{i18n.t('plan.twoWeeks')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.weekOption}
                onPress={() => createNewWeek(3)}
              >
                <Text style={styles.weekOptionText}>{i18n.t('plan.threeWeeks')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.weekOption}
                onPress={() => createNewWeek(4)}
              >
                <Text style={styles.weekOptionText}>{i18n.t('plan.fourWeeks')}</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>{i18n.t('plan.existingWeeks')}:</Text>
            
            <ScrollView style={styles.existingWeeks}>
              {weekPlans.map((plan) => (
                <TouchableOpacity 
                  key={plan.id}
                  style={[
                    styles.existingWeekItem,
                    expandedWeek === plan.id && styles.existingWeekItemActive
                  ]}
                  onPress={() => {
                    setExpandedWeek(plan.id);
                    setWeekSelectorVisible(false);
                  }}
                >
                  <PlatformIcon icon={Calendar} size={16} color={expandedWeek === plan.id ? "#FFF" : "#666"} />
                  <Text style={[
                    styles.existingWeekText,
                    expandedWeek === plan.id && styles.existingWeekTextActive
                  ]}>
                    {i18n.t('common.week')} {plan.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Move Recipe Modal */}
      <Modal
        visible={moveModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMoveModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{i18n.t('plan.moveRecipe')}</Text>
              <TouchableOpacity onPress={() => setMoveModalVisible(false)}>
                <PlatformIcon icon={X} size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {selectedRecipe && (
              <View style={styles.selectedRecipeContainer}>
                <Image source={{ uri: selectedRecipe.image }} style={styles.selectedRecipeImage} />
                <Text style={styles.selectedRecipeTitle}>{selectedRecipe.title}</Text>
                <Text style={styles.selectedRecipeInfo}>
                  {i18n.t('common.week')} {selectedDay}
                </Text>
              </View>
            )}
            
            <Text style={styles.modalSubtitle}>{i18n.t('plan.selectTargetDay')}</Text>
            
            <View style={styles.moveOptionsContainer}>
              <Text style={styles.moveOptionLabel}>{i18n.t('plan.day')}:</Text>
              <View style={styles.daySelector}>
                {Object.keys(weekPlans.find(week => week.id === expandedWeek)?.days || {}).map((day) => (
                  <TouchableOpacity 
                    key={day}
                    style={[
                      styles.daySelectorItem,
                      targetDay === day && styles.daySelectorItemActive
                    ]}
                    onPress={() => setTargetDay(day)}
                  >
                    <Text style={[
                      styles.daySelectorText,
                      targetDay === day && styles.daySelectorTextActive
                    ]}>
                      {i18n.t(`common.days.${day}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.moveButton,
                !targetDay && styles.moveButtonDisabled
              ]}
              onPress={handleMoveRecipe}
              disabled={!targetDay}
            >
              <Text style={styles.moveButtonText}>{i18n.t('common.move')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Edit Recipe Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{i18n.t('plan.editRecipe')}</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <PlatformIcon icon={X} size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {selectedRecipe && (
              <View style={styles.selectedRecipeContainer}>
                <Image source={{ uri: selectedRecipe.image }} style={styles.selectedRecipeImage} />
                <Text style={styles.selectedRecipeTitle}>{selectedRecipe.title}</Text>
              </View>
            )}
            
            <View style={styles.warningContainer}>
              <PlatformIcon icon={AlertTriangle} size={20} color="#FF6B35" style={styles.warningIcon} />
              <Text style={styles.warningText}>
                {i18n.t('plan.editRecipeWarning')}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.editButton}
              onPress={async () => {
                await setCurrentRecipe(selectedRecipe!);
                setEditModalVisible(false);
                router.push('/cook');
              }}
            >
              <Text style={styles.editButtonText}>{i18n.t('plan.editRecipe')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>{i18n.t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Cook Recipe Modal */}
      <Modal
        visible={cookModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCookModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{i18n.t('plan.cookRecipe')}</Text>
              <TouchableOpacity onPress={() => setCookModalVisible(false)}>
                <PlatformIcon icon={X} size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {selectedRecipe && (
              <View style={styles.selectedRecipeContainer}>
                <Image source={{ uri: selectedRecipe!.image }} style={styles.selectedRecipeImage} />
                <Text style={styles.selectedRecipeTitle}>{selectedRecipe!.title}</Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.cookButton}
              onPress={startCooking}
            >
              <PlatformIcon icon={ChefHat} size={20} color="#FFF" style={styles.cookButtonIcon} />
              <Text style={styles.cookButtonText}>{i18n.t('plan.cookNow')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setCookModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>{i18n.t('common.cancel')}</Text>
            </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addWeekButton: {
    padding: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  addWeekButtonEmpty: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  addWeekButtonEmptyText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  weekContainer: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  weekHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weekIcon: {
    marginRight: 10,
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  weekContent: {
    padding: 15,
  },
  dayContainer: {
    marginBottom: 20,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  recipesContainer: {
    marginBottom: 10,
  },
  recipeItem: {
    backgroundColor: '#F9F9F9',
    borderRadius: 15,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 10,
  },
  recipeImage: {
    width: 80,
    height: 80,
  },
  recipeInfo: {
    flex: 1,
    paddingHorizontal: 15,
  },
  recipeTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  recipeActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeActionButton: {
    padding: 10,
  },
  moveIconContainer: {
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downArrow: {
    marginTop: -4,
  },
  addMealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#EEE',
    borderStyle: 'dashed',
  },
  addMealText: {
    fontSize: 16,
    color: '#FF6B35',
    marginLeft: 10,
  },
  generateButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 10,
  },
  generateButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  shoppingListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shoppingListText: {
    fontSize: 16,
    color: '#FF6B35',
    marginRight: 5,
  },
  addWeekButtonCollapsed: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  addWeekButtonText: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  // Modal styles
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    marginTop: 5,
  },
  weekOptions: {
    marginBottom: 20,
  },
  weekOption: {
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  weekOptionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  existingWeeks: {
    maxHeight: 200,
  },
  existingWeekItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#F0F0F0',
  },
  existingWeekItemActive: {
    backgroundColor: '#FF6B35',
  },
  existingWeekText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  existingWeekTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  // Move Recipe Modal
  selectedRecipeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  selectedRecipeImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedRecipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  selectedRecipeInfo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  moveOptionsContainer: {
    marginBottom: 20,
    width: '100%',
  },
  moveOptionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10,
  },
  daySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    width: '100%',
  },
  daySelectorItem: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  daySelectorItemActive: {
    backgroundColor: '#FF6B35',
  },
  daySelectorText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  daySelectorTextActive: {
    color: '#FFF',
  },
  moveButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  moveButtonDisabled: {
    backgroundColor: '#CCC',
  },
  moveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Edit Recipe Modal
  warningContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF9F6',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#FFDECF',
    marginBottom: 20,
  },
  warningIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  editButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  editButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  // Cook Recipe Modal
  cookButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cookButtonIcon: {
    marginRight: 10,
  },
  cookButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
