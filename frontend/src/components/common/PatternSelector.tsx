import React from 'react';
import { Check, Palette, Settings } from 'lucide-react';
import { usePatternContext } from '@/contexts';
import { AVAILABLE_PATTERNS } from '@/constants/patternConstants';
import { getPatternFileUrl } from '@/utils/patternUtils';
import { RangeSlider } from '@/components/common';
import { PatternType } from '@/types';

interface PatternSelectorProps {
  onPatternChange?: (pattern: PatternType) => void;
}

export const PatternSelector: React.FC<PatternSelectorProps> = ({
  onPatternChange,
}) => {
  const {
    pattern: currentPattern,
    updatePattern,
    settings: patternSettings,
    updateSettings,
  } = usePatternContext();

  const handlePatternSelect = (patternId: PatternType) => {
    updatePattern(patternId);
    onPatternChange?.(patternId);
  };

  const handleSettingChange = (
    key: keyof typeof patternSettings,
    value: any
  ) => {
    updateSettings({ [key]: value });
  };

  // Safe getter for current pattern with fallback
  const getCurrentPattern = () => {
    const pattern = AVAILABLE_PATTERNS.find(p => p.id === currentPattern);
    if (!pattern) {
      console.warn(
        `Current pattern "${currentPattern}" not found in available patterns, using none as fallback`
      );
      return (
        AVAILABLE_PATTERNS.find(p => p.id === 'none') || AVAILABLE_PATTERNS[0]
      );
    }
    return pattern;
  };

  const currentPatternData = getCurrentPattern();

  const groupedPatterns = AVAILABLE_PATTERNS.reduce(
    (groups, pattern) => {
      if (!groups[pattern.category]) {
        groups[pattern.category] = [];
      }
      groups[pattern.category].push(pattern);
      return groups;
    },
    {} as Record<string, typeof AVAILABLE_PATTERNS>
  );

  const categoryLabels = {
    minimal: 'Minimal',
    tech: 'Technology',
    geometric: 'Geometric',
    organic: 'Organic',
    fun: 'Fun & Creative',
    formal: 'Professional',
    nature: 'Nature',
    abstract: 'Abstract',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Palette className="h-5 w-5 text-primary-600 dark:text-primary-400" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Background Pattern
        </h3>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400">
        Choose a background pattern to personalize your Team Vault experience.
        Patterns are subtle and won't interfere with readability.
      </p>

      {/* Main Content - Side by Side Layout */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Pattern Selection - Left Side */}
        <div className="flex-1 space-y-6">
          {Object.entries(groupedPatterns).map(([category, patterns]) => (
            <div key={category} className="space-y-3">
              <h4 className="text-sm font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                {categoryLabels[category as keyof typeof categoryLabels]}
              </h4>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {patterns.map(pattern => (
                  <div
                    key={pattern.id}
                    className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 hover:shadow-md ${
                      currentPattern === pattern.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500'
                    }`}
                    onClick={() => handlePatternSelect(pattern.id)}
                  >
                    {/* Pattern Preview */}
                    <div className="relative mb-3 h-20 overflow-hidden rounded border border-gray-200 dark:border-gray-600">
                      {pattern.id !== 'none' ? (
                        <>
                          {pattern.file ? (
                            <div
                              className="absolute inset-0 dark:invert"
                              style={{
                                backgroundImage:
                                  typeof getPatternFileUrl(pattern.file) === 'string' &&
                                  getPatternFileUrl(pattern.file).startsWith('data:')
                                    ? `url("${getPatternFileUrl(pattern.file)}")`
                                    : `url(${getPatternFileUrl(pattern.file)})`,
                                backgroundSize: `${Math.max(
                                  Math.min(
                                    patternSettings.size || pattern.defaultSize,
                                    80
                                  ),
                                  40
                                )}px ${Math.max(
                                  Math.min(
                                    patternSettings.size || pattern.defaultSize,
                                    80
                                  ),
                                  40
                                )}px`,
                                backgroundRepeat: 'repeat',
                                backgroundPosition: 'center',
                                opacity:
                                  currentPattern === pattern.id
                                    ? patternSettings.opacity * 10
                                    : 0.4,
                              }}
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-red-100 dark:bg-red-900">
                              <span className="text-xs text-red-600 dark:text-red-400">
                                No File
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            No Pattern
                          </span>
                        </div>
                      )}

                      {/* Selection Indicator */}
                      {currentPattern === pattern.id && (
                        <div className="absolute right-2 top-2 rounded-full bg-primary-600 p-1 text-white">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </div>

                    {/* Pattern Info */}
                    <div>
                      <h5 className="mb-1 font-medium text-gray-900 dark:text-gray-100">
                        {pattern.name}
                      </h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {pattern.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Settings Sidebar - Right Side */}
        <div className="space-y-4 lg:sticky lg:top-6 lg:w-80 lg:self-start">
          {/* Current Selection Info */}
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Current Selection
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {currentPatternData?.name || 'Unknown Pattern'}:{' '}
              {currentPatternData?.description || 'No description available'}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Changes are saved automatically and applied across all pages.
            </p>
          </div>

          {/* Pattern Customization */}
          {currentPattern !== 'none' && (
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
              <div className="mb-4 flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Pattern Settings
                </span>
              </div>

              <div className="space-y-4">
                {/* Opacity Control */}
                <RangeSlider
                  min={0.005}
                  max={0.15}
                  step={0.005}
                  value={patternSettings.opacity}
                  onChange={value => handleSettingChange('opacity', value)}
                  label="Opacity"
                  formatValue={value => `${Math.round(value * 100)}%`}
                  minLabel="0.5%"
                  maxLabel="15%"
                />

                {/* Size Control */}
                <RangeSlider
                  min={0}
                  max={400}
                  step={20}
                  value={patternSettings.size}
                  onChange={value => handleSettingChange('size', value)}
                  label="Pattern Size"
                  formatValue={value =>
                    value === 0
                      ? `${currentPatternData?.defaultSize || 'Default'}px`
                      : `${value}px`
                  }
                  minLabel="Default"
                  maxLabel="400px"
                />

                {/* Variant Control */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Position Variant
                  </label>
                  <select
                    value={patternSettings.variant}
                    onChange={e =>
                      handleSettingChange('variant', e.target.value)
                    }
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="overlay">Overlay (Default)</option>
                    <option value="fixed">Fixed Position</option>
                    <option value="absolute">Absolute Position</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {patternSettings.variant === 'overlay' &&
                      'Pattern stays with content'}
                    {patternSettings.variant === 'fixed' &&
                      'Pattern stays fixed on screen'}
                    {patternSettings.variant === 'absolute' &&
                      'Pattern positioned absolutely'}
                  </p>
                </div>

                {/* Live Preview */}
                {currentPatternData?.file && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Live Preview
                    </label>
                    <div className="relative h-24 overflow-hidden rounded border border-gray-200 dark:border-gray-600">
                      <div
                        className="absolute inset-0 dark:invert"
                        style={{
                          backgroundImage:
                            typeof getPatternFileUrl(currentPatternData.file) === 'string' &&
                            getPatternFileUrl(currentPatternData.file).startsWith('data:')
                              ? `url("${getPatternFileUrl(currentPatternData.file)}")`
                              : `url(${getPatternFileUrl(currentPatternData.file)})`,
                          backgroundSize: `${patternSettings.size || currentPatternData.defaultSize}px ${patternSettings.size || currentPatternData.defaultSize}px`,
                          backgroundRepeat: 'repeat',
                          backgroundPosition: 'center',
                          opacity: patternSettings.opacity,
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="rounded bg-white px-2 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          Sample Content
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatternSelector;
