import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ScreenWrapper } from '../../../shared/components/layouts/ScreenWrapper';
import { CustomButton } from '../../../shared/components/Button/CustomButton';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../theme/theme';

const creditData = {
  currentLimit: 20000,
  availableCredit: 5000,
  usedCredit: 15000,
  nextPaymentDue: '2024-02-28',
  nextPaymentAmount: 2500,
  recentActivity: [
    {
      id: '1',
      type: 'Purchase',
      amount: 1450,
      date: '2024-02-01',
      provider: 'Tech Supplies Co'
    },
    {
      id: '2',
      type: 'Payment',
      amount: 2000,
      date: '2024-01-28',
      provider: 'Credit Payment'
    }
  ]
};

export const CreditAccountScreen = () => {
  return (
    <ScreenWrapper>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Credit Account</Text>

        <View style={styles.creditCard}>
          <View style={styles.creditHeader}>
            <Text style={styles.creditLabel}>Credit Limit</Text>
            <Text style={styles.creditAmount}>${creditData.currentLimit}</Text>
          </View>

          <View style={styles.creditProgress}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(creditData.usedCredit / creditData.currentLimit) * 100}%` }
                ]} 
              />
            </View>
            <View style={styles.creditDetails}>
              <Text style={styles.creditDetail}>
                Available: ${creditData.availableCredit}
              </Text>
              <Text style={styles.creditDetail}>
                Used: ${creditData.usedCredit}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.nextPayment}>
          <Text style={styles.sectionTitle}>Next Payment</Text>
          <View style={styles.paymentCard}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Amount Due:</Text>
              <Text style={styles.paymentAmount}>${creditData.nextPaymentAmount}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Due Date:</Text>
              <Text style={styles.paymentDate}>{creditData.nextPaymentDue}</Text>
            </View>
            <CustomButton
              title="Make Payment"
              onPress={() => {}}
              variant="primary"
              style={styles.paymentButton}
            />
          </View>
        </View>

        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {creditData.recentActivity.map(activity => (
            <View key={activity.id} style={styles.activityCard}>
              <View style={styles.activityHeader}>
                <View style={styles.activityType}>
                  <Ionicons 
                    name={activity.type === 'Purchase' ? 'cart-outline' : 'cash-outline'} 
                    size={24} 
                    color={activity.type === 'Purchase' ? theme.colors.error : theme.colors.success}
                  />
                  <Text style={styles.activityTypeText}>{activity.type}</Text>
                </View>
                <Text style={styles.activityAmount}>
                  {activity.type === 'Purchase' ? '-' : '+'} ${activity.amount}
                </Text>
              </View>
              <View style={styles.activityDetails}>
                <Text style={styles.activityProvider}>{activity.provider}</Text>
                <Text style={styles.activityDate}>{activity.date}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: theme.colors.text,
  },
  creditCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  creditHeader: {
    marginBottom: 20,
  },
  creditLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 4,
  },
  creditAmount: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  creditProgress: {
    marginTop: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  creditDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  creditDetail: {
    color: 'white',
    fontSize: 14,
  },
  nextPayment: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.colors.text,
  },
  paymentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  paymentLabel: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  paymentDate: {
    fontSize: 16,
    color: theme.colors.text,
  },
  paymentButton: {
    marginTop: 12,
  },
  activitySection: {
    marginBottom: 24,
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activityTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  activityAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  activityDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityProvider: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  activityDate: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});