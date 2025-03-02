import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Plus, ChevronRight, Pencil, Trash2, ChevronDown, X, ChevronUp, TriangleAlert as AlertTriangle, ChefHat } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import PlatformIcon from '../../components/PlatformIcon';
import { getWeekPlans, addNewWeekPlan, moveRecipe, deleteRecipe } from '../../utils/weekPlanManager';
import { setCurrentRecipe } from '../../utils/recipeManager';

export default function PlannerScreen() {
  const router = useRouter();
  const [weekPlans, setWeekPlans] = useState([]);
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [weekSelectorVisible, setWeekSelectorVisible] = useState(false);
  const [moveModalVisible, setMoveModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [cookModalVisible, setCookModalVisible] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [targetDay, setTargetDay] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  useEffect(() => {
    // Load week plans when component mounts
    const plans = getWeekPlans();
    setWeekPlans(plans);
    
    // If there's a current week plan, expand it by default
    if (plans.length > 0) {
      setExpandedWeek(plans[0].id);
    }
  }, []);

  const toggleWeekExpansion = (weekId) => {
    setExpandedWeek(expandedWeek === weekId ? null : weekId);
  };

  const createNewWeek = (weeksAhead) => {
    const newPlan = addNewWeekPlan(weeksAhead);
    setWeekPlans([newPlan, ...weekPlans]);
    setExpandedWeek(newPlan.id);
    setWeekSelectorVisible(false);
  };

  const handleMoveRecipe = () => {
    if (!selectedRecipe || !targetDay) return;
    
    const updatedPlans = [...weekPlans];
    const weekIndex = updatedPlans.findIndex(week => week.id === expandedWeek);
    
    if (weekIndex !== -1) {
      // Move recipe in the week plan
      moveRecipe(
        expandedWeek,
        selectedDay,
        targetDay,
        selectedRecipe
      );
      
      // Update state with the new plans
      const updatedWeekPlans = getWeekPlans();
      setWeekPlans(updatedWeekPlans);
    }
    
    // Reset and close modal
    setSelectedRecipe(null);
    setSelectedDay(null);
    setTargetDay(null);
    setMoveModalVisible(false);
  };

  const handleDeleteRecipe = (weekId, day, recipeId) => {
    // Show confirmation dialog
    if (Platform.OS === 'web') {
      if (window.confirm('Rezept wirklich löschen?')) {
        deleteRecipe(weekId, day, recipeId); // Pass all three parameters
        
        // Update state with the new plans
        const updatedWeekPlans = getWeekPlans();
        setWeekPlans(updatedWeekPlans);
      }
    } else {
      Alert.alert(
        'Rezept löschen',
        'Rezept wirklich löschen?',
        [
          {
            text: 'Abbrechen',
            style: 'cancel'
          },
          {
            text: 'Löschen',
            onPress: () => {
              deleteRecipe(weekId, day, recipeId); // Pass all three parameters
              
              // Update state with the new plans
              const updatedWeekPlans = getWeekPlans();
              setWeekPlans(updatedWeekPlans);
            },
            style: 'destructive'
          }
        ]
      );
    }
  };

  const openMoveModal = (day, recipe) => {
    setSelectedDay(day);
    setSelectedRecipe(recipe);
    setMoveModalVisible(true);
  };

  const openEditModal = (day, recipe) => {
    setSelectedDay(day);
    setSelectedRecipe(recipe);
    setEditModalVisible(true);
  };

  const openCookModal = (recipe) => {
    setSelectedRecipe(recipe);
    setCookModalVisible(true);
  };

  const startCooking = () => {
    if (selectedRecipe) {
      // Set the current recipe in the recipe manager
      setCurrentRecipe(selectedRecipe);
      
      // Close the modal and navigate to the cook screen
      setCookModalVisible(false);
      router.push('/cook');
    }
  };

  const renderRecipeItem = (weekId, day, recipe) => {
    if (!recipe) return null;
    
    return (
      <TouchableOpacity 
        style={styles.recipeItem} 
        key={`${day}-${recipe.id}`}
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

  const renderDayRecipes = (weekId, day) => {
    const weekIndex = weekPlans.findIndex(week => week.id === weekId);
    if (weekIndex === -1) return null;
    
    const dayRecipes = weekPlans[weekIndex].days[day];
    if (!dayRecipes) return null;
    
    const hasRecipes = dayRecipes.length > 0;
    
    return (
      <View style={styles.dayContainer} key={`${weekId}-${day}`}>
        <Text style={styles.dayTitle}>{day}</Text>
        
        {hasRecipes ? (
          <View style={styles.recipesContainer}>
            {dayRecipes.map(recipe => renderRecipeItem(weekId, day, recipe))}
          </View>
        ) : (
          <TouchableOpacity style={styles.addMealButton}>
            <Plus size={20} color="#FF6B35" />
            <Text style={styles.addMealText}>Rezept hinzufügen</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderWeekPlan = (weekPlan) => {
    const isExpanded = expandedWeek === weekPlan.id;
    
    return (
      <View key={weekPlan.id} style={styles.weekContainer}>
        <TouchableOpacity 
          style={styles.weekHeader} 
          onPress={() => toggleWeekExpansion(weekPlan.id)}
        >
          <View style={styles.weekHeaderLeft}>
            <PlatformIcon icon={Calendar} size={20} color="#FF6B35" style={styles.weekIcon} />
            <Text style={styles.weekTitle}>{weekPlan.name}</Text>
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
            
            <TouchableOpacity style={styles.generateButton}>
              <Text style={styles.generateButtonText}>KI-Vorschläge generieren</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.shoppingListButton}
              onPress={() => router.push('/shopping')}
            >
              <Text style={styles.shoppingListText}>Zur Einkaufsliste</Text>
              <ChevronRight size={16} color="#FF6B35" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.addWeekButtonCollapsed}
            onPress={() => setWeekSelectorVisible(true)}
          >
            <PlatformIcon icon={Plus} size={16} color="#FF6B35" />
            <Text style={styles.addWeekButtonText}>Woche hinzufügen</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Wochenplan</Text>
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
              Keine Wochenpläne vorhanden. Erstelle einen neuen Wochenplan oder plane deine Woche.
            </Text>
            <TouchableOpacity 
              style={styles.addWeekButtonEmpty}
              onPress={() => setWeekSelectorVisible(true)}
            >
              <PlatformIcon icon={Plus} size={16} color="#FFF" />
              <Text style={styles.addWeekButtonEmptyText}>Woche hinzufügen</Text>
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
              <Text style={styles.modalTitle}>Woche auswählen</Text>
              <TouchableOpacity onPress={() => setWeekSelectorVisible(false)}>
                <PlatformIcon icon={X} size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>Neue Woche hinzufügen:</Text>
            
            <View style={styles.weekOptions}>
              <TouchableOpacity 
                style={styles.weekOption}
                onPress={() => createNewWeek(1)}
              >
                <Text style={styles.weekOptionText}>Nächste Woche</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.weekOption}
                onPress={() => createNewWeek(2)}
              >
                <Text style={styles.weekOptionText}>In 2 Wochen</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.weekOption}
                onPress={() => createNewWeek(3)}
              >
                <Text style={styles.weekOptionText}>In 3 Wochen</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.weekOption}
                onPress={() => createNewWeek(4)}
              >
                <Text style={styles.weekOptionText}>In 4 Wochen</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>Vorhandene Wochen:</Text>
            
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
                    {plan.name}
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
              <Text style={styles.modalTitle}>Rezept verschieben</Text>
              <TouchableOpacity onPress={() => setMoveModalVisible(false)}>
                <PlatformIcon icon={X} size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {selectedRecipe && (
              <View style={styles.selectedRecipeContainer}>
                <Image source={{ uri: selectedRecipe.image }} style={styles.selectedRecipeImage} />
                <Text style={styles.selectedRecipeTitle}>{selectedRecipe.title}</Text>
                <Text style={styles.selectedRecipeInfo}>
                  Aktuell: {selectedDay}
                </Text>
              </View>
            )}
            
            <Text style={styles.modalSubtitle}>Ziel auswählen:</Text>
            
            <View style={styles.moveOptionsContainer}>
              <Text style={styles.moveOptionLabel}>Tag:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelector}>
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
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.moveButton,
                !targetDay && styles.moveButtonDisabled
              ]}
              onPress={handleMoveRecipe}
              disabled={!targetDay}
            >
              <Text style={styles.moveButtonText}>Verschieben</Text>
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
              <Text style={styles.modalTitle}>Rezept bearbeiten</Text>
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
                Hinweis: Durch die Bearbeitung des Rezepts kann sich die Zutatenzusammensetzung ändern. 
                Dies kann Auswirkungen auf Ihre Einkaufsliste haben.
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => {
                setCurrentRecipe(selectedRecipe);
                setEditModalVisible(false);
                router.push('/cook');
              }}
            >
              <Text style={styles.editButtonText}>Rezept bearbeiten</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Abbrechen</Text>
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
              <Text style={styles.modalTitle}>Rezept kochen</Text>
              <TouchableOpacity onPress={() => setCookModalVisible(false)}>
                <PlatformIcon icon={X} size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {selectedRecipe && (
              <View style={styles.selectedRecipeContainer}>
                <Image source={{ uri: selectedRecipe.image }} style={styles.selectedRecipeImage} />
                <Text style={styles.selectedRecipeTitle}>{selectedRecipe.title}</Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.cookButton}
              onPress={startCooking}
            >
              <PlatformIcon icon={ChefHat} size={20} color="#FFF" style={styles.cookButtonIcon} />
              <Text style={styles.cookButtonText}>Jetzt kochen</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setCookModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Abbrechen</Text>
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
  },
  moveOptionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  daySelector: {
    marginBottom: 15,
  },
  daySelectorItem: {
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  daySelectorItemActive: {
    backgroundColor: '#FF6B35',
  },
  daySelectorText: {
    fontSize: 14,
    color: '#333',
  },
  daySelectorTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
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