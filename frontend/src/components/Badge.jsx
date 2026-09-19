export const Badge = ({ variant = 'default', size = 'md', children, className = '' }) => {
  const variantStyles = {
    default: 'bg-gray-100 text-gray-900',
    primary: 'bg-blue-50 text-blue-900',
    success: 'bg-green-50 text-green-900',
    warning: 'bg-amber-50 text-amber-900',
    danger: 'bg-red-50 text-red-900',
    info: 'bg-cyan-50 text-cyan-900',
  };

  const sizeStyles = {
    sm: 'px-2 py-1 text-11',
    md: 'px-3 py-1 text-12',
  };

  return (
    <span className={`inline-block rounded-full font-medium ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {children}
    </span>
  );
};
