import React from 'react';
import { createPortal } from 'react-dom';
import { useAlert } from '@/contexts';
import { AlertItem } from '@/components/common';

const AlertContainer: React.FC = () => {
  const { alerts } = useAlert();

  if (alerts.length === 0) {
    return null;
  }

  // Create portal to render alerts at the top level
  return createPortal(
    <div
      className="pointer-events-none fixed inset-0 z-[9999]"
      aria-live="assertive"
    >
      {/* Alert container positioned at top-right */}
      <div className="flex min-h-screen flex-col items-end justify-start px-4 pt-6 sm:px-6 lg:px-8">
        <div className="pointer-events-auto w-full max-w-sm space-y-3">
          {alerts.map(alert => (
            <AlertItem key={alert.id} alert={alert} />
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AlertContainer;
