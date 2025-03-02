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
import { View, ActivityIndicator, Text } from 'react-native';
import { theme } from './src/theme/theme';
import { AuthProvider } from './src/context/auth/AuthProvider';
import { useAuth } from './src/hooks/useAuth';
import { WelcomeScreen } from './src/features/auth/screens/WelcomeScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();

function AppContent() {
  const { isAuthenticated, user, loading, initialLoading } = useAuth();
  
  // Show loading indicator during initial authentication check
  if (initialLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <StatusBar style="auto" />
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16, color: theme.colors.textSecondary }}>Initializing app...</Text>
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
          animation: 'fade',
        }}
        initialRouteName="Welcome" // Add this line to ensure Welcome is the initial screen
      >
        {!isAuthenticated ? (
          // Not authenticated - show Welcome and Auth screens
          <>
            <RootStack.Screen 
              name="Welcome" 
              component={WelcomeScreen} 
              options={{ gestureEnabled: false }} // Prevent going back
            />
            <RootStack.Screen name="Auth" component={AuthStack} />
          </>
        ) : (
          // Authenticated - show appropriate stack based on user role
          <>
            {user?.role === 'admin' && (
              <RootStack.Screen name="Admin" component={AdminStack} />
            )}
            {user?.role === 'provider' && (
              <RootStack.Screen name="Provider" component={ProviderStack} />
            )}
            {user?.role === 'client' && (
              <RootStack.Screen name="Client" component={ClientStack} />
            )}
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

function App() {
  console.log('App component rendering');
  
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