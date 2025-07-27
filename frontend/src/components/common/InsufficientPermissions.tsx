import React from 'react';
import { Shield, Lock } from 'lucide-react';

interface InsufficientPermissionsProps {
  message?: string;
  action?: string;
}

export const InsufficientPermissions: React.FC<
  InsufficientPermissionsProps
> = ({
  message = 'You do not have permission to perform this action',
  action = 'Access Denied',
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-8">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
        <Lock className="h-8 w-8 text-gray-500" />
      </div>
      <h3 className="mb-2 text-lg font-medium text-gray-900">{action}</h3>
      <p className="max-w-md text-center text-gray-600 dark:text-gray-300">
        {message}
      </p>
      <div className="mt-4 flex items-center text-sm text-gray-500">
        <Shield className="mr-1 h-4 w-4" />
        Contact your administrator for access
      </div>
    </div>
  );
};
