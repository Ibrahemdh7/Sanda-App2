import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, TextStyle, Alert } from 'react-native';
import { ScreenWrapper } from '../../../shared/components/layouts/ScreenWrapper';
import { useNavigation } from '@react-navigation/native';
import { AuthNavigationProp } from '../../../navigation/types';
import { CustomButton } from '../../../shared/components/Button/CustomButton';
import { theme } from '../../../theme/theme';
import { useAuth } from '../../../hooks/useAuth';
import { Picker } from '@react-native-picker/picker';
import { User } from '../../../types';

export const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<AuthNavigationProp>();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<User['role']>('client');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    try {
      setIsLoading(true);
      await register(email, password, {
        displayName,
        role
      });
      navigation.navigate('SignIn');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title as TextStyle}>Create Account</Text>
          <Text style={styles.subtitle}>Join Sanad today</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.textInput}
            placeholder="Full Name"
            value={displayName}
            onChangeText={setDisplayName}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.textInput}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={role}
              onValueChange={(itemValue: User['role']) => setRole(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Client" value="client" />
              <Picker.Item label="Provider" value="provider" />
              <Picker.Item label="Admin" value="admin" />
            </Picker>
          </View>

          <CustomButton 
            title="Sign Up" 
            onPress={handleSignUp}
            variant="primary"
            loading={isLoading}
          />
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: theme.spacing.xl
  },
  header: {
    marginBottom: theme.spacing.xl
  },
  title: {
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs
  },
  subtitle: {
    color: theme.colors.textSecondary
  },
  form: {
    gap: theme.spacing.lg
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16
  },
  button: {
    marginTop: theme.spacing.lg
  },
  linkButton: {
    marginTop: theme.spacing.md
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center'
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  footerContainer: {
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