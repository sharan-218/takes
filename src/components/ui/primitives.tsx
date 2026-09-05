"use client";

import { clsx } from "clsx";
import type { ReactNode, ButtonHTMLAttributes } from "react";

export function Button({
  variant = "default",
  className,
  children,
  ...rest
}: { variant?: "default" | "primary" | "ghost" } & ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  const cls = variant === "primary" ? "btn-primary" : variant === "ghost" ? "btn-ghost" : "btn";
  return (
    <button className={clsx(cls, className)} {...rest}>
      {children}
    </button>
  );
}

export function Chip({ on, children, onClick }: { on?: boolean; children: ReactNode; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className={on ? "chip-on" : "chip"}>
      {children}
    </button>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("card p-4", className)}>{children}</div>;
}
