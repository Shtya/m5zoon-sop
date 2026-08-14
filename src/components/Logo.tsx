import { cn } from "@/lib/cn";

const HEIGHT = {
  sm: "h-9",
  md: "h-[42px]",
  lg: "h-14",
} as const;

export function Logo({
  size = "md",
  onDark = true,
  className,
}: {
  size?: keyof typeof HEIGHT;
  onDark?: boolean;
  className?: string;
}) {
  const image = (
    <img
      src="/logo.png"
      alt="مخزوني"
      width={146}
      height={45}
      draggable={false}
      className={cn("w-auto max-w-full object-contain object-center select-none", HEIGHT[size])}
    />
  );

  if (onDark) {
    return <div className={cn("flex shrink-0 items-center", className)}>{image}</div>;
  }

  return (
    <div className={cn("inline-flex shrink-0 items-center rounded-xl bg-ink-900 px-2.5 py-1.5", className)}>
      {image}
    </div>
  );
}
