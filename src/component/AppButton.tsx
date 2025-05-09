import React from 'react';

interface AppButtonProps {
  type?: "button" | "submit" | "reset" | undefined
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

const AppButton: React.FC<AppButtonProps> = ({ loading, children, onClick, disabled ,type } : AppButtonProps) => {
  return (
    <button
      type={type}
      disabled={loading || disabled}
      onClick={onClick}
      className={`w-full py-3 px-6 rounded-lg text-white font-semibold text-lg transition duration-300 
        ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};

export default AppButton;