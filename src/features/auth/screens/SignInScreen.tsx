import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, TextStyle, Alert } from 'react-native';
import { ScreenWrapper } from '../../../shared/components/layouts/ScreenWrapper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { CustomButton } from '../../../shared/components/Button/CustomButton';
import { theme } from '../../../theme/theme';
import { useAuth } from '../../../hooks/useAuth';

export const SignInScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await login(email, password);
      
      // Navigate based on the user role
      if (user?.role === 'admin') {
        navigation.navigate('Admin');
      } else if (user?.role === 'provider') {
        navigation.navigate('Provider');
      } else if (user?.role === 'client') {
        navigation.navigate('Client');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title as TextStyle}>Sign In</Text>
          <Text style={styles.subtitle}>Welcome back to Sanad</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity 
            onPress={() => navigation.navigate('Auth', { screen: 'ForgotPassword' })}
            style={styles.forgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <CustomButton 
            title="Sign In" 
            onPress={handleSignIn}
            variant="primary"
            loading={isLoading}
          />
          
          <View style={styles.demoUsers}>
            <Text style={styles.demoTitle}>Demo Users:</Text>
            <Text style={styles.demoText}>Admin: admin@sanad.com</Text>
            <Text style={styles.demoText}>Provider: provider@sanad.com</Text>
            <Text style={styles.demoText}>Client: client@sanad.com</Text>
            <Text style={styles.demoText}>(Any password will work)</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Auth', { screen: 'SignUp' })}>
            <Text style={styles.footerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: 'space-between'
  },
  header: {
    marginBottom: theme.spacing.xl
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary
  },
  form: {
    gap: theme.spacing.md
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16
  },
  forgotPassword: {
    alignSelf: 'flex-end'
  },
  forgotPasswordText: {
    color: theme.colors.primary,
    fontSize: 14
  },
  demoUsers: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8
  },
  demoTitle: {
    fontWeight: 'bold',
    marginBottom: 5
  },
  demoText: {
    fontSize: 12,
    color: '#666'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.xl
  },
  footerText: {
    color: theme.colors.textSecondary
  },
  footerLink: {
    color: theme.colors.primary,
    fontWeight: 'bold'
  }
});