import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AdminStackParamList } from './types';
import { AdminDashboard } from '../features/admin/screens/DashboardScreen';
import { UserManagement } from '../features/admin/screens/UserManagementScreen';
import { View, Text } from 'react-native';
import { ScreenWrapper } from '../shared/components/layouts/ScreenWrapper';

const Stack = createNativeStackNavigator<AdminStackParamList>();

// Temporary placeholder screens
const SystemSettings = () => (
  <ScreenWrapper>
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>System Settings</Text>
    </View>
  </ScreenWrapper>
);

const Reports = () => (
  <ScreenWrapper>
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Reports Dashboard</Text>
    </View>
  </ScreenWrapper>
);

export const AdminStack = () => {
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
        name="AdminDashboard" 
        component={AdminDashboard} 
        options={{ title: 'Admin Dashboard' }} 
      />
      <Stack.Screen 
        name="UserManagement" 
        component={UserManagement} 
        options={{ title: 'User Management' }}
      />
      <Stack.Screen 
        name="SystemSettings" 
        component={SystemSettings} 
        options={{ title: 'System Settings' }}
      />
      <Stack.Screen 
        name="Reports" 
        component={Reports} 
        options={{ title: 'Reports' }}
      />
    </Stack.Navigator>
  );
};