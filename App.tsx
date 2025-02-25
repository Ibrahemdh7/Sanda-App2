import React, { useState } from 'react';
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

const RootStack = createNativeStackNavigator<RootStackParamList>();

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'provider' | 'client' | null>(null);

  // Simulate initial auth check
  React.useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // TODO: Implement actual auth check
      setTimeout(() => {
        setIsAuthenticated(false);
        setUserRole('provider');
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <StatusBar style="auto" />
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
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
              {userRole === 'provider' && (
                <RootStack.Screen 
                  name="Provider" 
                  component={ProviderStack}
                  options={{
                    gestureEnabled: false,
                    animation: 'fade',
                  }}
                />
              )}
              {userRole === 'admin' && (
                <RootStack.Screen 
                  name="Admin" 
                  component={AdminStack}
                  options={{
                    gestureEnabled: false,
                    animation: 'fade',
                  }}
                />
              )}
              {userRole === 'client' && (
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
    </SafeAreaProvider>
  );
}

export default App;