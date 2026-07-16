import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  children: ReactNode;
}

export function Card({ title, children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-6 shadow-sm ${className}`.trim()}
      {...props}
    >
      {title ? <h3 className="mb-4 text-lg font-semibold text-gray-900">{title}</h3> : null}
      <div className="text-gray-700">{children}</div>
    </div>
  );
}
