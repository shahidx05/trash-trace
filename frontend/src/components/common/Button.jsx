import React from 'react';

// Variants ke liye Tailwind classes (Using Green theme)
const variants = {
  // Primary (GreenReport Green)
  primary: 'bg-green-700 text-white hover:bg-green-600 focus:ring-green-600',
  // Secondary (Grey/Neutral)
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
  // Danger (Red)
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600',
  // Outline (White background, Green border/text)
  outline: 'bg-white text-green-700 border border-green-300 hover:bg-green-50 focus:ring-green-600',
};

const sizes = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  type = 'button',
  ...props 
}) {
  // Added focus:ring-offset-2 to ensure visibility
  const baseClasses = 'font-medium rounded-lg shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;