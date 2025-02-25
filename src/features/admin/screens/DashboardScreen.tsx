// src/features/admin/screens/DashboardScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenWrapper } from '../../../shared/components/layouts/ScreenWrapper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../../navigation/types';
import { theme } from '../../../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../hooks/useAuth';

// Dummy data for dashboard statistics
const dashboardStats = {
  totalUsers: 124,
  activeProviders: 48,
  pendingApprovals: 12,
  invoicesProcessed: 1567,
  totalTransactions: '$482,950',
  systemUptime: '99.8%'
};

// Dummy data for recent activities
const recentActivities = [
  { id: '1', user: 'Provider XYZ', action: 'Invoice Created', timestamp: '2 mins ago' },
  { id: '2', user: 'Admin User', action: 'Approved Account', timestamp: '25 mins ago' },
  { id: '3', user: 'Client ABC', action: 'Requested Credit Increase', timestamp: '1 hour ago' },
  { id: '4', user: 'Provider DEF', action: 'Added New Client', timestamp: '3 hours ago' },
  { id: '5', user: 'Client GHI', action: 'Payment Completed', timestamp: '5 hours ago' },
];

export const AdminDashboard = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AdminStackParamList>>();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Welcome' as any }],
    });
  };

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.nameText}>{user?.displayName || 'Admin'}</Text>
            </View>
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Stats Overview */}
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>System Overview</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Ionicons name="people" size={28} color={theme.colors.primary} />
                <Text style={styles.statValue}>{dashboardStats.totalUsers}</Text>
                <Text style={styles.statLabel}>Total Users</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="business" size={28} color={theme.colors.primary} />
                <Text style={styles.statValue}>{dashboardStats.activeProviders}</Text>
                <Text style={styles.statLabel}>Active Providers</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="time" size={28} color={theme.colors.secondary} />
                <Text style={styles.statValue}>{dashboardStats.pendingApprovals}</Text>
                <Text style={styles.statLabel}>Pending Approvals</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="document-text" size={28} color={theme.colors.primary} />
                <Text style={styles.statValue}>{dashboardStats.invoicesProcessed}</Text>
                <Text style={styles.statLabel}>Invoices Processed</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="cash" size={28} color="#34C759" />
                <Text style={styles.statValue}>{dashboardStats.totalTransactions}</Text>
                <Text style={styles.statLabel}>Total Transactions</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="pulse" size={28} color={theme.colors.primary} />
                <Text style={styles.statValue}>{dashboardStats.systemUptime}</Text>
                <Text style={styles.statLabel}>System Uptime</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionGrid}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('UserManagement')}
              >
                <Ionicons name="people" size={24} color="white" />
                <Text style={styles.actionLabel}>Manage Users</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('SystemSettings')}
              >
                <Ionicons name="settings" size={24} color="white" />
                <Text style={styles.actionLabel}>System Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('Reports')}
              >
                <Ionicons name="bar-chart" size={24} color="white" />
                <Text style={styles.actionLabel}>View Reports</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => alert('Business rules accessed')}
              >
                <Ionicons name="list" size={24} color="white" />
                <Text style={styles.actionLabel}>Business Rules</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.recentActivityContainer}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {recentActivities.map(activity => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons name="notifications" size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.activityDetails}>
                  <Text style={styles.activityUser}>{activity.user}</Text>
                  <Text style={styles.activityAction}>{activity.action}</Text>
                </View>
                <Text style={styles.activityTime}>{activity.timestamp}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
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
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  logoutButton: {
    padding: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: theme.colors.text,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  quickActionsContainer: {
    marginBottom: 24,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionLabel: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  recentActivityContainer: {
    marginBottom: 24,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityDetails: {
    flex: 1,
    marginLeft: 12,
  },
  activityUser: {
    fontWeight: '600',
    fontSize: 14,
    color: theme.colors.text,
  },
  activityAction: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  activityTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
});