import type { ReactNode } from "react";

// Page transition wrapper
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both">
      {children}
    </div>
  );
}

// Scroll-triggered reveal (CSS only — always visible, no JS required)
export function ScrollReveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

// Stagger container for lists
export function StaggerContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

// Stagger child item
export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

// Animated number counter
export function AnimatedNumber({
  value,
  className,
}: {
  value: number | string;
  className?: string;
}) {
  return (
    <span className={className}>
      {typeof value === "number" ? value.toLocaleString() : value}
    </span>
  );
}

// Animated badge (notification count)
export function AnimatedBadge({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  if (count <= 0) return null;
  return (
    <span className={className}>
      {count > 9 ? "9+" : count}
    </span>
  );
}

// Press animation wrapper for interactive cards
export function PressableCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`transition-transform duration-150 hover:-translate-y-0.5 active:scale-[0.98] ${className ?? ""}`}>
      {children}
    </div>
  );
}

// Swipeable card (no-op CSS fallback)
export function SwipeableCard({
  children,
  className,
}: {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

// Empty state animated icon
export function FloatingIcon({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      style={{ animation: "floatY 2.5s ease-in-out infinite" }}
      className={className}
    >
      {children}
      <style>{`@keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
    </div>
  );
}

// Fade in wrapper
export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={`animate-in fade-in duration-400 fill-mode-both ${className ?? ""}`}
      style={delay ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
