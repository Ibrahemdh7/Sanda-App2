import React from 'react';
import { Text as RNText, TextStyle, StyleSheet } from 'react-native';
import { theme } from '@/theme/theme';

interface TextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'body' | 'caption';
  style?: TextStyle;
}

export const Text: React.FC<TextProps> = ({ children, variant = 'body', style }) => {
  return (
    <RNText style={[styles[variant], style]}>
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  h1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text
  },
  h2: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text
  },
  body: {
    fontSize: 16,
    color: theme.colors.text
  },
  caption: {
    fontSize: 14,
    color: theme.colors.textSecondary
  }
});