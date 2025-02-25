// src/features/provider/screens/DashboardScreen/index.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { ScreenWrapper } from '../../../shared/components/layouts/ScreenWrapper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProviderStackParamList } from '../../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../hooks/useAuth';
import { theme } from '../../../theme/theme';

// Dummy data for dashboard
const dashboardData = {
  stats: {
    totalClients: 24,
    pendingInvoices: 12,
    totalRevenue: '$78,450',
    activeCredit: '$35,250',
  },
  recentInvoices: [
    { id: '1', client: 'ABC Corporation', amount: '$2,450', date: '2023-02-15', status: 'Paid' },
    { id: '2', client: 'XYZ Company', amount: '$1,780', date: '2023-02-10', status: 'Pending' },
    { id: '3', client: 'Global Enterprises', amount: '$3,200', date: '2023-02-05', status: 'Overdue' },
    { id: '4', client: 'Smith & Co', amount: '$980', date: '2023-01-28', status: 'Paid' },
  ],
  creditRequests: [
    { id: '1', client: 'ABC Corporation', currentLimit: '$15,000', requestedLimit: '$20,000', requestDate: '2023-02-14', status: 'Pending' },
    { id: '2', client: 'Royal Industries', currentLimit: '$8,000', requestedLimit: '$12,000', requestDate: '2023-02-08', status: 'Pending' },
  ]
};

export const ProviderDashboard = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ProviderStackParamList>>();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'credits'>('overview');

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Welcome' as any }],
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return '#4CD964'; // Green
      case 'Pending':
        return '#FF9500'; // Orange
      case 'Overdue':
        return '#FF3B30'; // Red
      default:
        return theme.colors.textSecondary;
    }
  };

  const renderOverviewTab = () => (
    <>
      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Business Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="people" size={28} color={theme.colors.primary} />
            <Text style={styles.statValue}>{dashboardData.stats.totalClients}</Text>
            <Text style={styles.statLabel}>Total Clients</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="document-text" size={28} color={theme.colors.secondary} />
            <Text style={styles.statValue}>{dashboardData.stats.pendingInvoices}</Text>
            <Text style={styles.statLabel}>Pending Invoices</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="cash" size={28} color="#34C759" />
            <Text style={styles.statValue}>{dashboardData.stats.totalRevenue}</Text>
            <Text style={styles.statLabel}>Total Revenue</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="card" size={28} color="#FF9500" />
            <Text style={styles.statValue}>{dashboardData.stats.activeCredit}</Text>
            <Text style={styles.statLabel}>Active Credit</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Clients')}
          >
            <Ionicons name="people" size={24} color="white" />
            <Text style={styles.actionLabel}>Manage Clients</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Invoices')}
          >
            <Ionicons name="document-text" size={24} color="white" />
            <Text style={styles.actionLabel}>Create Invoice</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('CreditAccounts')}
          >
            <Ionicons name="card" size={24} color="white" />
            <Text style={styles.actionLabel}>Credit Accounts</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Payments')}
          >
            <Ionicons name="cash" size={24} color="white" />
            <Text style={styles.actionLabel}>Payments</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );

  const renderInvoicesTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <Text style={styles.tabTitle}>Recent Invoices</Text>
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('Invoices')}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {dashboardData.recentInvoices.map(invoice => (
        <View key={invoice.id} style={styles.invoiceCard}>
          <View style={styles.invoiceHeader}>
            <Text style={styles.invoiceClient}>{invoice.client}</Text>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(invoice.status)}20` }]}>
              <Text style={{ color: getStatusColor(invoice.status) }}>{invoice.status}</Text>
            </View>
          </View>
          <View style={styles.invoiceDetails}>
            <View style={styles.invoiceDetail}>
              <Text style={styles.detailLabel}>Amount</Text>
              <Text style={styles.detailValue}>{invoice.amount}</Text>
            </View>
            <View style={styles.invoiceDetail}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{invoice.date}</Text>
            </View>
            <TouchableOpacity style={styles.invoiceAction}>
              <Text style={styles.invoiceActionText}>View Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  const renderCreditsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <Text style={styles.tabTitle}>Credit Limit Requests</Text>
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('CreditAccounts')}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {dashboardData.creditRequests.map(request => (
        <View key={request.id} style={styles.creditRequestCard}>
          <View style={styles.creditRequestHeader}>
            <Text style={styles.creditRequestClient}>{request.client}</Text>
            <View style={[styles.statusBadge, { backgroundColor: '#FF950020' }]}>
              <Text style={{ color: '#FF9500' }}>{request.status}</Text>
            </View>
          </View>
          <View style={styles.creditDetails}>
            <View style={styles.creditDetail}>
              <Text style={styles.detailLabel}>Current Limit</Text>
              <Text style={styles.detailValue}>{request.currentLimit}</Text>
            </View>
            <View style={styles.creditDetail}>
              <Text style={styles.detailLabel}>Requested</Text>
              <Text style={styles.detailValue}>{request.requestedLimit}</Text>
            </View>
            <View style={styles.creditDetail}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{request.requestDate}</Text>
            </View>
          </View>
          <View style={styles.creditActions}>
            <TouchableOpacity style={[styles.creditAction, styles.approveButton]}>
              <Text style={styles.approveButtonText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.creditAction, styles.rejectButton]}>
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
      
            <View style={styles.headerContent}>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.nameText}>{user?.displayName || 'Provider'}</Text>
            </View>
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
              onPress={() => setActiveTab('overview')}
            >
              <Ionicons 
                name="grid-outline" 
                size={20} 
                color={activeTab === 'overview' ? theme.colors.primary : theme.colors.textSecondary} 
              />
              <Text 
                style={[
                  styles.tabText, 
                  activeTab === 'overview' && styles.activeTabText
                ]}
              >
                Overview
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'invoices' && styles.activeTab]}
              onPress={() => setActiveTab('invoices')}
            >
              <Ionicons 
                name="document-text-outline" 
                size={20} 
                color={activeTab === 'invoices' ? theme.colors.primary : theme.colors.textSecondary} 
              />
              <Text 
                style={[
                  styles.tabText, 
                  activeTab === 'invoices' && styles.activeTabText
                ]}
              >
                Invoices
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'credits' && styles.activeTab]}
              onPress={() => setActiveTab('credits')}
            >
              <Ionicons 
                name="card-outline" 
                size={20} 
                color={activeTab === 'credits' ? theme.colors.primary : theme.colors.textSecondary} 
              />
              <Text 
                style={[
                  styles.tabText, 
                  activeTab === 'credits' && styles.activeTabText
                ]}
              >
                Credits
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'invoices' && renderInvoicesTab()}
          {activeTab === 'credits' && renderCreditsTab()}
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
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  logoutButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    marginLeft: 4,
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  tabContent: {
    marginBottom: 24,
  },
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tabTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: theme.colors.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
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
  invoiceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  invoiceClient: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  invoiceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invoiceDetail: {},
  detailLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  invoiceAction: {
    backgroundColor: `${theme.colors.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  invoiceActionText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  creditRequestCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  creditRequestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  creditRequestClient: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  creditDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  creditDetail: {},
  creditActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  creditAction: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  approveButton: {
    backgroundColor: '#4CD96420',
  },
  approveButtonText: {
    color: '#4CD964',
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: '#FF3B3020',
  },
  rejectButtonText: {
    color: '#FF3B30',
    fontWeight: '600',
  },
});