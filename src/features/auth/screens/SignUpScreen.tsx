import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { ScreenWrapper } from '../../../shared/components/layouts/ScreenWrapper';
import { useNavigation } from '@react-navigation/native';
import { AuthNavigationProp } from '../../../navigation/types';

export const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<AuthNavigationProp>();

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Sign Up</Text>
        <Button title="Back to Welcome" onPress={() => navigation.navigate('Welcome')} />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});