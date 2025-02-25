import React from 'react';
import { View, Text } from 'react-native';
import { ScreenWrapper } from '../../../../shared/components/layouts/ScreenWrapper';
import { LoginForm } from '../../components/LoginForm';
import { styles } from './styles';

export const LoginScreen = () => {
  const handleLogin = (credentials: { email: string; password: string }) => {
    // TODO: Implement login logic
    console.log('Login attempt:', credentials);
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to Sanad</Text>
        <LoginForm onSubmit={handleLogin} />
      </View>
    </ScreenWrapper>
  );
};