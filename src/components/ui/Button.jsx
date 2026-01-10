import { audio } from "../../lib/audioManager";

export default function Button({
  children,
  onClick,
  type = "button",
  disabled,
  variant = "primary",
  ...rest
}) {
  const handleClick = (e) => {
    // disabled면 소리도 안 나게
    if (disabled) return;

    audio.click();          // ✅ 전역 효과음
    onClick?.(e);           // 기존 onClick 실행
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`btn btn-${variant}`}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </button>
  );
}
