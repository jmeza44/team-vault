import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from 'react';
import { Alert, AlertContextType } from '@/types/alert';

// Actions for the reducer
type AlertAction =
  | { type: 'ADD_ALERT'; payload: Alert }
  | { type: 'REMOVE_ALERT'; payload: string }
  | { type: 'CLEAR_ALERTS' };

// Reducer function
const alertReducer = (state: Alert[], action: AlertAction): Alert[] => {
  switch (action.type) {
    case 'ADD_ALERT':
      return [...state, action.payload];
    case 'REMOVE_ALERT':
      return state.filter(alert => alert.id !== action.payload);
    case 'CLEAR_ALERTS':
      return [];
    default:
      return state;
  }
};

// Create context
const AlertContext = createContext<AlertContextType | undefined>(undefined);

// Provider component
interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alerts, dispatch] = useReducer(alertReducer, []);

  const showAlert = useCallback((alertData: Omit<Alert, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const alert: Alert = {
      id,
      duration: 5000, // 5 seconds default
      dismissible: true,
      ...alertData,
    };

    dispatch({ type: 'ADD_ALERT', payload: alert });

    // Auto-dismiss if duration is set
    if (alert.duration && alert.duration > 0) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_ALERT', payload: id });
      }, alert.duration);
    }
  }, []);

  const dismissAlert = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ALERT', payload: id });
  }, []);

  const clearAlerts = useCallback(() => {
    dispatch({ type: 'CLEAR_ALERTS' });
  }, []);

  const value: AlertContextType = {
    alerts,
    showAlert,
    dismissAlert,
    clearAlerts,
  };

  return (
    <AlertContext.Provider value={value}>{children}</AlertContext.Provider>
  );
};

// Custom hook to use alert context
export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};
