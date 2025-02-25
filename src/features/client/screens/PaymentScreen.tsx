import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenWrapper } from '../../../shared/components/layouts/ScreenWrapper';
import { CustomButton } from '../../../shared/components/Button/CustomButton';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../theme/theme';

const paymentHistory = [
  {
    id: '1',
    invoiceId: 'INV-2024-001',
    amount: '$1,450',
    date: '2024-02-01',
    provider: 'Tech Supplies Co',
    method: 'Credit Card',
    status: 'Completed'
  },
  {
    id: '2',
    invoiceId: 'INV-2024-002',
    amount: '$780',
    date: '2024-01-28',
    provider: 'Office Solutions',
    method: 'Bank Transfer',
    status: 'Processing'
  }
];

export const PaymentScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'completed' | 'processing'>('all');

  const filteredPayments = paymentHistory.filter(payment => {
    if (selectedFilter === 'all') return true;
    return payment.status.toLowerCase() === selectedFilter;
  });

  return (
    <ScreenWrapper>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Payment History</Text>

        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={[styles.filterButton, selectedFilter === 'all' && styles.activeFilter]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text style={[styles.filterText, selectedFilter === 'all' && styles.activeFilterText]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, selectedFilter === 'completed' && styles.activeFilter]}
            onPress={() => setSelectedFilter('completed')}
          >
            <Text style={[styles.filterText, selectedFilter === 'completed' && styles.activeFilterText]}>Completed</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, selectedFilter === 'processing' && styles.activeFilter]}
            onPress={() => setSelectedFilter('processing')}
          >
            <Text style={[styles.filterText, selectedFilter === 'processing' && styles.activeFilterText]}>Processing</Text>
          </TouchableOpacity>
        </View>

        {filteredPayments.map(payment => (
          <View key={payment.id} style={styles.paymentCard}>
            <View style={styles.paymentHeader}>
              <View>
                <Text style={styles.providerName}>{payment.provider}</Text>
                <Text style={styles.invoiceId}>{payment.invoiceId}</Text>
              </View>
              <Text style={styles.amount}>{payment.amount}</Text>
            </View>
            
            <View style={styles.paymentDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.detailText}>{payment.date}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="card-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.detailText}>{payment.method}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: payment.status === 'Completed' ? theme.colors.success + '20' : theme.colors.error + '20' }]}>
                <Text style={[styles.statusText, { color: payment.status === 'Completed' ? theme.colors.success : theme.colors.error }]}>
                  {payment.status}
                </Text>
              </View>
            </View>
          </View>
        ))}
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
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 4,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeFilter: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  activeFilterText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  paymentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  invoiceId: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  paymentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
});