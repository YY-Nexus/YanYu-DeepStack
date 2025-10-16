import React from "react";

export interface BrandInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const BrandInput = React.forwardRef<HTMLInputElement, BrandInputProps>(
  ({ label, className = "", ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white transition-all duration-150 ${className}`}
        aria-label={label || props.placeholder || "输入"}
        title={label || props.placeholder || "输入"}
        {...props}
      />
    </div>
  )
);

BrandInput.displayName = "BrandInput";
export { BrandInput };
export default BrandInput;
