import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { ScreenWrapper } from '../../../shared/components/layouts/ScreenWrapper';
import { CustomButton } from '../../../shared/components/Button/CustomButton';
import { theme } from '../../../theme/theme';

export const InvoiceDetailsScreen = () => {
  const handleApprove = () => {
    Alert.alert(
      'Success',
      'Invoice approved. Payment will be processed according to the terms.'
    );
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Invoice Details</Text>
        
        <View style={styles.detailsContainer}>
          <View style={styles.row}>
            <Text style={styles.label}>Invoice Number:</Text>
            <Text style={styles.value}>#INV-2024-001</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Amount:</Text>
            <Text style={styles.value}>$5,000.00</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Due Date:</Text>
            <Text style={styles.value}>2024-03-01</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Provider:</Text>
            <Text style={styles.value}>Tech Supplies Co.</Text>
          </View>
        </View>

        <CustomButton
          title="Approve Invoice"
          onPress={handleApprove}
          variant="primary"
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xl,
  },
  detailsContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xl,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  value: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
});