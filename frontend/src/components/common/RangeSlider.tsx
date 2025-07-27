import React from 'react';

interface RangeSliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  label: string;
  formatValue?: (value: number) => string;
  minLabel?: string;
  maxLabel?: string;
  className?: string;
  disabled?: boolean;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  step,
  value,
  onChange,
  label,
  formatValue = (val) => val.toString(),
  minLabel,
  maxLabel,
  className = '',
  disabled = false,
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label with value */}
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}: {formatValue(value)}
      </label>

      {/* Slider container */}
      <div className="relative">
        {/* Background track */}
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
          {/* Progress track */}
          <div
            className="h-full bg-primary-600 dark:bg-primary-500 transition-all duration-150 ease-out rounded-lg"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Range input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          disabled={disabled}
          className="absolute inset-0 w-full h-2 bg-transparent appearance-none cursor-pointer disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary-600
            [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-200 [&::-webkit-slider-thumb]:ease-out
            [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:hover:shadow-xl [&::-webkit-slider-thumb]:hover:border-primary-700
            [&::-webkit-slider-thumb]:focus:scale-110 [&::-webkit-slider-thumb]:focus:shadow-xl [&::-webkit-slider-thumb]:focus:outline-none
            [&::-webkit-slider-thumb]:active:scale-95 [&::-webkit-slider-thumb]:active:shadow-md
            [&::-webkit-slider-thumb]:disabled:opacity-50 [&::-webkit-slider-thumb]:disabled:cursor-not-allowed
            [&::-webkit-slider-track]:bg-transparent [&::-webkit-slider-track]:h-2 [&::-webkit-slider-track]:rounded-lg
            [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full 
            [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 
            [&::-moz-range-thumb]:border-primary-600 [&::-moz-range-thumb]:shadow-lg
            [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:duration-200 [&::-moz-range-thumb]:ease-out
            [&::-moz-range-track]:bg-transparent [&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-lg"
        />
      </div>

      {/* Min/Max labels */}
      {(minLabel || maxLabel) && (
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{minLabel || min}</span>
          <span>{maxLabel || max}</span>
        </div>
      )}
    </div>
  );
};

export default RangeSlider;
