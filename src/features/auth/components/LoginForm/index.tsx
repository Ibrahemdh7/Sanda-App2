import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FormInput } from '../../../../shared/components/forms/FormInput';
import { FormButton } from '../../../../shared/components/forms/FormButton';

interface LoginFormProps {
  onSubmit: (credentials: { email: string; password: string }) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = () => {
    onSubmit({ email, password });
  };

  return (
    <View style={styles.container}>
      <FormInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <FormInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <FormButton
        title="Login"
        onPress={handleSubmit}
        disabled={!email || !password}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
    width: '100%',
    paddingHorizontal: 16,
  },
});