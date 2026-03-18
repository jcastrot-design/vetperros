import type { ReactNode } from "react";

export function HeroAnimation({ children }: { children: ReactNode }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
      {children}
    </div>
  );
}

export function ScrollSection({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

export function StaggerGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

export function StaggerCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

export function AnimatedCounter({ value }: { value: number | string }) {
  return <span>{typeof value === "number" ? value.toLocaleString() : value}</span>;
}

export function FloatAnimation({ children }: { children: ReactNode }) {
  return (
    <div style={{ animation: "floatY 3s ease-in-out infinite" }}>
      {children}
      <style>{`@keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }`}</style>
    </div>
  );
}

export function PulseCircle({ className }: { className?: string }) {
  return <div className={`animate-pulse ${className ?? ""}`} />;
}
