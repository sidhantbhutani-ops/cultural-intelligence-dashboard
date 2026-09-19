export const Spinner = ({ size = 'md', color = 'primary', className = '' }) => {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const colorStyles = {
    primary: 'border-blue-500',
    gray: 'border-gray-400',
  };

  return (
    <div className={`
      animate-spin rounded-full border-2 border-gray-200
      ${sizeStyles[size]} ${colorStyles[color]}
      ${className}
    `} style={{ borderTopColor: color === 'primary' ? '#3B82F6' : '#9CA3AF' }} />
  );
};
