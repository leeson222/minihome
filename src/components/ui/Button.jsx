// src/components/ui/Button.jsx
export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'default',
  disabled = false,
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}