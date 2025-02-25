import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AdminStackParamList } from './types';
import { View, Text } from 'react-native';
import { ScreenWrapper } from '../shared/components/layouts/ScreenWrapper';

const Stack = createNativeStackNavigator<AdminStackParamList>();

// Temporary screen components
const AdminDashboard = () => (
  <ScreenWrapper>
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Admin Dashboard Screen</Text>
    </View>
  </ScreenWrapper>
);

const UserManagement = () => (
  <ScreenWrapper>
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>User Management Screen</Text>
    </View>
  </ScreenWrapper>
);

const SystemSettings = () => (
  <ScreenWrapper>
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>System Settings Screen</Text>
    </View>
  </ScreenWrapper>
);

const Reports = () => (
  <ScreenWrapper>
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Reports Screen</Text>
    </View>
  </ScreenWrapper>
);

export const AdminStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} options={{ title: 'Dashboard' }} />
      <Stack.Screen name="UserManagement" component={UserManagement} />
      <Stack.Screen name="SystemSettings" component={SystemSettings} />
      <Stack.Screen name="Reports" component={Reports} />
    </Stack.Navigator>
  );
};