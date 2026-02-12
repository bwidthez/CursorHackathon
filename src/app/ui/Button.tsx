"use client";

import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "danger";

const baseStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  borderRadius: "var(--radius)",
  fontWeight: 500,
  minHeight: 44,
  padding: "10px 16px",
  border: "none",
  cursor: "pointer",
  font: "inherit",
};
const primaryStyle: React.CSSProperties = {
  background: "var(--primary)",
  color: "white",
};
const secondaryStyle: React.CSSProperties = {
  background: "var(--surface)",
  color: "var(--text)",
  border: "1px solid var(--surface-hover)",
};
const dangerStyle: React.CSSProperties = {
  background: "var(--danger)",
  color: "white",
};

const variantMap = {
  primary: primaryStyle,
  secondary: secondaryStyle,
  danger: dangerStyle,
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  fullWidth,
  style,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      style={{
        ...baseStyle,
        ...variantMap[variant],
        ...(fullWidth ? { width: "100%" } : {}),
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}

interface ButtonLinkProps {
  href: string;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function ButtonLink({
  href,
  variant = "primary",
  fullWidth,
  children,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      style={{
        ...baseStyle,
        ...variantMap[variant],
        ...(fullWidth ? { width: "100%", display: "block", textAlign: "center" } : {}),
        textDecoration: "none",
      }}
    >
      {children}
    </Link>
  );
}
