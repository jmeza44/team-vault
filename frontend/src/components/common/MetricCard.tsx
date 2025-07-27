import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  isLoading?: boolean;
}

const variantStyles = {
  default: 'text-primary-600 dark:text-primary-400',
  success: 'text-success-600 dark:text-success-400',
  warning: 'text-warning-600 dark:text-warning-400', 
  danger: 'text-danger-600 dark:text-danger-400',
  info: 'text-info-600 dark:text-info-400'
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  trend,
  icon,
  variant = 'default',
  isLoading = false
}) => {
  return (
    <div className="card">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              {title}
            </h3>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
            ) : (
              <>
                <p className={`text-2xl font-bold ${variantStyles[variant]} mb-1`}>
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
                {description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {description}
                  </p>
                )}
                {trend && (
                  <div className="flex items-center mt-2">
                    <span
                      className={`text-xs font-medium ${
                        trend.isPositive
                          ? 'text-success-600 dark:text-success-400'
                          : 'text-danger-600 dark:text-danger-400'
                      }`}
                    >
                      {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      {trend.label}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
          {icon && (
            <div className="ml-4 flex-shrink-0">
              <div className={`p-3 rounded-lg bg-gray-50 dark:bg-gray-800 ${variantStyles[variant]}`}>
                {icon}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
