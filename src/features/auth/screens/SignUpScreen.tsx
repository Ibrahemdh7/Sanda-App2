import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  Alert,
  Image 
} from 'react-native';
import { ScreenWrapper } from '../../../shared/components/layouts/ScreenWrapper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { CustomButton } from '../../../shared/components/Button/CustomButton';
import { theme } from '../../../theme/theme';
import { useAuth } from '../../../hooks/useAuth';
import { Picker } from '@react-native-picker/picker';
import { User } from '../../../types';
import { Ionicons } from '@expo/vector-icons';

type SignUpScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<User['role']>('client');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [confirmSecureTextEntry, setConfirmSecureTextEntry] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');

  const validateStep1 = () => {
    if (!displayName.trim()) {
      setError('Please enter your full name');
      return false;
    }
    
    if (!email.trim()) {
      setError('Please enter your email');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return false;
    }
    
    return true;
  };
  
  const validateStep2 = () => {
    if (!password) {
      setError('Please enter a password');
      return false;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setError(null);
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      setError(null);
    }
  };

  const handleSignUp = async () => {
    if (!validateStep2()) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      await register(email, password, {
        displayName,
        phoneNumber,
        role
      });
      
      // If successful, the auth state listener will handle navigation
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <>
      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={22} color={theme.colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={displayName}
          onChangeText={(text) => {
            setDisplayName(text);
            setError(null);
          }}
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={22} color={theme.colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setError(null);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Ionicons name="call-outline" size={22} color={theme.colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeText={(text) => {
            setPhoneNumber(text);
            setError(null);
          }}
          keyboardType="phone-pad"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>
      
      <View style={styles.roleContainer}>
        <Text style={styles.roleLabel}>I am a:</Text>
        <View style={styles.roleButtonsContainer}>
          <TouchableOpacity 
            style={[
              styles.roleButton, 
              role === 'client' && styles.selectedRoleButton
            ]}
            onPress={() => setRole('client')}
          >
            <Ionicons 
              name="people-outline" 
              size={22} 
              color={role === 'client' ? theme.colors.primary : theme.colors.textSecondary} 
            />
            <Text style={[
              styles.roleButtonText,
              role === 'client' && styles.selectedRoleButtonText
            ]}>Client</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.roleButton, 
              role === 'provider' && styles.selectedRoleButton
            ]}
            onPress={() => setRole('provider')}
          >
            <Ionicons 
              name="business-outline" 
              size={22} 
              color={role === 'provider' ? theme.colors.primary : theme.colors.textSecondary} 
            />
            <Text style={[
              styles.roleButtonText,
              role === 'provider' && styles.selectedRoleButtonText
            ]}>Provider</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={20} color={theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      <CustomButton 
        title="Next"
        onPress={handleNextStep}
        variant="primary"
        style={styles.actionButton}
      />
    </>
  );

  const renderStep2 = () => (
    <>
      <View style={styles.stepIndicator}>
        <TouchableOpacity onPress={handlePrevStep}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.stepTitle}>Set Password</Text>
        <View style={{ width: 24 }} />
      </View>
    
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={22} color={theme.colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setError(null);
          }}
          secureTextEntry={secureTextEntry}
          placeholderTextColor={theme.colors.textSecondary}
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
      
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={22} color={theme.colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setError(null);
          }}
          secureTextEntry={confirmSecureTextEntry}
          placeholderTextColor={theme.colors.textSecondary}
        />
        <TouchableOpacity 
          onPress={() => setConfirmSecureTextEntry(!confirmSecureTextEntry)}
          style={styles.eyeIcon}
        >
          <Ionicons 
            name={confirmSecureTextEntry ? "eye-outline" : "eye-off-outline"} 
            size={22} 
            color={theme.colors.textSecondary} 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.passwordRequirements}>
        <Text style={styles.requirementsTitle}>Password must:</Text>
        <View style={styles.requirement}>
          <Ionicons 
            name={password.length >= 6 ? "checkmark-circle" : "ellipse-outline"} 
            size={16} 
            color={password.length >= 6 ? theme.colors.success : theme.colors.textSecondary} 
          />
          <Text style={styles.requirementText}>Be at least 6 characters</Text>
        </View>
        <View style={styles.requirement}>
          <Ionicons 
            name={password === confirmPassword && password.length > 0 ? "checkmark-circle" : "ellipse-outline"} 
            size={16} 
            color={password === confirmPassword && password.length > 0 ? theme.colors.success : theme.colors.textSecondary} 
          />
          <Text style={styles.requirementText}>Passwords match</Text>
        </View>
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={20} color={theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      <CustomButton 
        title={isLoading ? "Creating Account..." : "Create Account"}
        onPress={handleSignUp}
        variant="primary"
        loading={isLoading}
        style={styles.actionButton}
      />
    </>
  );

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
            </View>
            
            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join Sanad today</Text>
            </View>

            <View style={styles.stepIndicatorContainer}>
              <View style={styles.stepDot}>
                <Text style={[styles.stepNumber, currentStep >= 1 && styles.activeStepNumber]}>1</Text>
              </View>
              <View style={[styles.stepLine, currentStep >= 2 && styles.activeStepLine]} />
              <View style={[styles.stepDot, currentStep >= 2 && styles.activeStepDot]}>
                <Text style={[styles.stepNumber, currentStep >= 2 && styles.activeStepNumber]}>2</Text>
              </View>
            </View>

            <View style={styles.form}>
              {currentStep === 1 ? renderStep1() : renderStep2()}
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Auth', { screen: 'SignIn' })}>
                <Text style={styles.footerLink}>Sign In</Text>
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
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: theme.spacing.md,
  },
  logo: {
    width: 60,
    height: 60,
  },
  header: {
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
  },
  stepDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStepDot: {
    backgroundColor: theme.colors.primary,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
  },
  activeStepNumber: {
    color: 'white',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 10,
  },
  activeStepLine: {
    backgroundColor: theme.colors.primary,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
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
  roleContainer: {
    marginVertical: theme.spacing.md,
  },
  roleLabel: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 8,
  },
  roleButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    width: '48%',
  },
  selectedRoleButton: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },
  roleButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  selectedRoleButtonText: {
    color: theme.colors.primary,
    fontWeight: '500',
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
  actionButton: {
    marginTop: theme.spacing.md,
  },
  passwordRequirements: {
    backgroundColor: '#F8F9FA',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: 8,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: theme.colors.text,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  requirementText: {
    marginLeft: 8,
    fontSize: 14,
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