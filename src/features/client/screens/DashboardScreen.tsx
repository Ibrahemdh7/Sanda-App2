import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { ScreenWrapper } from '../../../shared/components/layouts/ScreenWrapper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClientStackParamList } from '../../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../theme/theme';
import { useAuth } from '../../../hooks/useAuth';
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { User } from 'firebase/auth'; // Add this import if needed

// Define colors that aren't in the theme
const COLORS = {
  warning: '#FFA500', // Orange color for warnings
};

export const ClientDashboard = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ClientStackParamList>>();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    creditInfo: {
      limit: 0,
      available: 0,
      used: 0,
    },
    recentInvoices: [] as any[],
    recentPayments: [] as any[],
  });
  
  // In the useEffect function, update the user?.uid check
  useEffect(() => {
    const fetchClientData = async () => {
      if (!user?.email) return; // Change uid to email or another property that exists on User
  
      try {
        setLoading(true);
        
        // Get client information
        const clientsRef = collection(db, 'clients');
        const clientQuery = query(clientsRef, where('user_id', '==', user.email)); // Change uid to email
        const clientSnapshot = await getDocs(clientQuery);
        
        if (clientSnapshot.empty) {
          console.log('No client record found');
          setLoading(false);
          return;
        }
        
        const clientData = clientSnapshot.docs[0].data();
        const clientId = clientSnapshot.docs[0].id;
        
        // Get recent invoices
        const invoicesRef = collection(db, 'invoices');
        const invoiceQuery = query(
          invoicesRef, 
          where('client_id', '==', clientId),
          orderBy('invoice_date', 'desc'),
          limit(3)
        );
        const invoiceSnapshot = await getDocs(invoiceQuery);
        
        // Get provider names for invoices
        const providerIds = invoiceSnapshot.docs.map(doc => doc.data().provider_id);
        const uniqueProviderIds = [...new Set(providerIds)];
        const providersMap: {[key: string]: string} = {};
        
        if (uniqueProviderIds.length > 0) {
          const providersRef = collection(db, 'providers');
          const providerQuery = query(providersRef, where('user_id', 'in', uniqueProviderIds));
          const providerSnapshot = await getDocs(providerQuery);
          
          providerSnapshot.forEach(doc => {
            providersMap[doc.data().user_id] = doc.data().business_name || 'Unknown Provider';
          });
        }
        
        // Format invoices
        const invoices = invoiceSnapshot.docs.map(doc => {
          const data = doc.data();
          const timestamp = data.invoice_date as Timestamp;
          const date = timestamp ? new Date(timestamp.seconds * 1000).toISOString().split('T')[0] : 'Unknown date';
          
          return {
            id: doc.id,
            provider: providersMap[data.provider_id] || 'Unknown Provider',
            amount: `$${(data.total_amount || 0).toFixed(2)}`,
            date: date,
            status: data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : 'Unknown'
          };
        });
        
        // Get recent payments
        const paymentsRef = collection(db, 'payments');
        const paymentQuery = query(
          paymentsRef,
          where('client_id', '==', clientId),
          orderBy('payment_date', 'desc'),
          limit(3)
        );
        const paymentSnapshot = await getDocs(paymentQuery);
        
        // Format payments
        const payments = paymentSnapshot.docs.map(doc => {
          const data = doc.data();
          const timestamp = data.payment_date as Timestamp;
          const date = timestamp ? new Date(timestamp.seconds * 1000).toISOString().split('T')[0] : 'Unknown date';
          
          return {
            id: doc.id,
            provider: providersMap[data.provider_id] || 'Unknown Provider',
            amount: `$${(data.amount || 0).toFixed(2)}`,
            date: date,
            method: data.payment_method || 'Unknown method',
            status: data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : 'Processing'
          };
        });
        
        // Calculate credit usage
        const creditLimit = clientData.credit_limit || 0;
        const usedCredit = clientData.used_credit || 0;
        const availableCredit = creditLimit - usedCredit;
        
        setDashboardData({
          creditInfo: {
            limit: creditLimit,
            available: availableCredit,
            used: usedCredit,
          },
          recentInvoices: invoices.length > 0 ? invoices : [],
          recentPayments: payments.length > 0 ? payments : [],
        });
      } catch (error) {
        console.error('Error fetching client data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClientData();
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
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return theme.colors.success;
      case 'pending':
        return COLORS.warning; // Use the constant instead
      case 'overdue':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };
  
  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading your dashboard...</Text>
        </View>
      </ScreenWrapper>
    );
  }
  
  return (
    <ScreenWrapper>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.nameText}>{user?.displayName || 'Client'}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
  
        {/* Credit Card */}
        <View style={styles.creditCard}>
          <View style={styles.creditHeader}>
            <Text style={styles.creditLabel}>Credit Limit</Text>
            <Text style={styles.creditAmount}>${dashboardData.creditInfo.limit.toFixed(2)}</Text>
          </View>
  
          <View style={styles.creditProgress}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: dashboardData.creditInfo.limit > 0 
                      ? `${(dashboardData.creditInfo.used / dashboardData.creditInfo.limit) * 100}%` 
                      : '0%' 
                  }
                ]} 
              />
            </View>
            <View style={styles.creditDetails}>
              <Text style={styles.creditDetail}>
                Available: ${dashboardData.creditInfo.available.toFixed(2)}
              </Text>
              <Text style={styles.creditDetail}>
                Used: ${dashboardData.creditInfo.used.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
  
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('MyInvoices')}
          >
            <View style={[styles.actionIcon, { backgroundColor: `${theme.colors.primary}20` }]}>
              <Ionicons name="document-text" size={24} color={theme.colors.primary} />
            </View>
            <Text style={styles.actionText}>Invoices</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('MyCreditAccount')}
          >
            <View style={[styles.actionIcon, { backgroundColor: `${theme.colors.success}20` }]}>
              <Ionicons name="card" size={24} color={theme.colors.success} />
            </View>
            <Text style={styles.actionText}>Credit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('MyPayments')}
          >
            <View style={[styles.actionIcon, { backgroundColor: `${COLORS.warning}20` }]}>
              <Ionicons name="cash" size={24} color={COLORS.warning} />
            </View>
            <Text style={styles.actionText}>Payments</Text>
          </TouchableOpacity>
        </View>
  
        {/* Recent Invoices */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Invoices</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MyInvoices')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
  
          {dashboardData.recentInvoices.length > 0 ? (
            dashboardData.recentInvoices.map((invoice, index) => (
              <TouchableOpacity 
                key={invoice.id || index} 
                style={styles.card}
                onPress={() => navigation.navigate('MyInvoices', { selectedInvoiceId: invoice.id })}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{invoice.provider}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(invoice.status)}20` }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(invoice.status) }]}>
                      {invoice.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.cardDetails}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Amount</Text>
                    <Text style={styles.detailValue}>{invoice.amount}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Date</Text>
                    <Text style={styles.detailValue}>{invoice.date}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptyStateText}>No invoices found</Text>
            </View>
          )}
        </View>
  
        {/* Recent Payments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Payments</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MyPayments')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
  
          {dashboardData.recentPayments.length > 0 ? (
            dashboardData.recentPayments.map((payment, index) => (
              <View key={payment.id || index} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{payment.provider}</Text>
                  <Text style={styles.paymentAmount}>{payment.amount}</Text>
                </View>
                <View style={styles.cardDetails}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Date</Text>
                    <Text style={styles.detailValue}>{payment.date}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Method</Text>
                    <Text style={styles.detailValue}>{payment.method}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Status</Text>
                    <Text style={[styles.detailValue, { color: payment.status === 'Completed' ? theme.colors.success : COLORS.warning }]}>
                      {payment.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="cash-outline" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptyStateText}>No payments found</Text>
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
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
  creditCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  creditHeader: {
    marginBottom: 20,
  },
  creditLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 4,
  },
  creditAmount: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  // Fix: Remove duplicate creditProgress definition
  creditProgress: {
    marginTop: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  creditDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  creditDetail: {
    color: 'white',
    fontSize: 14,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    alignItems: 'center',
    width: '30%',
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  viewAllText: {
    color: theme.colors.primary,
    fontSize: 14,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    marginRight: 16,
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.success,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  }
});
