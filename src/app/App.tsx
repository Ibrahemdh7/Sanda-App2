import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

// Import stacks
import { AuthStack } from '../navigation/AuthStack';
import { ProviderStack } from '../navigation/ProviderStack';

// Create root stack navigator
const RootStack = createNativeStackNavigator<RootStackParamList>();

export const App = () => {
  // TODO: Add auth state management
  const isAuthenticated = false;
  const userRole = 'provider';

  return (
    <NavigationContainer>
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          <RootStack.Screen name="Auth" component={AuthStack} />
        ) : userRole === 'provider' ? (
          <RootStack.Screen name="Provider" component={ProviderStack} />
        ) : null}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};