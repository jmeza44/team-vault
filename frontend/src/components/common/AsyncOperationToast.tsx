import React, { useEffect, useState } from 'react';
import { Check, X, Loader2, AlertCircle } from 'lucide-react';

interface AsyncOperationToastProps {
  isVisible: boolean;
  status: 'loading' | 'success' | 'error' | 'idle';
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
  onClose?: () => void;
  autoCloseDelay?: number;
}

export const AsyncOperationToast: React.FC<AsyncOperationToastProps> = ({
  isVisible,
  status,
  loadingMessage = 'Processing...',
  successMessage = 'Operation completed successfully',
  errorMessage = 'Operation failed',
  onClose,
  autoCloseDelay = 3000,
}) => {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (isVisible && status !== 'idle') {
      setShouldShow(true);
    }
  }, [isVisible, status]);

  useEffect(() => {
    if (status === 'success' || status === 'error') {
      const timer = setTimeout(() => {
        setShouldShow(false);
        onClose?.();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [status, autoCloseDelay, onClose]);

  if (!shouldShow || status === 'idle') {
    return null;
  }

  const getToastConfig = () => {
    switch (status) {
      case 'loading':
        return {
          icon: <Loader2 className="h-5 w-5 animate-spin" />,
          message: loadingMessage,
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          textColor: 'text-blue-800 dark:text-blue-200',
          iconColor: 'text-blue-600 dark:text-blue-400',
        };
      case 'success':
        return {
          icon: <Check className="h-5 w-5" />,
          message: successMessage,
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          textColor: 'text-green-800 dark:text-green-200',
          iconColor: 'text-green-600 dark:text-green-400',
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          message: errorMessage,
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          textColor: 'text-red-800 dark:text-red-200',
          iconColor: 'text-red-600 dark:text-red-400',
        };
      default:
        return {
          icon: null,
          message: '',
          bgColor: '',
          borderColor: '',
          textColor: '',
          iconColor: '',
        };
    }
  };

  const config = getToastConfig();

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 transform transition-all duration-300 ease-in-out ${
        shouldShow ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}
    >
      <div
        className={`flex items-center space-x-3 rounded-lg border p-4 shadow-lg ${config.bgColor} ${config.borderColor}`}
      >
        <div className={config.iconColor}>{config.icon}</div>
        <p className={`text-sm font-medium ${config.textColor}`}>
          {config.message}
        </p>
        {status !== 'loading' && (
          <button
            onClick={() => {
              setShouldShow(false);
              onClose?.();
            }}
            className={`ml-2 ${config.textColor} hover:opacity-70`}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// Hook for easy usage
export const useAsyncOperationToast = () => {
  const [toastState, setToastState] = useState<{
    isVisible: boolean;
    status: 'loading' | 'success' | 'error' | 'idle';
    loadingMessage?: string;
    successMessage?: string;
    errorMessage?: string;
  }>({
    isVisible: false,
    status: 'idle',
  });

  const showLoading = (message?: string) => {
    setToastState({
      isVisible: true,
      status: 'loading',
      loadingMessage: message,
    });
  };

  const showSuccess = (message?: string) => {
    setToastState(prev => ({
      ...prev,
      status: 'success',
      successMessage: message,
    }));
  };

  const showError = (message?: string) => {
    setToastState(prev => ({
      ...prev,
      status: 'error',
      errorMessage: message,
    }));
  };

  const hideToast = () => {
    setToastState(prev => ({
      ...prev,
      isVisible: false,
      status: 'idle',
    }));
  };

  return {
    toastState,
    showLoading,
    showSuccess,
    showError,
    hideToast,
  };
};
