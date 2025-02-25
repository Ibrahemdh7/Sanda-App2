import React from 'react';
import { View, Text, StyleSheet, Image, TextStyle } from 'react-native';
import { ScreenWrapper } from '../../../shared/components/layouts/ScreenWrapper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { CustomButton } from '../../../shared/components/Button/CustomButton';
import { theme } from '../../../theme/theme';

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Image 
            style={styles.logo}
            source={require('../../../../assets/splash-icon.png')}
            resizeMode="contain"
          />
          <Text style={styles.title as TextStyle}>Welcome to Sanad</Text>
          <Text style={styles.subtitle}>Your trusted financial companion</Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <CustomButton 
            title="Sign In" 
            onPress={() => navigation.navigate('Auth', { screen: 'SignIn' })}
            variant="primary"
          />
          <CustomButton 
            title="Sign Up" 
            onPress={() => navigation.navigate('Auth', { screen: 'SignUp' })}
            variant="secondary"
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: theme.spacing.xl
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: theme.spacing.xl
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary
  },
  buttonContainer: {
    gap: theme.spacing.md
  }
});