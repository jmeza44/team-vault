import React from 'react';
import { AnalyticsFilters } from '@/types';

interface TimeRangeSelectorProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
  className?: string;
}

const timeRangeOptions = [
  { value: 'last24h', label: 'Last 24 Hours' },
  { value: 'last7d', label: 'Last 7 Days' },
  { value: 'last30d', label: 'Last 30 Days' },
  { value: 'last90d', label: 'Last 90 Days' },
  { value: 'last1y', label: 'Last Year' }
] as const;

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  filters,
  onFiltersChange,
  className = ''
}) => {
  const handleTimeRangeChange = (timeRange: string) => {
    onFiltersChange({
      ...filters,
      timeRange: timeRange as AnalyticsFilters['timeRange'],
      startDate: undefined,
      endDate: undefined
    });
  };

  const handleCustomDateChange = (field: 'startDate' | 'endDate', value: string) => {
    onFiltersChange({
      ...filters,
      timeRange: undefined,
      [field]: value || undefined
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Time Range
        </label>
        <div className="flex flex-wrap gap-2">
          {timeRangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleTimeRangeChange(option.value)}
              className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                filters.timeRange === option.value
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Custom Start Date
          </label>
          <input
            type="date"
            id="start-date"
            value={filters.startDate || ''}
            onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                     focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Custom End Date
          </label>
          <input
            type="date"
            id="end-date"
            value={filters.endDate || ''}
            onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                     focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {(filters.startDate || filters.endDate) && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Using custom date range. Time range presets are disabled.
        </div>
      )}
    </div>
  );
};
