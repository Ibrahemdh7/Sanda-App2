import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ClientStackParamList } from './types';
import { View, Text } from 'react-native';
import { ScreenWrapper } from '../shared/components/layouts/ScreenWrapper';

const Stack = createNativeStackNavigator<ClientStackParamList>();

// Temporary screen components
const ClientDashboard = () => (
  <ScreenWrapper>
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Client Dashboard Screen</Text>
    </View>
  </ScreenWrapper>
);

const MyInvoices = () => (
  <ScreenWrapper>
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>My Invoices Screen</Text>
    </View>
  </ScreenWrapper>
);

const MyCreditAccount = () => (
  <ScreenWrapper>
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>My Credit Account Screen</Text>
    </View>
  </ScreenWrapper>
);

const MyPayments = () => (
  <ScreenWrapper>
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>My Payments Screen</Text>
    </View>
  </ScreenWrapper>
);

export const ClientStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen name="ClientDashboard" component={ClientDashboard} options={{ title: 'Dashboard' }} />
      <Stack.Screen name="MyInvoices" component={MyInvoices} />
      <Stack.Screen name="MyCreditAccount" component={MyCreditAccount} options={{ title: 'Credit Account' }} />
      <Stack.Screen name="MyPayments" component={MyPayments} />
    </Stack.Navigator>
  );
};