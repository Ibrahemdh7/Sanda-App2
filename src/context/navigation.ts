import { createContext } from 'react';
import { NavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';

export const NavigationContext = createContext<NavigationContainerRef<RootStackParamList> | null>(null);
