import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children?: React.ReactNode;
  fullWidth?: boolean;
  isActive?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  fullWidth = false,
  isActive = false,
  className = '',
  ...props
}: ButtonProps) {
  // Base styles
  const baseStyles = 'inline-flex items-center gap-3 rounded-lg transition-all font-medium focus:outline-none';

  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  };

  // Variant styles
  const variantStyles = {
    primary: 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:opacity-90 shadow-md hover:shadow-lg',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    outline: 'border-2 border-purple-600 text-purple-600 hover:bg-purple-50',
  };

  // Active state (for sidebar menu items)
  const activeStyle = isActive ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white' : '';

  // Full width
  const widthStyle = fullWidth ? 'w-full justify-center' : '';

  const combinedClassName = `
    ${baseStyles} 
    ${sizeStyles[size]} 
    ${isActive ? activeStyle : variantStyles[variant]} 
    ${widthStyle}
    ${className}
  `.trim();

  return (
    <button className={combinedClassName} {...props}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
