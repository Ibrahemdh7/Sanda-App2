type FontWeight = "normal" | "bold" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";

export const theme = {
  colors: {
    primary: '#2E5BFF',
    secondary: '#FF2E5B',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#1A1A1A',
    textSecondary: '#757575',
    border: '#E0E0E0',
    error: '#FF3B30',
    success: '#34C759'
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold'
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold'
    },
    body: {
      fontSize: 16
    },
    button: {
      fontSize: 18,
      fontWeight: '600' as FontWeight,
      textAlign: 'center' as const
    },
  }
};