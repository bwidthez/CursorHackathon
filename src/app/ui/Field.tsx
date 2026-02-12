"use client";

const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: "var(--radius)",
  background: "var(--surface)",
  border: "1px solid var(--surface-hover)",
  padding: "8px 12px",
  color: "var(--text)",
  font: "inherit",
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
        style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "var(--text)", marginBottom: 4 }}
      >
        {label}
      </label>
      {children}
      {error && (
        <p style={{ marginTop: 4, fontSize: "0.875rem", color: "var(--danger)" }} role="alert">
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
