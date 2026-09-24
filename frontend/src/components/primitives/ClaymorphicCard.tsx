import { type ReactNode, type MouseEventHandler, type KeyboardEvent } from 'react';

const paddingMap = {
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8',
};

interface ClaymorphicCardProps {
  children: ReactNode;
  className?: string;
  padding?: keyof typeof paddingMap;
  onClick?: MouseEventHandler<HTMLDivElement>;
  onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void;
  role?: string;
  tabIndex?: number;
}

export default function ClaymorphicCard({
  children,
  className = '',
  padding = 'md',
}: ClaymorphicCardProps) {
  return (
    <div className={`clay-card ${paddingMap[padding]} ${className}`}>
      {children}
    </div>
  );
}
