import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenWrapper } from '@/shared/components/layouts/ScreenWrapper';

export const HomeScreen = () => {
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text>Home Screen</Text>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});