import { useState } from 'react';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  loading: boolean;
  onConfirm: () => void | Promise<void>;
}

export const useConfirm = () => {
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    loading: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        ...options,
        isOpen: true,
        loading: false,
        onConfirm: () => {
          resolve(true);
          setConfirmState(prev => ({ ...prev, isOpen: false }));
        },
      });

      // Handle cancel/close
      const handleCancel = () => {
        resolve(false);
        setConfirmState(prev => ({ ...prev, isOpen: false }));
      };

      // Store cancel handler for later use
      (setConfirmState as any).cancelHandler = handleCancel;
    });
  };

  const confirmAsync = (options: ConfirmOptions, asyncAction: () => Promise<void>): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        ...options,
        isOpen: true,
        loading: false,
        onConfirm: async () => {
          try {
            setConfirmState(prev => ({ ...prev, loading: true }));
            await asyncAction();
            resolve(true);
          } catch (error) {
            resolve(false);
            throw error; // Re-throw so the caller can handle it
          } finally {
            setConfirmState(prev => ({ ...prev, isOpen: false, loading: false }));
          }
        },
      });

      // Handle cancel/close
      const handleCancel = () => {
        resolve(false);
        setConfirmState(prev => ({ ...prev, isOpen: false }));
      };

      // Store cancel handler for later use
      (setConfirmState as any).cancelHandler = handleCancel;
    });
  };

  const handleClose = () => {
    if ((setConfirmState as any).cancelHandler) {
      (setConfirmState as any).cancelHandler();
    } else {
      setConfirmState(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleConfirm = async () => {
    if (confirmState.onConfirm) {
      await confirmState.onConfirm();
    }
  };

  return {
    confirm,
    confirmAsync,
    confirmState,
    handleClose,
    handleConfirm,
  };
};
