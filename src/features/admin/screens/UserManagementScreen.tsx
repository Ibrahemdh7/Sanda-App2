import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { ScreenWrapper } from '../../../shared/components/layouts/ScreenWrapper';

const mockUsers = [
  { id: '1', name: 'John Doe', role: 'Provider', status: 'Active' },
  { id: '2', name: 'Jane Smith', role: 'Client', status: 'Active' },
  { id: '3', name: 'Mike Johnson', role: 'Provider', status: 'Pending' },
];

export const UserManagement = () => {
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>User Management</Text>
        <FlatList
          data={mockUsers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.userCard}>
              <Text style={styles.userName}>{item.name}</Text>
              <Text>Role: {item.role}</Text>
              <Text>Status: {item.status}</Text>
            </View>
          )}
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  userCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
});