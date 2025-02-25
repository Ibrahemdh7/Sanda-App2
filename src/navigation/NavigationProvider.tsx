import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { AuthStack } from './AuthStack';
import { AdminStack } from './AdminStack';
import { ProviderStack } from './ProviderStack';
import { ClientStack } from './ClientStack';
import { theme } from '@theme/theme';
import { BottomTabs } from './BottomTabs';
import { WelcomeScreen } from '@/features/auth/screens/WelcomeScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();

export const NavigationProvider: React.FC<{ isAuthenticated: boolean; userRole?: string }> = ({
  isAuthenticated,
  userRole
}) => {
  return (
    <NavigationContainer
      theme={{
        dark: false,
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.text,
          border: theme.colors.border,
          notification: theme.colors.secondary,
        },
      }}
    >
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
          animation: 'fade',
        }}
        initialRouteName="Welcome"
      >
        {!isAuthenticated ? (
          <>
            <RootStack.Screen name="Welcome" component={WelcomeScreen} />
            <RootStack.Screen name="Auth" component={AuthStack} />
          </>
        ) : (
          <>
            {userRole === 'admin' && <RootStack.Screen name="Admin" component={BottomTabs} />}
            {userRole === 'provider' && <RootStack.Screen name="Provider" component={BottomTabs} />}
            {userRole === 'client' && <RootStack.Screen name="Client" component={BottomTabs} />}
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};