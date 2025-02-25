import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenWrapper } from '../../../shared/components/layouts/ScreenWrapper';
import { FormButton } from '../../../shared/components/forms/FormButton';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClientStackParamList } from '../../../navigation/types';

export const ClientDashboard = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ClientStackParamList>>();

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Client Dashboard</Text>
        <View style={styles.buttonsContainer}>
          <FormButton
            title="My Invoices"
            onPress={() => navigation.navigate('MyInvoices')}
            style={styles.button}
          />
          <FormButton
            title="Credit Account"
            onPress={() => navigation.navigate('MyCreditAccount')}
            style={styles.button}
          />
          <FormButton
            title="My Payments"
            onPress={() => navigation.navigate('MyPayments')}
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
    textAlign: 'center',
  },
  buttonsContainer: {
    gap: 16,
  },
  button: {
    width: '100%',
  },
});
