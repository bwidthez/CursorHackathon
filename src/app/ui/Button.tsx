"use client";

import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "danger";

const baseStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  borderRadius: "var(--radius)",
  fontWeight: 600,
  minHeight: 48,
  padding: "12px 20px",
  border: "none",
  cursor: "pointer",
  font: "inherit",
  fontSize: "0.95rem",
  letterSpacing: "-0.01em",
  transition: "background 0.15s ease, box-shadow 0.15s ease",
};
const primaryStyle: React.CSSProperties = {
  background: "#111827",
  color: "#ffffff",
  boxShadow: "var(--shadow-sm)",
};
const secondaryStyle: React.CSSProperties = {
  background: "#ffffff",
  color: "#111827",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow-sm)",
};
const dangerStyle: React.CSSProperties = {
  background: "#dc2626",
  color: "#ffffff",
  boxShadow: "var(--shadow-sm)",
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
