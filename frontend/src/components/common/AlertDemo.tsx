import React from 'react';
import { useAlertActions } from '@/hooks/useAlerts';
import { CheckCircle, XCircle, AlertTriangle, Info, Zap } from 'lucide-react';

export const AlertDemo: React.FC = () => {
  const { showSuccess, showError, showWarning, showInfo } = useAlertActions();

  const demoSuccessAlert = () => {
    showSuccess(
      'Success!',
      'This is a success message with automatic dismiss',
      { duration: 3000 }
    );
  };

  const demoErrorAlert = () => {
    showError(
      'Error Occurred',
      'This is an error message that stays until dismissed',
      {
        duration: 0, // Won't auto-dismiss
        action: {
          label: 'Retry',
          onClick: () => showInfo('Retry', 'Retry action clicked!'),
        },
      }
    );
  };

  const demoWarningAlert = () => {
    showWarning(
      'Warning',
      'This is a warning message that auto-dismisses after 8 seconds',
      {
        action: {
          label: 'View Details',
          onClick: () => showInfo('Details', 'Warning details viewed'),
        },
      }
    );
  };

  const demoInfoAlert = () => {
    showInfo(
      'Information',
      'This is an informational message with standard timing'
    );
  };

  const demoMultipleAlerts = () => {
    showSuccess('First Alert', 'This will appear first');
    setTimeout(
      () => showWarning('Second Alert', 'This appears after a delay'),
      500
    );
    setTimeout(() => showInfo('Third Alert', 'This appears last'), 1000);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
        <Zap className="h-5 w-5 text-blue-500 dark:text-blue-400" />
        Alert System Demo
      </h3>

      <p className="mb-6 text-gray-600 dark:text-gray-300">
        Click the buttons below to test different types of alerts. Notice how
        they appear in the top-right corner with proper z-index positioning over
        all other elements.
      </p>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <button
          onClick={demoSuccessAlert}
          className="flex items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
        >
          <CheckCircle className="h-4 w-4" />
          Success
        </button>

        <button
          onClick={demoErrorAlert}
          className="flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
        >
          <XCircle className="h-4 w-4" />
          Error
        </button>

        <button
          onClick={demoWarningAlert}
          className="flex items-center justify-center gap-2 rounded-md bg-yellow-600 px-4 py-2 text-white transition-colors hover:bg-yellow-700"
        >
          <AlertTriangle className="h-4 w-4" />
          Warning
        </button>

        <button
          onClick={demoInfoAlert}
          className="flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          <Info className="h-4 w-4" />
          Info
        </button>

        <button
          onClick={demoMultipleAlerts}
          className="col-span-2 flex items-center justify-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700 md:col-span-2"
        >
          <Zap className="h-4 w-4" />
          Multiple Alerts
        </button>
      </div>

      <div className="mt-6 rounded-md bg-gray-50 p-4 dark:bg-gray-700">
        <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
          Features Demonstrated:
        </h4>
        <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
          <li>
            • <strong>Different alert types</strong> with appropriate colors and
            icons
          </li>
          <li>
            • <strong>Auto-dismiss</strong> with configurable timing
          </li>
          <li>
            • <strong>Manual dismiss</strong> with close button
          </li>
          <li>
            • <strong>Action buttons</strong> for interactive alerts
          </li>
          <li>
            • <strong>Stacking</strong> when multiple alerts are shown
          </li>
          <li>
            • <strong>High z-index</strong> positioning over dialogs and modals
          </li>
          <li>
            • <strong>Responsive design</strong> that works on all screen sizes
          </li>
        </ul>
      </div>
    </div>
  );
};
