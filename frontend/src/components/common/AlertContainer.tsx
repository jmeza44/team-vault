import React from 'react';
import { createPortal } from 'react-dom';
import { useAlert } from '@/contexts/AlertContext';
import AlertItem from './AlertItem';

const AlertContainer: React.FC = () => {
  const { alerts } = useAlert();

  if (alerts.length === 0) {
    return null;
  }

  // Create portal to render alerts at the top level
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] pointer-events-none"
      aria-live="assertive"
    >
      {/* Alert container positioned at top-right */}
      <div className="flex flex-col items-end justify-start min-h-screen pt-6 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm space-y-3 pointer-events-auto">
          {alerts.map((alert) => (
            <AlertItem key={alert.id} alert={alert} />
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AlertContainer;
