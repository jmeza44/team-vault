import { useAlert } from '@/contexts';

export const useAlertActions = () => {
  const { showAlert } = useAlert();

  const showSuccess = (
    title: string,
    message?: string,
    options?: {
      duration?: number;
      action?: { label: string; onClick: () => void; };
    }
  ) => {
    showAlert({
      type: 'success',
      title,
      message,
      ...options,
    });
  };

  const showError = (
    title: string,
    message?: string,
    options?: {
      duration?: number;
      action?: { label: string; onClick: () => void; };
    }
  ) => {
    showAlert({
      type: 'error',
      title,
      message,
      duration: 0, // Errors don't auto-dismiss by default
      ...options,
    });
  };

  const showWarning = (
    title: string,
    message?: string,
    options?: {
      duration?: number;
      action?: { label: string; onClick: () => void; };
    }
  ) => {
    showAlert({
      type: 'warning',
      title,
      message,
      duration: 8000, // Warnings last longer
      ...options,
    });
  };

  const showInfo = (
    title: string,
    message?: string,
    options?: {
      duration?: number;
      action?: { label: string; onClick: () => void; };
    }
  ) => {
    showAlert({
      type: 'info',
      title,
      message,
      ...options,
    });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

// Helper function to handle API errors
export const useApiErrorHandler = () => {
  const { showError } = useAlertActions();

  const handleApiError = (
    error: any,
    defaultMessage = 'An unexpected error occurred'
  ) => {
    let title = 'Error';
    let message = defaultMessage;

    if (error?.response?.data?.error?.message) {
      message = error.response.data.error.message;
    } else if (error?.message) {
      message = error.message;
    }

    if (error?.response?.status) {
      switch (error.response.status) {
        case 401:
          title = 'Authentication Error';
          message = 'Please log in again to continue';
          break;
        case 403:
          title = 'Access Denied';
          message = 'You do not have permission to perform this action';
          break;
        case 404:
          title = 'Not Found';
          message = 'The requested resource was not found';
          break;
        case 422:
          title = 'Validation Error';
          break;
        case 500:
          title = 'Server Error';
          message = 'An internal server error occurred. Please try again later';
          break;
        default:
          title = `Error ${error.response.status}`;
      }
    }

    showError(title, message);
  };

  return { handleApiError };
};
