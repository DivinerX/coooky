import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, Alert, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, Plus, Share2, ShoppingBag, Trash2, ChevronDown, ChevronRight, Calendar, X } from 'lucide-react-native';
import PlatformIcon from '../../components/PlatformIcon';
import { getShoppingLists, addNewShoppingList } from '../../utils/shoppingListManager';

export default function ShoppingScreen() {
  const [shoppingLists, setShoppingLists] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [showChecked, setShowChecked] = useState(true);
  const [expandedList, setExpandedList] = useState(null);
  const [weekSelectorVisible, setWeekSelectorVisible] = useState(false);
  
  useEffect(() => {
    // Load shopping lists when component mounts
    const lists = getShoppingLists();
    setShoppingLists(lists);
    
    // If there's a current week list, expand it by default
    if (lists.length > 0) {
      setExpandedList(lists[0].id);
    }
  }, []);

  const toggleItemCheck = (listId, categoryName, itemId) => {
    const updatedLists = [...shoppingLists];
    const listIndex = updatedLists.findIndex(list => list.id === listId);
    
    if (listIndex !== -1) {
      const categoryIndex = updatedLists[listIndex].categories.findIndex(
        category => category.category === categoryName
      );
      
      if (categoryIndex !== -1) {
        const itemIndex = updatedLists[listIndex].categories[categoryIndex].items.findIndex(
          item => item.id === itemId
        );
        
        if (itemIndex !== -1) {
          updatedLists[listIndex].categories[categoryIndex].items[itemIndex].checked = 
            !updatedLists[listIndex].categories[categoryIndex].items[itemIndex].checked;
          
          setShoppingLists(updatedLists);
        }
      }
    }
  };

  const addNewItem = () => {
    if (newItem.trim() === '' || !expandedList) return;
    
    const updatedLists = [...shoppingLists];
    const listIndex = updatedLists.findIndex(list => list.id === expandedList);
    
    if (listIndex !== -1) {
      // Add to "Sonstiges" category for simplicity
      let sonstigesIndex = updatedLists[listIndex].categories.findIndex(
        category => category.category === 'Sonstiges'
      );
      
      // Create Sonstiges category if it doesn't exist
      if (sonstigesIndex === -1) {
        updatedLists[listIndex].categories.push({
          category: 'Sonstiges',
          items: []
        });
        sonstigesIndex = updatedLists[listIndex].categories.length - 1;
      }
      
      updatedLists[listIndex].categories[sonstigesIndex].items.push({
        id: Date.now().toString(),
        name: newItem,
        amount: '',
        checked: false
      });
      
      setShoppingLists(updatedLists);
      setNewItem('');
    }
  };

  const toggleListExpansion = (listId) => {
    setExpandedList(expandedList === listId ? null : listId);
  };

  const toggleShowChecked = () => {
    setShowChecked(!showChecked);
  };

  const confirmDeleteAll = (listId) => {
    // Show confirmation dialog
    if (Platform.OS === 'web') {
      if (window.confirm('Wirklich alles löschen?')) {
        deleteAllItems(listId);
      }
    } else {
      Alert.alert(
        'Einkaufsliste leeren',
        'Wirklich alles löschen?',
        [
          {
            text: 'Abbrechen',
            style: 'cancel'
          },
          {
            text: 'Löschen',
            onPress: () => deleteAllItems(listId),
            style: 'destructive'
          }
        ]
      );
    }
  };

  const deleteAllItems = (listId) => {
    const updatedLists = [...shoppingLists];
    const listIndex = updatedLists.findIndex(list => list.id === listId);
    
    if (listIndex !== -1) {
      // Clear all items from all categories
      updatedLists[listIndex].categories.forEach(category => {
        category.items = [];
      });
      
      // Remove empty categories
      updatedLists[listIndex].categories = updatedLists[listIndex].categories.filter(
        category => category.items.length > 0
      );
      
      setShoppingLists(updatedLists);
    }
  };
  
  const createNewWeek = (weeksAhead) => {
    const newList = addNewShoppingList(weeksAhead);
    setShoppingLists([newList, ...shoppingLists]);
    setExpandedList(newList.id);
    setWeekSelectorVisible(false);
  };

  const renderShoppingList = (list) => {
    const isExpanded = expandedList === list.id;
    
    return (
      <View key={list.id} style={styles.listContainer}>
        <TouchableOpacity 
          style={styles.listHeader} 
          onPress={() => toggleListExpansion(list.id)}
        >
          <View style={styles.listHeaderLeft}>
            <PlatformIcon icon={ShoppingBag} size={20} color="#FF6B35" style={styles.listIcon} />
            <Text style={styles.listTitle}>{list.name}</Text>
          </View>
          <PlatformIcon 
            icon={isExpanded ? ChevronDown : ChevronRight} 
            size={20} 
            color="#666" 
          />
        </TouchableOpacity>
        
        {isExpanded ? (
          <View style={styles.listContent}>
            <View style={styles.listActions}>
              <TouchableOpacity style={styles.actionButton} onPress={toggleShowChecked}>
                <Text style={styles.actionButtonText}>
                  {showChecked ? 'Erledigte ausblenden' : 'Erledigte anzeigen'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.shareButton}>
                <PlatformIcon icon={Share2} size={16} color="#666" />
                <Text style={styles.shareButtonText}>Teilen</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.addItemContainer}>
              <TextInput
                style={styles.addItemInput}
                placeholder="Artikel hinzufügen..."
                value={newItem}
                onChangeText={setNewItem}
                onSubmitEditing={addNewItem}
              />
              <TouchableOpacity style={styles.addItemButton} onPress={addNewItem}>
                <PlatformIcon icon={Plus} size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
            
            {list.categories.map((category) => {
              // Filter out checked items if showChecked is false
              const filteredItems = showChecked 
                ? category.items 
                : category.items.filter(item => !item.checked);
              
              if (filteredItems.length === 0) return null;
              
              return (
                <View key={category.category} style={styles.categoryContainer}>
                  <Text style={styles.categoryTitle}>{category.category}</Text>
                  
                  {filteredItems.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.itemRow}
                      onPress={() => toggleItemCheck(list.id, category.category, item.id)}
                    >
                      <View style={styles.checkboxContainer}>
                        <View style={[
                          styles.checkbox,
                          item.checked && styles.checkboxChecked
                        ]}>
                          {item.checked && <PlatformIcon icon={Check} size={14} color="#FFF" />}
                        </View>
                      </View>
                      
                      <View style={styles.itemInfo}>
                        <Text style={[
                          styles.itemName,
                          item.checked && styles.itemNameChecked
                        ]}>
                          {item.name}
                        </Text>
                        {item.amount && (
                          <Text style={styles.itemAmount}>{item.amount}</Text>
                        )}
                      </View>
                      
                      <TouchableOpacity style={styles.deleteButton}>
                        <PlatformIcon icon={Trash2} size={16} color="#CCC" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              );
            })}
            
            <TouchableOpacity 
              style={styles.deleteAllButton}
              onPress={() => confirmDeleteAll(list.id)}
            >
              <PlatformIcon icon={Trash2} size={18} color="#FFF" style={styles.deleteAllIcon} />
              <Text style={styles.deleteAllText}>Alles löschen</Text>
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
        <Text style={styles.title}>Einkaufsliste</Text>
        <TouchableOpacity 
          style={styles.addWeekButton}
          onPress={() => setWeekSelectorVisible(true)}
        >
          <PlatformIcon icon={Calendar} size={20} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {shoppingLists.length > 0 ? (
          shoppingLists.map(renderShoppingList)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Keine Einkaufslisten vorhanden. Erstelle eine neue Liste oder plane deine Woche.
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
              {shoppingLists.map((list) => (
                <TouchableOpacity 
                  key={list.id}
                  style={[
                    styles.existingWeekItem,
                    expandedList === list.id && styles.existingWeekItemActive
                  ]}
                  onPress={() => {
                    setExpandedList(list.id);
                    setWeekSelectorVisible(false);
                  }}
                >
                  <PlatformIcon icon={ShoppingBag} size={16} color={expandedList === list.id ? "#FFF" : "#666"} />
                  <Text style={[
                    styles.existingWeekText,
                    expandedList === list.id && styles.existingWeekTextActive
                  ]}>
                    {list.name}
                  </Text>
                </TouchableOpacity>
              ))}
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  listContainer: {
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
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  listHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listIcon: {
    marginRight: 10,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  listContent: {
    padding: 15,
  },
  listActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  actionButton: {
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#666',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  addItemContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  addItemInput: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  addItemButton: {
    backgroundColor: '#FF6B35',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  checkboxContainer: {
    marginRight: 15,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: '#333',
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  itemAmount: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  deleteButton: {
    padding: 10,
  },
  deleteAllButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  deleteAllText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  deleteAllIcon: {
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
});