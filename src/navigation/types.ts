import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Auth Stack Types
export type AuthStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  SignUp: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;

// Admin Stack Types
export type AdminStackParamList = {
  AdminDashboard: undefined;
  UserManagement: undefined;
  SystemSettings: undefined;
  Reports: undefined;
};

// Provider Stack Types
export type ProviderStackParamList = {
  ProviderDashboard: undefined;
  Clients: undefined;
  Invoices: undefined;
  CreditAccounts: undefined;
  Payments: undefined;
};

// Client Stack Types
export type ClientStackParamList = {
  ClientDashboard: undefined;
  MyInvoices: undefined;
  MyCreditAccount: undefined;
  MyPayments: undefined;
};

// Shared Stack Types
export type SharedStackParamList = {
  Profile: undefined;
  Notifications: undefined;
  Settings: undefined;
};

// Root Stack Types
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Admin: NavigatorScreenParams<AdminStackParamList>;
  Provider: NavigatorScreenParams<ProviderStackParamList>;
  Client: NavigatorScreenParams<ClientStackParamList>;
  Shared: NavigatorScreenParams<SharedStackParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}