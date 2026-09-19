import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "danger" | "success" | "warning" | "ghost";

const VARIANT_STYLES: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  danger: "bg-red-600 text-white hover:bg-red-700",
  success: "bg-teal-600 text-white hover:bg-teal-700",
  warning: "bg-amber-600 text-white hover:bg-amber-700",
  ghost: "bg-ink-800 text-ink-400 hover:bg-ink-950 hover:text-white",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md";
}

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  const sizeStyles = size === "sm" ? "px-2.5 py-1 text-xs" : "px-4 py-2 text-sm";

  return (
    <button
      disabled={disabled}
      className={`rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_STYLES[variant]} ${sizeStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}