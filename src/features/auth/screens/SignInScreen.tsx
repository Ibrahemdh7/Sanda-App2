import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TextInput, TouchableOpacity, TextStyle } from 'react-native';
import { ScreenWrapper } from '../../../shared/components/layouts/ScreenWrapper';
import { useNavigation } from '@react-navigation/native';
import { AuthNavigationProp } from '../../../navigation/types';
import { CustomButton } from '../../../shared/components/Button/CustomButton';
import { theme } from '../../../theme/theme';

export const SignInScreen: React.FC = () => {
  const navigation = useNavigation<AuthNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
    // Implement sign in logic
    console.log('Sign in:', { email, password });
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
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <CustomButton 
            title="Sign In" 
            onPress={handleSignIn}
            variant="primary"
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
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
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm
  },
  subtitle: {
    ...theme.typography.body,
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
    ...theme.typography.body
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