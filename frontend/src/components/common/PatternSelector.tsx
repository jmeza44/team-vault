import React from 'react';
import { Check, Palette, Settings } from 'lucide-react';
import { AVAILABLE_PATTERNS, PatternType } from './BackgroundPattern';
import { usePatternContext } from '@/contexts/PatternContext';
import { RangeSlider } from './RangeSlider';

interface PatternSelectorProps {
  onPatternChange?: (pattern: PatternType) => void;
}

export const PatternSelector: React.FC<PatternSelectorProps> = ({ onPatternChange }) => {
  const { pattern: currentPattern, updatePattern, settings: patternSettings, updateSettings } = usePatternContext();

  const handlePatternSelect = (patternId: PatternType) => {
    updatePattern(patternId);
    onPatternChange?.(patternId);
  };

  const handleSettingChange = (key: keyof typeof patternSettings, value: any) => {
    updateSettings({ [key]: value });
  };

  // Safe getter for current pattern with fallback
  const getCurrentPattern = () => {
    const pattern = AVAILABLE_PATTERNS.find(p => p.id === currentPattern);
    if (!pattern) {
      console.warn(`Current pattern "${currentPattern}" not found in available patterns, using none as fallback`);
      return AVAILABLE_PATTERNS.find(p => p.id === 'none') || AVAILABLE_PATTERNS[0];
    }
    return pattern;
  };
  
  const currentPatternData = getCurrentPattern();

  const groupedPatterns = AVAILABLE_PATTERNS.reduce((groups, pattern) => {
    if (!groups[pattern.category]) {
      groups[pattern.category] = [];
    }
    groups[pattern.category].push(pattern);
    return groups;
  }, {} as Record<string, typeof AVAILABLE_PATTERNS>);

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
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Pattern Selection - Left Side */}
          <div className="flex-1 space-y-6">
            {Object.entries(groupedPatterns).map(([category, patterns]) => (
              <div key={category} className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {patterns.map((pattern) => (
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
                      <div className="relative h-20 mb-3 rounded border border-gray-200 dark:border-gray-600 overflow-hidden">
                        {pattern.id !== 'none' ? (
                          <>
                            {pattern.file ? (
                              <div
                                className="absolute inset-0 dark:invert"
                                style={{
                                  backgroundImage: pattern.file.startsWith('data:') 
                                    ? `url("${pattern.file}")` 
                                    : `url(${pattern.file})`,
                                  backgroundSize: `${Math.max(Math.min(
                                    patternSettings.size || pattern.defaultSize, 80
                                  ), 40)}px ${Math.max(Math.min(
                                    patternSettings.size || pattern.defaultSize, 80
                                  ), 40)}px`,
                                  backgroundRepeat: 'repeat',
                                  backgroundPosition: 'center',
                                  opacity: currentPattern === pattern.id ? patternSettings.opacity * 10 : 0.4,
                                }}
                              />
                            ) : (
                              <div className="absolute inset-0 bg-red-100 dark:bg-red-900 flex items-center justify-center">
                                <span className="text-xs text-red-600 dark:text-red-400">No File</span>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                            <span className="text-xs text-gray-500 dark:text-gray-400">No Pattern</span>
                          </div>
                        )}
                        
                        {/* Selection Indicator */}
                        {currentPattern === pattern.id && (
                          <div className="absolute top-2 right-2 bg-primary-600 text-white rounded-full p-1">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </div>

                      {/* Pattern Info */}
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
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
          <div className="lg:w-80 lg:sticky lg:top-6 lg:self-start space-y-4">
            {/* Current Selection Info */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Current Selection
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {currentPatternData?.name || 'Unknown Pattern'}: {' '}
                {currentPatternData?.description || 'No description available'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Changes are saved automatically and applied across all pages.
              </p>
            </div>

            {/* Pattern Customization */}
            {currentPattern !== 'none' && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
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
                    onChange={(value) => handleSettingChange('opacity', value)}
                    label="Opacity"
                    formatValue={(value) => `${Math.round(value * 100)}%`}
                    minLabel="0.5%"
                    maxLabel="15%"
                  />

                  {/* Size Control */}
                  <RangeSlider
                    min={0}
                    max={400}
                    step={20}
                    value={patternSettings.size}
                    onChange={(value) => handleSettingChange('size', value)}
                    label="Pattern Size"
                    formatValue={(value) => value === 0 ? `${currentPatternData?.defaultSize || 'Default'}px` : `${value}px`}
                    minLabel="Default"
                    maxLabel="400px"
                  />

                  {/* Variant Control */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Position Variant
                    </label>
                    <select
                      value={patternSettings.variant}
                      onChange={(e) => handleSettingChange('variant', e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="overlay">Overlay (Default)</option>
                      <option value="fixed">Fixed Position</option>
                      <option value="absolute">Absolute Position</option>
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {patternSettings.variant === 'overlay' && 'Pattern stays with content'}
                      {patternSettings.variant === 'fixed' && 'Pattern stays fixed on screen'}
                      {patternSettings.variant === 'absolute' && 'Pattern positioned absolutely'}
                    </p>
                  </div>

                  {/* Live Preview */}
                  {currentPatternData?.file && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Live Preview
                      </label>
                      <div className="h-24 rounded border border-gray-200 dark:border-gray-600 overflow-hidden relative">
                        <div
                          className="absolute inset-0 dark:invert"
                          style={{
                            backgroundImage: currentPatternData.file.startsWith('data:') 
                              ? `url("${currentPatternData.file}")` 
                              : `url(${currentPatternData.file})`,
                            backgroundSize: `${patternSettings.size || currentPatternData.defaultSize}px ${patternSettings.size || currentPatternData.defaultSize}px`,
                            backgroundRepeat: 'repeat',
                            backgroundPosition: 'center',
                            opacity: patternSettings.opacity,
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs text-gray-600 dark:text-gray-400">
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
