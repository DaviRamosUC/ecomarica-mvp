import { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function Card({ className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl bg-white p-4 shadow-sm shadow-gov-navy/5 ring-1 ring-gov-navy/5 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
