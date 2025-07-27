import React from 'react';
import logoSvg from '@/assets/logo/internet-lock.svg';

interface LogoProps {
  /** Size of the logo in pixels */
  size?: number;
  /** Custom CSS classes */
  className?: string;
  /** Whether to show the text alongside the logo */
  showText?: boolean;
  /** Custom text to display (defaults to "Team Vault") */
  text?: string;
  /** Text size variant */
  textSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  /** Layout direction */
  layout?: 'horizontal' | 'vertical';
}

export const Logo: React.FC<LogoProps> = ({
  size = 32,
  className = '',
  showText = true,
  text = 'Team Vault',
  textSize = 'xl',
  layout = 'horizontal',
}) => {
  const textSizeClasses = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
  };

  const containerClasses = layout === 'horizontal' 
    ? 'flex items-center gap-3' 
    : 'flex flex-col items-center gap-2';

  return (
    <div className={`${containerClasses} ${className}`}>
      <img 
        src={logoSvg} 
        alt="Team Vault Logo" 
        className="flex-shrink-0"
        style={{ width: size, height: size }}
      />
      {showText && (
        <span className={`font-bold text-gray-900 dark:text-gray-100 ${textSizeClasses[textSize]}`}>
          {text}
        </span>
      )}
    </div>
  );
};

export default Logo;
