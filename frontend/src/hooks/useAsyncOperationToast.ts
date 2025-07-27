import { useState } from 'react';

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
