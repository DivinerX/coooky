import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Modal, Image, ActivityIndicator, Alert } from 'react-native';
import { Mic, Send, X, ShoppingCart, ChevronRight } from 'lucide-react-native';
import { Platform } from 'react-native';
import { Message } from '@/types';
import { AnimatedGeneratingMessage } from './AnimatedGeneratingMessage';
import { useState } from 'react';
import i18n from '@/utils/i18n';
import React from 'react';

interface IChatModalProps {
  isGeneratingRecipes: boolean;
  chatModalVisible: boolean;
  setChatModalVisible: (visible: boolean) => void;
  isWeeklyPlanning: boolean;
  currentMessage: string;
  setCurrentMessage: (message: string) => void;
  isRecording: boolean;
  toggleRecording: () => void;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  handleSendMessage: () => void;
  handleSurpriseMe: () => void;
  handleRecipeCountOption: (count: number) => void;
  handleServingsOption: (servings: number | 'custom') => void;
  generatedRecipes: any[];
  addToShoppingList: () => Promise<void>;
  navigateToShoppingList: () => void;
  startCookingRecipe: (recipe: any) => void;
  scrollViewRef: any;
  addToWeekPlan: () => void;
}

export const ChatModal = ({
  isGeneratingRecipes,
  chatModalVisible,
  setChatModalVisible,
  isWeeklyPlanning,
  currentMessage,
  setCurrentMessage,
  isRecording,
  toggleRecording,
  messages,
  setMessages,
  handleSendMessage,
  handleSurpriseMe,
  handleRecipeCountOption,
  handleServingsOption,
  generatedRecipes,
  addToShoppingList,
  navigateToShoppingList,
  startCookingRecipe,
  scrollViewRef,
  addToWeekPlan,
}: IChatModalProps) => {
  const [showNavigateToShoppingList, setShowNavigateToShoppingList] = useState(false);

  const handleAddToShoppingList = async () => {
    try {
      await addToShoppingList();
      setShowNavigateToShoppingList(true);
    } catch (error) {
      Alert.alert(
        i18n.t('shopping.error'),
        i18n.t('shopping.ingredientsNotAdded')
      );
    }
  };

  const ProgressIndicator = ({ stage, progress }: { stage: string, progress: number }) => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${progress}%` }
          ]}
        />
      </View>
    </View>
  );

  return (
    < Modal
      visible={chatModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setChatModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isWeeklyPlanning ? i18n.t('chat.weeklyPlanning') : i18n.t('chat.cookingAssistant')}
            </Text>
            <TouchableOpacity onPress={() => setChatModalVisible(false)}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.chatContainer}
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message: Message) => (
              <View key={message.id} style={styles.messageWrapper}>
                <View
                  style={[
                    styles.messageBubble,
                    message.isUser ? styles.userMessage : styles.aiMessage
                  ]}
                >
                  <Text style={[
                    styles.messageText,
                    message.isUser ? styles.userMessageText : styles.aiMessageText
                  ]}>
                    {message.text}
                  </Text>

                  {message.isGenerating && (
                    <View style={styles.generatingContainer}>
                      {message.progressStage && (
                        <>
                          <ProgressIndicator
                            stage={message.progressStage}
                            progress={message.progressPercent || 0}
                          />
                          <AnimatedGeneratingMessage
                            message={message.progressStage}
                            style={styles.messageText}
                          />
                        </>
                      )}
                      <ActivityIndicator
                        size="small"
                        color="#FF6B35"
                        style={styles.loadingIndicator}
                      />
                    </View>
                  )}
                </View>

                {/* Show "Überrasch mich" option after first question */}
                {!message.isUser && message.showSurpriseMe && (
                  <TouchableOpacity
                    style={styles.surpriseMeButton}
                    onPress={handleSurpriseMe}
                  >
                    <Text style={styles.surpriseMeText}>{i18n.t('chat.surpriseMe')}</Text>
                  </TouchableOpacity>
                )}

                {/* Recipe count options */}
                {!message.isUser && message.recipeCountOptions && (
                  <View style={styles.optionsContainer}>
                    {[2, 3, 4, 5].map((count) => (
                      <TouchableOpacity
                        key={count}
                        style={styles.optionButton}
                        onPress={() => handleRecipeCountOption(count)}
                      >
                        <Text style={styles.optionText}>{count}x</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Servings options */}
                {!message.isUser && message.servingsOptions && (
                  <View style={styles.optionsContainer}>
                    {[2, 3, 4].map((servings) => (
                      <TouchableOpacity
                        key={servings}
                        style={styles.optionButton}
                        onPress={() => handleServingsOption(servings)}
                      >
                        <Text style={styles.optionText}>{servings}x</Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                      style={styles.optionButton}
                      onPress={() => handleServingsOption('custom')}
                    >
                      <Text style={styles.optionText}>{i18n.t('chat.custom')}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}

            {/* Display generated recipes */}
            {generatedRecipes.length > 0 && (
              <View style={styles.generatedRecipesContainer}>
                <Text style={styles.generatedRecipesTitle}>{i18n.t('chat.generatedRecipes')}</Text>

                {generatedRecipes.map((recipe: any) => (
                  <TouchableOpacity
                    key={recipe.id}
                    style={styles.recipeCard}
                    onPress={() => startCookingRecipe(recipe)}
                  >
                    <Image source={{ uri: recipe.image }} style={styles.recipeCardImage} />
                    <View style={styles.recipeCardContent}>
                      <Text style={styles.recipeCardTitle}>{recipe.title}</Text>
                      <Text style={styles.recipeCardTime}>{recipe.time}</Text>
                      <Text style={styles.recipeCardPortions}>{recipe.servings} {i18n.t('chat.portions')}</Text>
                    </View>
                    <ChevronRight size={24} color="#DDD" />
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={styles.addToWeekPlanButton}
                  onPress={async () => {
                    try {
                      await addToWeekPlan();
                      Alert.alert(
                        i18n.t('chat.success'),
                        i18n.t('chat.recipesAddedToWeekPlan')
                      );
                    } catch (error) {
                      Alert.alert(
                        i18n.t('chat.error'),
                        i18n.t('chat.recipesNotAddedToWeekPlan')
                      );
                    }
                  }}
                >
                  <Text style={styles.addToWeekPlanButtonText}>
                    {i18n.t('chat.addToWeekPlan')}
                  </Text>
                </TouchableOpacity>

                {
                  showNavigateToShoppingList ? (
                    <TouchableOpacity
                      style={styles.shoppingListButton}
                      onPress={navigateToShoppingList}
                    >
                      <ShoppingCart size={16} color="#FFF" style={styles.shoppingListButtonIcon} />
                      <Text style={styles.shoppingListButtonText}>{i18n.t('chat.shoppingList')}</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.shoppingListButton}
                      onPress={handleAddToShoppingList}
                    >
                      <ShoppingCart size={16} color="#FFF" style={styles.shoppingListButtonIcon} />
                      <Text style={styles.shoppingListButtonText}>{i18n.t('chat.addToShoppingList')}</Text>
                    </TouchableOpacity>
                  )
                }
              </View>
            )}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.messageInput}
              placeholder={i18n.t('chat.writeMessage')}
              value={currentMessage}
              onChangeText={setCurrentMessage}
              onSubmitEditing={handleSendMessage}
              multiline
              editable={!isGeneratingRecipes}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                isRecording && styles.recordingActive,
                isGeneratingRecipes && styles.buttonDisabled
              ]}
              onPress={isGeneratingRecipes ? undefined : (isRecording ? toggleRecording : currentMessage.trim() ? handleSendMessage : toggleRecording)}
              disabled={isGeneratingRecipes}
            >
              {isRecording ? (
                <Mic size={20} color="#FFF" />
              ) : currentMessage.trim() === '' ? (
                <Mic size={20} color="#FFF" />
              ) : (
                <Send size={20} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal >
  );
};


const styles = StyleSheet.create({
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  chatContainer: {
    flex: 1,
    padding: 15,
  },
  messageWrapper: {
    marginBottom: 15,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#FF6B35',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    backgroundColor: '#F0F0F0',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    ...(Platform.OS === 'web' ? {
      transition: 'opacity 0.3s ease-in-out' as any
    } : {})
  },
  userMessageText: {
    color: '#FFF',
  },
  aiMessageText: {
    color: '#333',
  },
  loadingIndicator: {
    marginTop: 10,
    transform: [{ scale: 1.2 }], // Make the loading indicator slightly larger
  },
  surpriseMeButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  surpriseMeText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
  optionButton: {
    backgroundColor: '#E8F0FE',
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#D0E1F9',
  },
  optionText: {
    fontSize: 14,
    color: '#4A6572',
  },
  shoppingListButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  shoppingListButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  shoppingListButtonIcon: {
    marginRight: 5,
  },
  inputContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageInput: {
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    flex: 1,
    marginRight: 10,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#FF6B35',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingActive: {
    backgroundColor: '#FF3B30',
  },
  buttonDisabled: {
    backgroundColor: '#CCC',
  },
  generatedRecipesContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  generatedRecipesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  recipeCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  recipeCardImage: {
    width: 80,
    height: 80,
  },
  recipeCardContent: {
    flex: 1,
    padding: 12,
  },
  recipeCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  recipeCardTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  recipeCardPortions: {
    fontSize: 14,
    color: '#666',
  },
  progressContainer: {
    marginTop: 10,
    marginBottom: 10,
    width: '100%',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 3,
    ...(Platform.OS === 'web' ? {
      transition: 'width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' as any // Bouncy effect
    } : {})
  },
  generatingContainer: {
    width: '100%',
    alignItems: 'center',
    padding: 10,
  },
  addToWeekPlanButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 20,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  addToWeekPlanButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
