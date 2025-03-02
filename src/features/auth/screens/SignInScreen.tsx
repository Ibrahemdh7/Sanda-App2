import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { ScreenWrapper } from '../../../shared/components/layouts/ScreenWrapper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { CustomButton } from '../../../shared/components/Button/CustomButton';
import { theme } from '../../../theme/theme';
import { useAuth } from '../../../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';

export const SignInScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { login, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  
  // Auto-navigate when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User authenticated, navigating to appropriate stack. Role:', user.role);
      
      // Navigate to the appropriate stack based on user role
      switch (user.role) {
        case 'admin':
          navigation.reset({ index: 0, routes: [{ name: 'Admin' }] });
          break;
        case 'provider':
          navigation.reset({ index: 0, routes: [{ name: 'Provider' }] });
          break;
        case 'client':
          navigation.reset({ index: 0, routes: [{ name: 'Client' }] });
          break;
        default:
          console.warn('Unknown user role:', user.role);
      }
    }
  }, [isAuthenticated, user, navigation]);
  
  const validateInputs = (): boolean => {
    // Reset previous errors
    setError(null);
    
    // Validate email
    if (!email.trim()) {
      setError('Please enter your email');
      return false;
    }
    
    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    // Validate password
    if (!password) {
      setError('Please enter your password');
      return false;
    }
    
    return true;
  };
  
  const handleSignIn = async () => {
    if (!validateInputs()) {
      return;
    }
    
    try {
      console.log('Starting login process for:', email);
      setIsLoading(true);
      setError(null);
      
      await login(email, password);
      console.log('Login successful');
      
      // Navigation is handled by the useEffect hook above
    } catch (err) {
      console.error('Login error in SignInScreen:', err);
      const errorMessage = err instanceof Error ? err.message : 'Sign in failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Show a specific message for demo accounts (only in development)
  const renderDemoMessage = () => {
    if (__DEV__) {
      return (
        <View style={styles.demoMessage}>
          <Text style={styles.demoMessageText}>
            <Text style={{ fontWeight: 'bold' }}>Demo accounts available:</Text>{'\n'}
            Email: admin@sanad.com | Password: password123{'\n'}
            Email: provider@sanad.com | Password: password123{'\n'}
            Email: client@sanad.com | Password: password123
          </Text>
        </View>
      );
    }
    return null;
  };
  
  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../../../assets/splash-icon.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.appName}>SANAD</Text>
            </View>
            
            <View style={styles.header}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to continue to Sanad</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={22} color={theme.colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (error) setError(null);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={theme.colors.textSecondary}
                  testID="email-input"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={22} color={theme.colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (error) setError(null);
                  }}
                  secureTextEntry={secureTextEntry}
                  placeholderTextColor={theme.colors.textSecondary}
                  testID="password-input"
                />
                <TouchableOpacity 
                  onPress={() => setSecureTextEntry(!secureTextEntry)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={secureTextEntry ? "eye-outline" : "eye-off-outline"} 
                    size={22} 
                    color={theme.colors.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
              
              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={20} color={theme.colors.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
              
              <TouchableOpacity 
                onPress={() => navigation.navigate('Auth', { screen: 'ForgotPassword' })}
                style={styles.forgotPassword}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <CustomButton 
                title={isLoading ? "Signing in..." : "Sign In"}
                onPress={handleSignIn}
                variant="primary"
                loading={isLoading}
                style={styles.signInButton}
              />
              
              {renderDemoMessage()}
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Auth', { screen: 'SignUp' })}>
                <Text style={styles.footerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logo: {
    width: 80,
    height: 80,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: 8,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    gap: theme.spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: theme.spacing.md,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
  },
  eyeIcon: {
    padding: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.error}15`,
    padding: 10,
    borderRadius: theme.borderRadius.md,
  },
  errorText: {
    color: theme.colors.error,
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  forgotPasswordText: {
    color: theme.colors.primary,
    fontSize: 14,
  },
  signInButton: {
    marginTop: theme.spacing.md,
  },
  demoMessage: {
    marginTop: theme.spacing.lg,
    backgroundColor: '#F8F9FA',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  demoMessageText: {
    fontSize: 12,
    lineHeight: 18,
    color: theme.colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
  },
  footerText: {
    color: theme.colors.textSecondary,
  },
  footerLink: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
});