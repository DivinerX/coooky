import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, Alert, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, Plus, ShoppingBag, Trash2, ChevronDown, ChevronRight, Calendar, X } from 'lucide-react-native';
import PlatformIcon from '@/components/PlatformIcon';
import { getShoppingLists, addNewShoppingList, deleteAllItems, toggleItemCheck, addToShoppingList, deleteItem, moveItemToCategory } from '@/utils/shoppingListManager';
import { useFocusEffect } from '@react-navigation/native';
import i18n from '@/utils/i18n';
import { ShoppingList } from '@/types';

export default function ShoppingScreen() {
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [newItem, setNewItem] = useState('');
  const [showChecked, setShowChecked] = useState(true);
  const [expandedList, setExpandedList] = useState<string | null>(null);
  const [weekSelectorVisible, setWeekSelectorVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  useFocusEffect(
    useCallback(() => {
      loadShoppingLists();
    }, [])
  );

  const loadShoppingLists = async () => {
    const lists = await getShoppingLists();
    setShoppingLists(lists as ShoppingList[]);
    
    // Only set expandedList if it's not already set
    if (!expandedList && lists.length > 0) {
      setExpandedList(lists[0].id);
    }
  };

  const handleToggleItemCheck = async (listId: string, categoryName: string, itemId: string) => {
    await toggleItemCheck(listId, categoryName, itemId);
    // Reload lists to get updated state
    await loadShoppingLists(); // Reload the lists after toggling
  };

  const addNewItem = async () => {
    if (newItem.trim() === '' || !expandedList) return;
    
    const ingredient = {
      name: newItem,
      amount: '',
      category: 'other'
    };
    
    await addToShoppingList([ingredient], expandedList);
    await loadShoppingLists();
    setNewItem('');
  };

  const toggleListExpansion = (listId: string) => {
    setExpandedList(expandedList === listId ? null : listId);
  };

  const toggleShowChecked = () => {
    setShowChecked(!showChecked);
  };

  const confirmDeleteAll = (listId: string) => {
    // Show confirmation dialog
    if (Platform.OS === 'web') {
      if (window.confirm(i18n.t('common.deleteAllConfirmationMessage'))) {
        handleDeleteAllItems(listId);
      }
    } else {
      Alert.alert(
        i18n.t('common.deleteAllConfirmationTitle'),
        i18n.t('common.deleteAllConfirmationMessage'),
        [
          {
            text: i18n.t('common.cancel'),
            style: 'cancel'
          },
          {
            text: i18n.t('common.delete'),
            onPress: () => handleDeleteAllItems(listId),
            style: 'destructive'
          }
        ]
      );
    }
  };

  const handleDeleteAllItems = async (listId: string) => {
    await deleteAllItems(listId);
    await loadShoppingLists(); // Reload the lists after deletion
  };
  
  const createNewWeek = async (weeksAhead: number) => {
    const newList = await addNewShoppingList(weeksAhead);
    setShoppingLists(await getShoppingLists());
    setExpandedList(newList.id);
    setWeekSelectorVisible(false);
  };

  const handleDeleteItem = async (listId: string, categoryName: string, itemId: string) => {
    // Show confirmation dialog
    if (Platform.OS === 'web') {
      if (window.confirm(i18n.t('common.deleteItemConfirmationMessage'))) {
        await deleteItem(listId, categoryName, itemId);
        await loadShoppingLists();
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
              await deleteItem(listId, categoryName, itemId);
              await loadShoppingLists();
            },
            style: 'destructive'
          }
        ]
      );
    }
  };

  const renderShoppingList = (list: ShoppingList) => {
    const isExpanded = expandedList === list.id;
    
    return (
      <View key={list.id} style={styles.listContainer}>
        <TouchableOpacity 
          style={styles.listHeader} 
          onPress={() => toggleListExpansion(list.id)}
        >
          <View style={styles.listHeaderLeft}>
            <PlatformIcon icon={ShoppingBag} size={20} color="#FF6B35" style={styles.listIcon} />
            <Text style={styles.listTitle}>{i18n.t('common.week')} {list.name}</Text>
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
                  {showChecked ? i18n.t('shopping.hideCompleted') : i18n.t('shopping.showCompleted')}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.addItemContainer}>
              <TextInput
                style={styles.addItemInput}
                placeholder={i18n.t('shopping.addItemPlaceholder')}
                value={newItem}
                onChangeText={setNewItem}
                onSubmitEditing={addNewItem}
              />
              <TouchableOpacity style={styles.addItemButton} onPress={addNewItem}>
                <PlatformIcon icon={Plus} size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
            
            {list.categories.map((category: any) => {
              const filteredItems = showChecked 
                ? category.items 
                : category.items.filter((item: any) => !item.checked);
              
              if (filteredItems.length === 0) return null;
              
              return (
                <View key={category.category} style={styles.categoryContainer}>
                  <Text style={styles.categoryTitle}>{i18n.t(`categories.${category.category}`)}</Text>
                  
                  {filteredItems.map((item: any) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.itemRow}
                      onPress={() => handleToggleItemCheck(list.id, category.category, item.id)}
                      onLongPress={() => {
                        // Show category selection modal
                        setSelectedItem({ listId: list.id, categoryName: category.category, item });
                        setCategoryModalVisible(true);
                      }}
                      delayLongPress={200}
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
                          {item.amount ? ` ${item.amount}` : ''}
                        </Text>
                      </View>
                      
                      <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => handleDeleteItem(list.id, category.category, item.id)}
                      >
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
              <Text style={styles.deleteAllText}>{i18n.t('shopping.deleteAll')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.addWeekButtonCollapsed}
            onPress={() => setWeekSelectorVisible(true)}
          >
            <PlatformIcon icon={Plus} size={16} color="#FF6B35" />
            <Text style={styles.addWeekButtonText}>{i18n.t('shopping.addWeek')}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{i18n.t('shopping.title')}</Text>
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
              {i18n.t('shopping.noLists')}
            </Text>
            <TouchableOpacity 
              style={styles.addWeekButtonEmpty}
              onPress={() => setWeekSelectorVisible(true)}
            >
              <PlatformIcon icon={Plus} size={16} color="#FFF" />
              <Text style={styles.addWeekButtonEmptyText}>{i18n.t('shopping.addWeek')}</Text>
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
              <Text style={styles.modalTitle}>{i18n.t('shopping.selectWeek')}</Text>
              <TouchableOpacity onPress={() => setWeekSelectorVisible(false)}>
                <PlatformIcon icon={X} size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>{i18n.t('shopping.addNewWeek')}</Text>
            
            <View style={styles.weekOptions}>
              <TouchableOpacity 
                style={styles.weekOption}
                onPress={() => createNewWeek(1)}
              >
                <Text style={styles.weekOptionText}>{i18n.t('shopping.nextWeek')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.weekOption}
                onPress={() => createNewWeek(2)}
              >
                <Text style={styles.weekOptionText}>{i18n.t('shopping.twoWeeks')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.weekOption}
                onPress={() => createNewWeek(3)}
              >
                <Text style={styles.weekOptionText}>{i18n.t('shopping.threeWeeks')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.weekOption}
                onPress={() => createNewWeek(4)}
              >
                <Text style={styles.weekOptionText}>{i18n.t('shopping.fourWeeks')}</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>{i18n.t('shopping.existingWeeks')}</Text>
            
            <ScrollView style={styles.existingWeeks}>
              {shoppingLists.map((list: any) => (
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
                    {i18n.t('common.week')} {list.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Category Selection Modal */}
      <Modal
        visible={categoryModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{i18n.t('shopping.selectCategory')}</Text>
              <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                <PlatformIcon icon={X} size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.categoryList}>
              {['fruitVegetables', 'dairyProducts', 'meatFish', 'grainProducts', 'spices', 'oilsVinegar', 'legumes', 'other'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryOption,
                    selectedItem?.categoryName === cat && styles.categoryOptionSelected
                  ]}
                  onPress={async () => {
                    if (selectedItem) {
                      // Move item to new category
                      await moveItemToCategory(
                        selectedItem.listId,
                        selectedItem.categoryName,
                        selectedItem.item.id,
                        cat
                      );
                      await loadShoppingLists();
                      setCategoryModalVisible(false);
                      setSelectedItem(null);
                    }
                  }}
                >
                  <Text style={[
                    styles.categoryOptionText,
                    selectedItem?.categoryName === cat && styles.categoryOptionTextSelected
                  ]}>
                    {i18n.t(`categories.${cat}`)}
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
  categoryList: {
    maxHeight: 400,
  },
  categoryOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoryOptionSelected: {
    backgroundColor: '#F0F0F0',
  },
  categoryOptionText: {
    fontSize: 16,
    color: '#333',
  },
  categoryOptionTextSelected: {
    color: '#FF6B35',
  },
});
