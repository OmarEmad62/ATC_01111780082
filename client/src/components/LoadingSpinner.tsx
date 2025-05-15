
import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  fullPage?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = "md",
  fullPage = false
}) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const spinner = (
    <div className="flex justify-center items-center">
      <div className={`animate-spin rounded-full border-t-2 border-b-2 border-event-primary ${sizeClasses[size]} dark:border-event-light`}></div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50 dark:bg-gray-900 dark:bg-opacity-80">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
