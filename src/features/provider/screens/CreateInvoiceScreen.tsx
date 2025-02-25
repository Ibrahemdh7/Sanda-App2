import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { ScreenWrapper } from '../../../shared/components/layouts/ScreenWrapper';
import { CustomButton } from '../../../shared/components/Button/CustomButton';
import { theme } from '../../../theme/theme';
import { useNavigation } from '@react-navigation/native';

export const CreateInvoiceScreen = () => {
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [clientId, setClientId] = useState('');
  const navigation = useNavigation();

  const handleSubmit = async () => {
    try {
      // In real app, this would connect to your invoice service
      Alert.alert('Success', 'Invoice created and sent to client for approval');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to create invoice');
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Create New Invoice</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Invoice Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Due Date (YYYY-MM-DD)"
          value={dueDate}
          onChangeText={setDueDate}
        />

        <TextInput
          style={styles.input}
          placeholder="Client ID"
          value={clientId}
          onChangeText={setClientId}
        />

        <CustomButton
          title="Submit Invoice"
          onPress={handleSubmit}
          variant="primary"
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xl,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
  },
});