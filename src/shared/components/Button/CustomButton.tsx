import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../../../theme/theme';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  style,
  textStyle,
  disabled = false
}) => {
  const buttonStyles = [
    styles.button,
    variant === 'primary' && styles.primaryButton,
    variant === 'secondary' && styles.secondaryButton,
    variant === 'outline' && styles.outlineButton,
    disabled && styles.disabledButton,
    style
  ];

  const textStyles = [
    styles.text,
    variant === 'outline' && styles.outlineText,
    disabled && styles.disabledText,
    textStyle
  ];

  return (
    <TouchableOpacity 
      style={buttonStyles} 
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={textStyles}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
    marginVertical: theme.spacing.sm,
    elevation: 2,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  primaryButton: {
    backgroundColor: theme.colors.primary
  },
  secondaryButton: {
    backgroundColor: theme.colors.secondary
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    elevation: 0,
    shadowColor: 'transparent'
  },
  disabledButton: {
    backgroundColor: theme.colors.border,
    borderColor: theme.colors.border,
    elevation: 0,
    shadowColor: 'transparent'
  },
  text: {
    color: theme.colors.background,
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight ,
    textAlign: 'center' as const
  },
  outlineText: {
    color: theme.colors.primary
  },
  disabledText: {
    color: theme.colors.textSecondary
  }
});