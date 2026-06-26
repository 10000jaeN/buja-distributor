type SpinnerSize = "sm" | "md" | "lg";

const SIZE: Record<SpinnerSize, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-[3px]",
};

type Props = {
  size?: SpinnerSize;
  label?: string;
  className?: string;
};

export function Spinner({ size = "md", label, className = "" }: Props) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div
        className={`animate-spin rounded-full border-gray-200 border-t-brand-blue ${SIZE[size]}`}
        aria-hidden="true"
      />
      {label && <span className="text-sm text-gray-500">{label}</span>}
    </div>
  );
}
