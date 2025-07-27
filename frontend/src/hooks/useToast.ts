import { useAlertActions } from '@/hooks/useAlerts';

interface UseToastReturn {
  showCopySuccess: (label: string) => void;
  showCopyError: () => void;
}

export const useToast = (): UseToastReturn => {
  const { showSuccess, showError } = useAlertActions();

  const showCopySuccess = (label: string) => {
    showSuccess('Copied!', `${label} copied to clipboard`, { duration: 2000 });
  };

  const showCopyError = () => {
    showError('Copy Failed', 'Unable to copy to clipboard');
  };

  return {
    showCopySuccess,
    showCopyError
  };
};
