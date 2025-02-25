import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProviderStackParamList } from './types';

// Import screens (to be created)
import {
  ProviderDashboard,
  Clients,
  Invoices,
  CreditAccounts,
  Payments
} from '../screens/provider';

const Stack = createNativeStackNavigator<ProviderStackParamList>();

export const ProviderStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen name="ProviderDashboard" component={ProviderDashboard} options={{ title: 'Dashboard' }} />
      <Stack.Screen name="Clients" component={Clients} />
      <Stack.Screen name="Invoices" component={Invoices} />
      <Stack.Screen name="CreditAccounts" component={CreditAccounts} options={{ title: 'Credit Accounts' }} />
      <Stack.Screen name="Payments" component={Payments} />
    </Stack.Navigator>
  );
};