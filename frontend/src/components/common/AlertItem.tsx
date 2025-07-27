import React from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { Alert as AlertType } from '@/types/alert';
import { useAlert } from '@/contexts/AlertContext';

interface AlertItemProps {
  alert: AlertType;
}

const AlertItem: React.FC<AlertItemProps> = ({ alert }) => {
  const { dismissAlert } = useAlert();

  const getAlertConfig = (type: AlertType['type']) => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50 dark:bg-green-900/60',
          borderColor: 'border-green-200 dark:border-green-800',
          iconColor: 'text-green-400 dark:text-green-400',
          titleColor: 'text-green-800 dark:text-green-200',
          textColor: 'text-green-700 dark:text-green-300',
          buttonColor: 'text-green-500 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-800/60',
        };
      case 'error':
        return {
          icon: XCircle,
          bgColor: 'bg-red-50 dark:bg-red-900/60',
          borderColor: 'border-red-200 dark:border-red-800',
          iconColor: 'text-red-400 dark:text-red-400',
          titleColor: 'text-red-800 dark:text-red-200',
          textColor: 'text-red-700 dark:text-red-300',
          buttonColor: 'text-red-500 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-800/60',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/60',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          iconColor: 'text-yellow-400 dark:text-yellow-400',
          titleColor: 'text-yellow-800 dark:text-yellow-200',
          textColor: 'text-yellow-700 dark:text-yellow-300',
          buttonColor: 'text-yellow-500 hover:bg-yellow-100 dark:text-yellow-400 dark:hover:bg-yellow-800/60',
        };
      case 'info':
        return {
          icon: Info,
          bgColor: 'bg-blue-50 dark:bg-blue-900/60',
          borderColor: 'border-blue-200 dark:border-blue-800',
          iconColor: 'text-blue-400 dark:text-blue-400',
          titleColor: 'text-blue-800 dark:text-blue-200',
          textColor: 'text-blue-700 dark:text-blue-300',
          buttonColor: 'text-blue-500 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-800/60',
        };
      default:
        return {
          icon: Info,
          bgColor: 'bg-gray-50 dark:bg-gray-800/50',
          borderColor: 'border-gray-200 dark:border-gray-700',
          iconColor: 'text-gray-400 dark:text-gray-500',
          titleColor: 'text-gray-800 dark:text-gray-200',
          textColor: 'text-gray-700 dark:text-gray-300',
          buttonColor: 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/60',
        };
    }
  };

  const config = getAlertConfig(alert.type);
  const IconComponent = config.icon;

  return (
    <div
      className={`
        relative rounded-lg border p-4 shadow-md
        ${config.bgColor} ${config.borderColor}
        transform transition-all duration-300 ease-in-out
        animate-slide-up
      `}
      role="alert"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <IconComponent className={`h-5 w-5 ${config.iconColor}`} aria-hidden="true" />
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${config.titleColor}`}>
            {alert.title}
          </h3>
          
          {alert.message && (
            <div className={`mt-1 text-sm ${config.textColor}`}>
              {alert.message}
            </div>
          )}
          
          {alert.action && (
            <div className="mt-3">
              <button
                type="button"
                onClick={alert.action.onClick}
                className={`
                  rounded-md text-sm font-medium underline
                  ${config.textColor} hover:no-underline
                  focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800
                  focus:ring-${alert.type === 'success' ? 'green' : 
                    alert.type === 'error' ? 'red' : 
                    alert.type === 'warning' ? 'yellow' : 'blue'}-500
                `}
              >
                {alert.action.label}
              </button>
            </div>
          )}
        </div>
        
        {alert.dismissible && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={() => dismissAlert(alert.id)}
                className={`
                  inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800
                  ${config.buttonColor}
                  focus:ring-${alert.type === 'success' ? 'green' : 
                    alert.type === 'error' ? 'red' : 
                    alert.type === 'warning' ? 'yellow' : 'blue'}-500
                `}
                aria-label="Dismiss alert"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertItem;
