import React from 'react';

const TextArea = ({ 
  className = '', 
  rows = 4,
  placeholder = '',
  value,
  onChange,
  required = false,
  disabled = false,
  ...props 
}) => {
  return (
    <textarea
      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'} ${className}`}
      rows={rows}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      {...props}
    />
  );
};

export default TextArea;