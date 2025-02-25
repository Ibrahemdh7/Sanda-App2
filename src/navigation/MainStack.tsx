import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '@/features/home/screens/HomeScreen';
import { InvoicesScreen } from '@/features/invoices/screens/InvoicesScreen';

const Stack = createNativeStackNavigator();

export const MainStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTintColor: '#000',
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Dashboard' }}
      />
      <Stack.Screen 
        name="Invoices" 
        component={InvoicesScreen} 
        options={{ title: 'Invoices' }}
      />
    </Stack.Navigator>
  );
};