import { type ReactNode } from 'react';

interface InsetTrackProps {
  children?: ReactNode;
  filled?: boolean;
  fillColor?: string;
  className?: string;
}

export default function InsetTrack({
  children,
  filled = false,
  fillColor = 'var(--color-success)',
  className = '',
}: InsetTrackProps) {
  return (
    <div
      className={`inset-track ${className}`}
      style={{
        backgroundColor: filled ? fillColor : 'transparent',
      }}
    >
      {children}
    </div>
  );
}
