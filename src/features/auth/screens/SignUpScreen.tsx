import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthNavigationProp } from '@/navigation/types';
import { useAuth } from '@/hooks/useAuth';
import { FormInput } from '@/shared/components/forms/FormInput';
import { CustomButton } from '@/shared/components/Button/CustomButton';
import { ScreenWrapper } from '@/shared/components/layouts/ScreenWrapper';
import { Text } from '@/shared/components/Text';
import { theme } from '@/theme/theme';
import { Formik } from 'formik';
import * as Yup from 'yup';

interface SignUpFormValues {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  role: 'provider' | 'client';
}

const validationSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  displayName: Yup.string().required('Full name is required'),
  role: Yup.string().oneOf(['provider', 'client']).required('Role is required')
});

export const SignUpScreen = () => {
  const navigation = useNavigation<AuthNavigationProp>();
  const { register } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSignUp = async (values: any) => {
    try {
      setServerError(null);
      await register(values.email, values.password, {
        displayName: values.displayName,
        role: values.role
      });
      navigation.navigate('SignIn');
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Registration failed');
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text variant="h1" style={styles.title}>Create Account</Text>
          <Text variant="body" style={styles.subtitle}>
            Join Sanad to manage your business finances
          </Text>
        </View>

        <Formik
          initialValues={{
            email: '',
            password: '',
            confirmPassword: '',
            displayName: '',
            role: 'client'
          }}
          validationSchema={validationSchema}
          onSubmit={handleSignUp}
        >
          {({ handleChange, handleSubmit, values, errors, touched, isSubmitting }) => (
            <View style={styles.form}>
              <FormInput
                label="Full Name"
                value={values.displayName}
                onChangeText={handleChange('displayName')}
                error={touched.displayName ? errors.displayName : undefined}
                autoCapitalize="words"
              />

              <FormInput
                label="Email"
                value={values.email}
                onChangeText={handleChange('email')}
                error={touched.email ? errors.email : undefined}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <FormInput
                label="Password"
                value={values.password}
                onChangeText={handleChange('password')}
                error={touched.password ? errors.password : undefined}
                secureTextEntry
              />

              <FormInput
                label="Confirm Password"
                value={values.confirmPassword}
                onChangeText={handleChange('confirmPassword')}
                error={touched.confirmPassword ? errors.confirmPassword : undefined}
                secureTextEntry
              />

              {serverError && (
                <Text style={styles.errorText}>{serverError}</Text>
              )}

              <CustomButton
                title="Sign Up"
                onPress={handleSubmit}
                loading={isSubmitting}
                variant="primary"
                style={styles.button}
              />

              <CustomButton
                title="Already have an account? Sign In"
                onPress={() => navigation.navigate('SignIn')}
                variant="text"
                style={styles.linkButton}
              />
            </View>
          )}
        </Formik>
      </ScrollView>
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
  button: {
    marginTop: theme.spacing.lg
  },
  linkButton: {
    marginTop: theme.spacing.md
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center'
  }
});