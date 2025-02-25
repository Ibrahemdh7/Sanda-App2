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
import { AuthProvider } from './src/context/auth/AuthProvider'; // Import your AuthProvider
import { useAuth } from './src/hooks/useAuth'; // Import useAuth

const RootStack = createNativeStackNavigator<RootStackParamList>();

// Create a component that uses the auth context
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
          animation: 'slide_from_right',
        }}
      >
        {!isAuthenticated ? (
          <RootStack.Screen 
            name="Auth" 
            component={AuthStack}
            options={{
              gestureEnabled: false,
              animation: 'fade',
            }}
          />
        ) : (
          <>
            {user?.role === 'provider' && (
              <RootStack.Screen 
                name="Provider" 
                component={ProviderStack}
                options={{
                  gestureEnabled: false,
                  animation: 'fade',
                }}
              />
            )}
            {user?.role === 'admin' && (
              <RootStack.Screen 
                name="Admin" 
                component={AdminStack}
                options={{
                  gestureEnabled: false,
                  animation: 'fade',
                }}
              />
            )}
            {user?.role === 'client' && (
              <RootStack.Screen 
                name="Client" 
                component={ClientStack}
                options={{
                  gestureEnabled: false,
                  animation: 'fade',
                }}
              />
            )}
          </>
        )}
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