import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { X } from 'lucide-react-native';
import PlatformIcon from './PlatformIcon';
import i18n from '@/utils/i18n';
import { SUBSCRIPTION_SKUS, purchaseSubscription } from '@/utils/purchaseManager';

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubscribe: () => void;
  products: any[];
}

export const SubscriptionModal = ({ visible, onClose, onSubscribe, products }: SubscriptionModalProps) => {
  const handlePurchase = async (sku: string) => {
    const success = await purchaseSubscription(sku);
    if (success) {
      onSubscribe();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{i18n.t('subscription.title')}</Text>
            <TouchableOpacity onPress={onClose}>
              <PlatformIcon icon={X} size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>{i18n.t('subscription.description')}</Text>

          {products.map((product) => (
            <TouchableOpacity
              key={product.productId}
              style={styles.subscriptionOption}
              onPress={() => handlePurchase(product.productId)}
            >
              <Text style={styles.optionTitle}>
                {product.productId === SUBSCRIPTION_SKUS.MONTHLY 
                  ? i18n.t('subscription.monthly') 
                  : i18n.t('subscription.annual')}
              </Text>
              <Text style={styles.price}>{product.price}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
  },
  subscriptionOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 16,
    color: '#666',
  },
}); 