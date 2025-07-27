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
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-400',
          titleColor: 'text-green-800',
          textColor: 'text-green-700',
          buttonColor: 'text-green-500 hover:bg-green-100',
        };
      case 'error':
        return {
          icon: XCircle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-400',
          titleColor: 'text-red-800',
          textColor: 'text-red-700',
          buttonColor: 'text-red-500 hover:bg-red-100',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-400',
          titleColor: 'text-yellow-800',
          textColor: 'text-yellow-700',
          buttonColor: 'text-yellow-500 hover:bg-yellow-100',
        };
      case 'info':
        return {
          icon: Info,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-400',
          titleColor: 'text-blue-800',
          textColor: 'text-blue-700',
          buttonColor: 'text-blue-500 hover:bg-blue-100',
        };
      default:
        return {
          icon: Info,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-400',
          titleColor: 'text-gray-800',
          textColor: 'text-gray-700',
          buttonColor: 'text-gray-500 hover:bg-gray-100',
        };
    }
  };

  const config = getAlertConfig(alert.type);
  const IconComponent = config.icon;

  return (
    <div
      className={`
        relative rounded-lg border p-4 shadow-lg backdrop-blur-sm
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
                  focus:outline-none focus:ring-2 focus:ring-offset-2
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
                  inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2
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
