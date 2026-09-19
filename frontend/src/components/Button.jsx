export const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false,
  className = '',
  children,
  ...props 
}) => {
  const baseStyles = 'font-medium rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700',
    secondary: 'border border-blue-500 text-blue-500 hover:bg-blue-50 active:bg-blue-100',
    ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200',
    danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
  };

  const sizeStyles = {
    sm: 'px-3 py-1 text-12',
    md: 'px-4 py-2 text-14',
    lg: 'px-6 py-3 text-16',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {loading ? '⟳' : children}
    </button>
  );
};
