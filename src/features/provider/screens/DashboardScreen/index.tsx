import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenWrapper } from '../../../../shared/components/layouts/ScreenWrapper';
import { FormButton } from '../../../../shared/components/forms/FormButton';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProviderStackParamList } from '../../../../navigation/types';

export const ProviderDashboard = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ProviderStackParamList>>();

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Provider Dashboard</Text>
        <View style={styles.buttonsContainer}>
          <FormButton
            title="Manage Clients"
            onPress={() => navigation.navigate('Clients')}
            style={styles.button}
          />
          <FormButton
            title="View Invoices"
            onPress={() => navigation.navigate('Invoices')}
            style={styles.button}
          />
          <FormButton
            title="Credit Accounts"
            onPress={() => navigation.navigate('CreditAccounts')}
            style={styles.button}
          />
          <FormButton
            title="Payments"
            onPress={() => navigation.navigate('Payments')}
            style={styles.button}
          />
        </View>
      </View>
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
    marginBottom: 32,
    color: '#333',
  },
  buttonsContainer: {
    gap: 16,
  },
  button: {
    width: '100%',
  },
});