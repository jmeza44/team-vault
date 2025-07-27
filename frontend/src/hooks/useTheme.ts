export { useTheme } from '@/contexts/ThemeContext';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Hook that returns the current theme as a boolean
 * Useful for conditional rendering based on theme
 */
export const useIsDarkMode = (): boolean => {
  const { theme } = useTheme();
  return theme === 'dark';
};

/**
 * Hook that returns theme-aware class names
 * Useful for applying different classes based on the current theme
 */
export const useThemeClasses = () => {
  const { theme } = useTheme();

  return {
    // Background classes
    bg: {
      primary: theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50',
      secondary: theme === 'dark' ? 'bg-gray-800' : 'bg-white',
      card: theme === 'dark' ? 'bg-gray-800' : 'bg-white',
    },
    // Text classes
    text: {
      primary: theme === 'dark' ? 'text-gray-100' : 'text-gray-900',
      secondary: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
      muted: theme === 'dark' ? 'text-gray-500' : 'text-gray-500',
    },
    // Border classes
    border: {
      primary: theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
      secondary: theme === 'dark' ? 'border-gray-600' : 'border-gray-300',
    },
    // Button classes
    button: {
      ghost:
        theme === 'dark'
          ? 'hover:bg-gray-700 text-gray-300 hover:text-gray-100'
          : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900',
    },
  };
};
