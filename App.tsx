// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootStackParamList } from './src/navigation/types';
import { AuthStack } from './src/navigation/AuthStack';
import { ProviderStack } from './src/navigation/ProviderStack';
import { AdminStack } from './src/navigation/AdminStack';
import { ClientStack } from './src/navigation/ClientStack';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { theme } from './src/theme/theme';
import { AuthProvider } from './src/context/auth/AuthProvider';
import { useAuth } from './src/hooks/useAuth';
import { WelcomeScreen } from './src/features/auth/screens/WelcomeScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();

function AppContent() {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <StatusBar style="auto" />
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

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
        }}
        initialRouteName="Welcome"
      >
        <RootStack.Screen name="Welcome" component={WelcomeScreen} />
        <RootStack.Screen name="Auth" component={AuthStack} />
        <RootStack.Screen name="Admin" component={AdminStack} />
        <RootStack.Screen name="Provider" component={ProviderStack} />
        <RootStack.Screen name="Client" component={ClientStack} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;