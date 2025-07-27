import React from 'react';
import { Shield, Lock } from 'lucide-react';

interface InsufficientPermissionsProps {
  message?: string;
  action?: string;
}

export const InsufficientPermissions: React.FC<InsufficientPermissionsProps> = ({
  message = 'You do not have permission to perform this action',
  action = 'Access Denied'
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200">
      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
        <Lock className="w-8 h-8 text-gray-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{action}</h3>
      <p className="text-gray-600 dark:text-gray-300 text-center max-w-md">{message}</p>
      <div className="mt-4 flex items-center text-sm text-gray-500">
        <Shield className="w-4 h-4 mr-1" />
        Contact your administrator for access
      </div>
    </div>
  );
};
