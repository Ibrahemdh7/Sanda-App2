import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenWrapper } from '@/shared/components/layouts/ScreenWrapper';

export const InvoicesScreen = () => {
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text>Invoices Screen</Text>
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