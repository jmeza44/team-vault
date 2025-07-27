import React from 'react';
import { Dialog } from '@/components/common/Dialog';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />,
          iconBg: 'bg-red-100 dark:bg-red-900',
          confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />,
          iconBg: 'bg-orange-100 dark:bg-orange-900',
          confirmButton: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500 dark:bg-orange-700 dark:hover:bg-orange-800'
        };
      case 'info':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
          iconBg: 'bg-blue-100 dark:bg-blue-900',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800'
        };
      default:
        return {
          icon: <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />,
          iconBg: 'bg-red-100 dark:bg-red-900',
          confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <div className={`flex-shrink-0 w-10 h-10 rounded-full ${styles.iconBg} flex items-center justify-center`}>
            {styles.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              {message}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${styles.confirmButton}`}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
