export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}