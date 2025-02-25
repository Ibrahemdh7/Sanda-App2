// src/features/admin/screens/UserManagementScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal } from 'react-native';
import { ScreenWrapper } from '../../../shared/components/layouts/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../theme/theme';

// Define the user type to fix TypeScript errors
interface User {
  id: string;
  name: string;
  email: string;
  role: 'Provider' | 'Client' | 'Admin';
  status: 'Active' | 'Pending' | 'Suspended';
  company: string;
}

// Dummy data for users
const initialUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Provider', status: 'Active', company: 'XYZ Company' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Client', status: 'Active', company: 'ABC Corp' },
  { id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'Provider', status: 'Pending', company: 'Johnson Inc' },
  { id: '4', name: 'Sarah Williams', email: 'sarah@example.com', role: 'Client', status: 'Active', company: 'Williams LLC' },
  { id: '5', name: 'Robert Brown', email: 'robert@example.com', role: 'Provider', status: 'Suspended', company: 'Brown Enterprises' },
  { id: '6', name: 'Emily Davis', email: 'emily@example.com', role: 'Client', status: 'Pending', company: 'Davis Group' },
  { id: '7', name: 'David Miller', email: 'david@example.com', role: 'Provider', status: 'Active', company: 'Miller Solutions' },
  { id: '8', name: 'Lisa Anderson', email: 'lisa@example.com', role: 'Client', status: 'Active', company: 'Anderson Co.' },
];

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterRole, setFilterRole] = useState<'All' | 'Provider' | 'Client'>('All');

  // Filter users based on search query and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.company.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = filterRole === 'All' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const getStatusColor = (status: User['status']): string => {
    switch (status) {
      case 'Active':
        return '#4CD964'; // Green
      case 'Pending':
        return '#FF9500'; // Orange
      case 'Suspended':
        return '#FF3B30'; // Red
      default:
        return theme.colors.textSecondary;
    }
  };

  const handleUserPress = (user: User): void => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const handleStatusChange = (newStatus: User['status']): void => {
    if (selectedUser) {
      const updatedUsers = users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, status: newStatus } 
          : user
      );
      setUsers(updatedUsers);
      setModalVisible(false);
      setSelectedUser(null);
    }
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity 
      style={styles.userCard}
      onPress={() => handleUserPress(item)}
    >
      <View style={styles.userInfo}>
        <View style={[styles.avatar, { backgroundColor: item.role === 'Provider' ? '#E3F2FD' : '#FFF9C4' }]}>
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <Text style={styles.userCompany}>{item.company}</Text>
        </View>
      </View>
      <View style={styles.userMeta}>
        <View style={[styles.roleBadge, { backgroundColor: item.role === 'Provider' ? '#E3F2FD' : '#FFF9C4' }]}>
          <Text style={{ color: item.role === 'Provider' ? '#1976D2' : '#FFA000' }}>{item.role}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
          <Text style={{ color: getStatusColor(item.status) }}>{item.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>User Management</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add-circle" size={24} color={theme.colors.primary} />
            <Text style={styles.addButtonText}>Add User</Text>
          </TouchableOpacity>
        </View>

        {/* Search and Filter */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search users..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            ) : null}
          </View>
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Filter by:</Text>
            <View style={styles.filterButtons}>
              <TouchableOpacity 
                style={[styles.filterButton, filterRole === 'All' && styles.filterButtonActive]}
                onPress={() => setFilterRole('All')}
              >
                <Text style={[styles.filterButtonText, filterRole === 'All' && styles.filterButtonTextActive]}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.filterButton, filterRole === 'Provider' && styles.filterButtonActive]}
                onPress={() => setFilterRole('Provider')}
              >
                <Text style={[styles.filterButtonText, filterRole === 'Provider' && styles.filterButtonTextActive]}>Providers</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.filterButton, filterRole === 'Client' && styles.filterButtonActive]}
                onPress={() => setFilterRole('Client')}
              >
                <Text style={[styles.filterButtonText, filterRole === 'Client' && styles.filterButtonTextActive]}>Clients</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* User List */}
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptyText}>No users found</Text>
            </View>
          }
        />

        {/* User Detail Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>User Details</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              {selectedUser && (
                <View style={styles.userDetailContainer}>
                  <View style={[styles.bigAvatar, { backgroundColor: selectedUser.role === 'Provider' ? '#E3F2FD' : '#FFF9C4' }]}>
                    <Text style={styles.bigAvatarText}>{selectedUser.name.charAt(0)}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Name:</Text>
                    <Text style={styles.detailValue}>{selectedUser.name}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Email:</Text>
                    <Text style={styles.detailValue}>{selectedUser.email}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Role:</Text>
                    <View style={[styles.roleBadge, { backgroundColor: selectedUser.role === 'Provider' ? '#E3F2FD' : '#FFF9C4' }]}>
                      <Text style={{ color: selectedUser.role === 'Provider' ? '#1976D2' : '#FFA000' }}>{selectedUser.role}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Company:</Text>
                    <Text style={styles.detailValue}>{selectedUser.company}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(selectedUser.status)}20` }]}>
                      <Text style={{ color: getStatusColor(selectedUser.status) }}>{selectedUser.status}</Text>
                    </View>
                  </View>

                  <Text style={styles.actionTitle}>Change Status</Text>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: '#4CD964' }]}
                      onPress={() => handleStatusChange('Active')}
                    >
                      <Text style={styles.actionButtonText}>Activate</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: '#FF9500' }]}
                      onPress={() => handleStatusChange('Pending')}
                    >
                      <Text style={styles.actionButtonText}>Set Pending</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: '#FF3B30' }]}
                      onPress={() => handleStatusChange('Suspended')}
                    >
                      <Text style={styles.actionButtonText}>Suspend</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: theme.colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginRight: 12,
  },
  filterButtons: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F5F5F5',
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  filterButtonTextActive: {
    color: 'white',
  },
  listContainer: {
    paddingBottom: 16,
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  userEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  userCompany: {
    fontSize: 14,
    color: theme.colors.text,
  },
  userMeta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  userDetailContainer: {
    alignItems: 'center',
  },
  bigAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  bigAvatarText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  detailLabel: {
    width: 80,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  detailValue: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});