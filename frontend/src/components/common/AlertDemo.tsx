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
          onClick: () => showInfo('Retry', 'Retry action clicked!')
        }
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
          onClick: () => showInfo('Details', 'Warning details viewed')
        }
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
    setTimeout(() => showWarning('Second Alert', 'This appears after a delay'), 500);
    setTimeout(() => showInfo('Third Alert', 'This appears last'), 1000);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Zap className="h-5 w-5 text-blue-500" />
        Alert System Demo
      </h3>
      
      <p className="text-gray-600 mb-6">
        Click the buttons below to test different types of alerts. Notice how they appear in the top-right corner 
        with proper z-index positioning over all other elements.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <button
          onClick={demoSuccessAlert}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <CheckCircle className="h-4 w-4" />
          Success
        </button>

        <button
          onClick={demoErrorAlert}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          <XCircle className="h-4 w-4" />
          Error
        </button>

        <button
          onClick={demoWarningAlert}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
        >
          <AlertTriangle className="h-4 w-4" />
          Warning
        </button>

        <button
          onClick={demoInfoAlert}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Info className="h-4 w-4" />
          Info
        </button>

        <button
          onClick={demoMultipleAlerts}
          className="col-span-2 md:col-span-2 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          <Zap className="h-4 w-4" />
          Multiple Alerts
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h4 className="font-medium text-gray-900 mb-2">Features Demonstrated:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>Different alert types</strong> with appropriate colors and icons</li>
          <li>• <strong>Auto-dismiss</strong> with configurable timing</li>
          <li>• <strong>Manual dismiss</strong> with close button</li>
          <li>• <strong>Action buttons</strong> for interactive alerts</li>
          <li>• <strong>Stacking</strong> when multiple alerts are shown</li>
          <li>• <strong>High z-index</strong> positioning over dialogs and modals</li>
          <li>• <strong>Responsive design</strong> that works on all screen sizes</li>
        </ul>
      </div>
    </div>
  );
};
