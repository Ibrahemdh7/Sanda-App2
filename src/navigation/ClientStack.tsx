import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ClientStackParamList } from './types';
// Import the actual screen components
import { ClientDashboard } from '../features/client/screens/DashboardScreen';
import { PaymentScreen } from '../features/client/screens/PaymentScreen';
import { CreditAccountScreen } from '../features/client/screens/CreditAccountScreen';
import { InvoiceDetailsScreen } from '../features/client/screens/InvoiceDetailsScreen';

const Stack = createNativeStackNavigator<ClientStackParamList>();

export const ClientStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen 
        name="ClientDashboard" 
        component={ClientDashboard} 
        options={{ title: 'Dashboard' }} 
      />
      <Stack.Screen 
        name="MyInvoices" 
        component={InvoiceDetailsScreen} 
        options={{ title: 'My Invoices' }} 
      />
      <Stack.Screen 
        name="MyCreditAccount" 
        component={CreditAccountScreen} 
        options={{ title: 'Credit Account' }} 
      />
      <Stack.Screen 
        name="MyPayments" 
        component={PaymentScreen} 
        options={{ title: 'Payments' }} 
      />
    </Stack.Navigator>
  );
};