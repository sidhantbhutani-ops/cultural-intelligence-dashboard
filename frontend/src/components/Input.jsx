export const Input = ({ 
  type = 'text', 
  placeholder = '', 
  error = false,
  label = '',
  className = '',
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && <label className="block text-14 font-medium text-gray-900 mb-2">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        className={`
          w-full px-4 py-2 border rounded-md text-14
          transition-all duration-200
          ${error ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-50'}
          disabled:bg-gray-100 disabled:text-gray-500
          ${className}
        `}
        {...props}
      />
      {error && <span className="text-12 text-red-500 mt-1 block">{error}</span>}
    </div>
  );
};
