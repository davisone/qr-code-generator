"use client";

import { ChangeEvent, ReactNode } from "react";

interface BaseProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
}

interface InputProps extends BaseProps {
  type?: "text" | "email" | "tel" | "url" | "password" | "datetime-local";
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  autoComplete?: string;
}

export const TextField = ({
  id,
  label,
  type = "text",
  value,
  placeholder,
  onChange,
  required,
  error,
  hint,
  autoComplete,
}: InputProps) => (
  <div>
    <label
      htmlFor={id}
      style={{
        display: "block",
        fontFamily: "var(--font-mono)",
        fontSize: "0.65rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.14em",
        color: "var(--ink)",
        marginBottom: "0.4rem",
      }}
    >
      {label}
      {required && <span style={{ color: "var(--red)", marginLeft: "0.25rem" }}>*</span>}
    </label>
    <input
      id={id}
      type={type}
      className="input"
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
      aria-invalid={error ? "true" : "false"}
      aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
      style={error ? { borderColor: "var(--red)" } : undefined}
    />
    {hint && !error && (
      <p
        id={`${id}-hint`}
        style={{
          marginTop: "0.3rem",
          fontFamily: "var(--font-sans)",
          fontSize: "0.72rem",
          color: "var(--mid)",
          lineHeight: 1.4,
        }}
      >
        {hint}
      </p>
    )}
    {error && (
      <p
        id={`${id}-error`}
        style={{
          marginTop: "0.3rem",
          fontFamily: "var(--font-sans)",
          fontSize: "0.72rem",
          color: "var(--red)",
          fontWeight: 700,
        }}
      >
        {error}
      </p>
    )}
  </div>
);

interface SelectProps extends BaseProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

export const SelectField = ({
  id,
  label,
  value,
  options,
  onChange,
  required,
  error,
  hint,
}: SelectProps) => (
  <div>
    <label
      htmlFor={id}
      style={{
        display: "block",
        fontFamily: "var(--font-mono)",
        fontSize: "0.65rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.14em",
        color: "var(--ink)",
        marginBottom: "0.4rem",
      }}
    >
      {label}
      {required && <span style={{ color: "var(--red)", marginLeft: "0.25rem" }}>*</span>}
    </label>
    <select
      id={id}
      className="input"
      value={value}
      onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
      aria-invalid={error ? "true" : "false"}
      style={error ? { borderColor: "var(--red)" } : undefined}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {hint && !error && (
      <p
        style={{
          marginTop: "0.3rem",
          fontFamily: "var(--font-sans)",
          fontSize: "0.72rem",
          color: "var(--mid)",
          lineHeight: 1.4,
        }}
      >
        {hint}
      </p>
    )}
    {error && (
      <p
        style={{
          marginTop: "0.3rem",
          fontFamily: "var(--font-sans)",
          fontSize: "0.72rem",
          color: "var(--red)",
          fontWeight: 700,
        }}
      >
        {error}
      </p>
    )}
  </div>
);

interface CheckboxProps extends BaseProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: ReactNode;
}

export const CheckboxField = ({
  id,
  label,
  checked,
  onChange,
  description,
}: CheckboxProps) => (
  <label
    htmlFor={id}
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: "0.7rem",
      cursor: "pointer",
      padding: "0.6rem 0.8rem",
      border: "var(--rule-thin)",
      background: "#f7f3ec",
    }}
  >
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      style={{
        width: "18px",
        height: "18px",
        accentColor: "var(--red)",
        marginTop: "2px",
        flexShrink: 0,
      }}
    />
    <span
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: "0.82rem",
        color: "var(--ink)",
        lineHeight: 1.4,
      }}
    >
      <span style={{ fontWeight: 700 }}>{label}</span>
      {description && (
        <span
          style={{
            display: "block",
            fontSize: "0.72rem",
            color: "var(--mid)",
            marginTop: "0.15rem",
          }}
        >
          {description}
        </span>
      )}
    </span>
  </label>
);
