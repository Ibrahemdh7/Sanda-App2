// src/features/provider/screens/DashboardScreen/index.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { ScreenWrapper } from '../../../../shared/components/layouts/ScreenWrapper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProviderStackParamList } from '../../../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../../hooks/useAuth';
import { theme } from '../../../../theme/theme';
import { collection, query, where, getDocs, orderBy, limit, Timestamp, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../../config/firebase';

// Dummy data for seeding the database if empty
const dummyData = {
  clients: [
    { id: 'client1', client_name: 'ABC Corporation', provider_id: '', credit_limit: 15000, email: 'abc@example.com', phone: '+1234567890' },
    { id: 'client2', client_name: 'XYZ Company', provider_id: '', credit_limit: 8000, email: 'xyz@example.com', phone: '+1987654321' },
    { id: 'client3', client_name: 'Global Enterprises', provider_id: '', credit_limit: 12000, email: 'global@example.com', phone: '+1122334455' },
    { id: 'client4', client_name: 'Smith & Co', provider_id: '', credit_limit: 5000, email: 'smith@example.com', phone: '+1555666777' },
  ],
  invoices: [
    { 
      id: 'inv1', 
      client_id: 'client1', 
      provider_id: '', 
      total_amount: 2450, 
      status: 'paid', 
      invoice_date: new Date('2023-02-15'),
      created_at: new Date('2023-02-10'),
      due_date: new Date('2023-03-15'),
      description: 'Office supplies and equipment'
    },
    { 
      id: 'inv2', 
      client_id: 'client2', 
      provider_id: '', 
      total_amount: 1780, 
      status: 'pending', 
      invoice_date: new Date('2023-02-10'),
      created_at: new Date('2023-02-05'),
      due_date: new Date('2023-03-10'),
      description: 'IT services'
    },
    { 
      id: 'inv3', 
      client_id: 'client3', 
      provider_id: '', 
      total_amount: 3200, 
      status: 'overdue', 
      invoice_date: new Date('2023-02-05'),
      created_at: new Date('2023-01-30'),
      due_date: new Date('2023-03-05'),
      description: 'Consulting services'
    },
    { 
      id: 'inv4', 
      client_id: 'client4', 
      provider_id: '', 
      total_amount: 980, 
      status: 'paid', 
      invoice_date: new Date('2023-01-28'),
      created_at: new Date('2023-01-20'),
      due_date: new Date('2023-02-28'),
      description: 'Marketing materials'
    },
  ],
  creditLimitRequests: [
    { 
      id: 'req1', 
      client_id: 'client1', 
      provider_id: '', 
      current_limit: 15000, 
      requested_limit: 20000, 
      request_date: new Date('2023-02-14'),
      status: 'pending',
      reason: 'Business expansion'
    },
    { 
      id: 'req2', 
      client_id: 'client2', 
      provider_id: '', 
      current_limit: 8000, 
      requested_limit: 12000, 
      request_date: new Date('2023-02-08'),
      status: 'pending',
      reason: 'Seasonal inventory increase'
    },
  ]
};

// Helper function to seed database if empty
const seedDatabaseIfEmpty = async (providerId: string) => {
  try {
    // Check if clients collection is empty for this provider
    const clientsQuery = query(
      collection(db, 'clients'),
      where('provider_id', '==', providerId)
    );
    const clientsSnapshot = await getDocs(clientsQuery);
    
    if (clientsSnapshot.empty) {
      console.log('Seeding database with dummy data for provider:', providerId);
      
      // Create clients
      const clientRefs: {[key: string]: string} = {};
      for (const client of dummyData.clients) {
        const newClient = {...client, provider_id: providerId};
        const clientRef = await addDoc(collection(db, 'clients'), newClient);
        clientRefs[client.id] = clientRef.id;
      }
      
      // Create invoices
      for (const invoice of dummyData.invoices) {
        const clientId = clientRefs[invoice.client_id] || invoice.client_id;
        const newInvoice = {
          ...invoice,
          client_id: clientId,
          provider_id: providerId,
          invoice_date: Timestamp.fromDate(invoice.invoice_date),
          created_at: Timestamp.fromDate(invoice.created_at),
          due_date: Timestamp.fromDate(invoice.due_date)
        };
        await addDoc(collection(db, 'invoices'), newInvoice);
      }
      
      // Create credit limit requests
      for (const request of dummyData.creditLimitRequests) {
        const clientId = clientRefs[request.client_id] || request.client_id;
        const newRequest = {
          ...request,
          client_id: clientId,
          provider_id: providerId,
          request_date: Timestamp.fromDate(request.request_date)
        };
        await addDoc(collection(db, 'creditLimitRequests'), newRequest);
      }
      
      console.log('Database seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

export const ProviderDashboard = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ProviderStackParamList>>();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'credits'>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalClients: 0,
      pendingInvoices: 0,
      totalRevenue: '$0',
      activeCredit: '$0',
    },
    recentInvoices: [] as any[],
    creditRequests: [] as any[]
  });

  // Function to fetch dashboard data
  const fetchDashboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get provider ID
      const providerId = user.id;
      
      // Seed database if empty (only in development)
      if (__DEV__) {
        await seedDatabaseIfEmpty(providerId);
      }
      
      // Get total clients count
      const clientsQuery = query(
        collection(db, 'clients'),
        where('provider_id', '==', providerId)
      );
      const clientsSnapshot = await getDocs(clientsQuery);
      const totalClients = clientsSnapshot.docs.length;
      
      // Get pending invoices count
      const pendingInvoicesQuery = query(
        collection(db, 'invoices'),
        where('provider_id', '==', providerId),
        where('status', '==', 'pending')
      );
      const pendingInvoicesSnapshot = await getDocs(pendingInvoicesQuery);
      const pendingInvoices = pendingInvoicesSnapshot.docs.length;
      
      // Calculate total revenue from paid invoices
      const paidInvoicesQuery = query(
        collection(db, 'invoices'),
        where('provider_id', '==', providerId),
        where('status', '==', 'paid')
      );
      const paidInvoicesSnapshot = await getDocs(paidInvoicesQuery);
      const totalRevenue = paidInvoicesSnapshot.docs.reduce(
        (sum, doc) => sum + (doc.data().total_amount || 0), 
        0
      );
      
      // Calculate active credit
      const activeCredit = clientsSnapshot.docs.reduce(
        (sum, doc) => sum + (doc.data().credit_limit || 0), 
        0
      );
      
      // Get recent invoices
      const recentInvoicesQuery = query(
        collection(db, 'invoices'),
        where('provider_id', '==', providerId),
        orderBy('created_at', 'desc'),
        limit(4)
      );
      const recentInvoicesSnapshot = await getDocs(recentInvoicesQuery);
      
      // Create a map of client IDs to client names
      const clientsMap: {[key: string]: string} = {};
      clientsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        clientsMap[doc.id] = data.client_name || 'Unknown Client';
      });
      
      // Format the recent invoices
      const recentInvoices = recentInvoicesSnapshot.docs.map(doc => {
        const data = doc.data();
        const timestamp = data.invoice_date as Timestamp;
        const date = timestamp ? new Date(timestamp.seconds * 1000).toISOString().split('T')[0] : 'Unknown date';
        
        return {
          id: doc.id,
          client: clientsMap[data.client_id] || 'Unknown Client',
          clientId: data.client_id,
          amount: `$${(data.total_amount || 0).toFixed(2)}`,
          date: date,
          status: data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : 'Unknown'
        };
      });
      
      // Get pending credit requests
      const creditRequestsQuery = query(
        collection(db, 'creditLimitRequests'),
        where('provider_id', '==', providerId),
        where('status', '==', 'pending'),
        orderBy('request_date', 'desc'),
        limit(2)
      );
      const creditRequestsSnapshot = await getDocs(creditRequestsQuery);
      
      // Format the credit requests
      const creditRequests = creditRequestsSnapshot.docs.map(doc => {
        const data = doc.data();
        const timestamp = data.request_date as Timestamp;
        const date = timestamp ? new Date(timestamp.seconds * 1000).toISOString().split('T')[0] : 'Unknown date';
        
        return {
          id: doc.id,
          client: clientsMap[data.client_id] || 'Unknown Client',
          clientId: data.client_id,
          currentLimit: `$${(data.current_limit || 0).toFixed(2)}`,
          requestedLimit: `$${(data.requested_limit || 0).toFixed(2)}`,
          requestDate: date,
          status: 'Pending',
          rawCurrentLimit: data.current_limit || 0,
          rawRequestedLimit: data.requested_limit || 0
        };
      });
      
      // Update dashboard data
      setDashboardData({
        stats: {
          totalClients,
          pendingInvoices,
          totalRevenue: `$${totalRevenue.toFixed(2)}`,
          activeCredit: `$${activeCredit.toFixed(2)}`,
        },
        recentInvoices: recentInvoices.length > 0 ? recentInvoices : [
          { id: '1', client: 'No invoices found', amount: '$0', date: '', status: '' }
        ],
        creditRequests: creditRequests.length > 0 ? creditRequests : [
          { id: '1', client: 'No credit requests', currentLimit: '$0', requestedLimit: '$0', requestDate: '', status: '' }
        ]
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' as any }],
      });
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Logout Failed', 'There was a problem logging out. Please try again.');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleCreditRequestAction = async (requestId: string, clientId: string, action: 'approve' | 'reject', currentLimit: number, requestedLimit: number) => {
    try {
      setLoading(true);
      
      // Update the credit request status
      const requestRef = doc(db, 'creditLimitRequests', requestId);
      await updateDoc(requestRef, {
        status: action === 'approve' ? 'approved' : 'rejected',
        updated_at: Timestamp.now()
      });
      
      // If approved, update the client's credit limit
      if (action === 'approve') {
        const clientRef = doc(db, 'clients', clientId);
        await updateDoc(clientRef, {
          credit_limit: requestedLimit,
          updated_at: Timestamp.now()
        });
      }
      
      // Show success message
      Alert.alert(
        'Success', 
        `Credit request ${action === 'approve' ? 'approved' : 'rejected'} successfully.`
      );
      
      // Refresh dashboard data
      fetchDashboardData();
    } catch (error) {
      console.error(`Error ${action}ing credit request:`, error);
      Alert.alert('Error', `Failed to ${action} credit request. Please try again.`);
    } finally {
      setLoading(false);
    }
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
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigation.navigate('Clients')}
          >
            <Ionicons name="people" size={28} color={theme.colors.primary} />
            <Text style={styles.statValue}>{dashboardData.stats.totalClients}</Text>
            <Text style={styles.statLabel}>Total Clients</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigation.navigate('Invoices')}
          >
            <Ionicons name="cash" size={28} color="#34C759" />
            <Text style={styles.statValue}>{dashboardData.stats.pendingInvoices}</Text>
            <Text style={styles.statLabel}>Pending Invoices</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigation.navigate('CreditAccounts')}
          >
            <Ionicons name="card" size={28} color="#FF9500" />
            <Text style={styles.statValue}>{dashboardData.stats.activeCredit}</Text>
            <Text style={styles.statLabel}>Active Credit</Text>
          </TouchableOpacity>
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
          // Fix for navigation to CreateInvoice screen
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Invoices', { action: 'create' })}
          >
            <Ionicons name="document-text" size={24} color="white" />
            <Text style={styles.actionLabel}>Create Invoice</Text>
          </TouchableOpacity>

          // Fix for navigation to InvoiceDetails screen
          <TouchableOpacity 
            style={styles.invoiceAction}
          >
            <Text style={styles.invoiceActionText}>View Details</Text>
          </TouchableOpacity>

          // Fix for duplicate style properties
          // Remove the duplicate loadingContainer and loadingText styles at the end of the StyleSheet
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
            {invoice.status && (
              <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(invoice.status)}20` }]}>
                <Text style={{ color: getStatusColor(invoice.status) }}>{invoice.status}</Text>
              </View>
            )}
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
            <TouchableOpacity 
              style={styles.invoiceAction}
            >
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
            {request.status && (
              <View style={[styles.statusBadge, { backgroundColor: '#FF950020' }]}>
                <Text style={{ color: '#FF9500' }}>{request.status}</Text>
              </View>
            )}
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
          {request.status === 'Pending' && request.id !== '1' && (
            <View style={styles.creditActions}>
              <TouchableOpacity 
                style={[styles.creditAction, styles.approveButton]}
                onPress={() => handleCreditRequestAction(
                  request.id, 
                  request.clientId, 
                  'approve', 
                  request.rawCurrentLimit, 
                  request.rawRequestedLimit
                )}
              >
                <Text style={styles.approveButtonText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.creditAction, styles.rejectButton]}
                onPress={() => handleCreditRequestAction(
                  request.id, 
                  request.clientId, 
                  'reject', 
                  request.rawCurrentLimit, 
                  request.rawRequestedLimit
                )}
              >
                <Text style={styles.rejectButtonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
    </View>
  );

  return (
    <ScreenWrapper>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Image 
              source={require('../../../../../assets/splash-icon.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
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
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Loading dashboard data...</Text>
            </View>
          ) : (
            <>
              {activeTab === 'overview' && renderOverviewTab()}
              {activeTab === 'invoices' && renderInvoicesTab()}
              {activeTab === 'credits' && renderCreditsTab()}
            </>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    height: 300,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.colors.textSecondary,
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
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  invoiceDetail: {
    marginRight: 16,
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  invoiceAction: {
    marginLeft: 'auto',
  },
  invoiceActionText: {
    color: theme.colors.primary,
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
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  creditDetail: {
    marginRight: 16,
    marginBottom: 8,
  },
  creditActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  creditAction: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
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