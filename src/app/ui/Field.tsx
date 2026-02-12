"use client";

const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: "var(--radius)",
  background: "#ffffff",
  border: "1px solid var(--border)",
  padding: "10px 14px",
  color: "#111827",
  font: "inherit",
  fontSize: "0.95rem",
  boxShadow: "var(--shadow-sm)",
};

interface FieldProps {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
}

export function Field({ label, name, error, children }: FieldProps) {
  return (
    <div style={{ marginBottom: "var(--spacing-md)" }}>
      <label
        htmlFor={name}
        style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: 6 }}
      >
        {label}
      </label>
      {children}
      {error && (
        <p style={{ marginTop: 6, fontSize: "0.875rem", color: "#dc2626" }} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({
  id,
  name,
  type = "text",
  style,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { id?: string }) {
  const inputId = id ?? name;
  return (
    <input
      id={inputId}
      name={name}
      type={type}
      style={{ ...inputStyle, ...style }}
      {...props}
    />
  );
}

export function Textarea({
  id,
  name,
  style,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { id?: string }) {
  const inputId = id ?? name;
  return (
    <textarea
      id={inputId}
      name={name}
      style={{ ...inputStyle, minHeight: 120, ...style }}
      {...props}
    />
  );
}
