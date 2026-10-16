const paddingMap = {
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8',
};

export default function ClaymorphicCard({ children, className = '', padding = 'md' }) {
  return (
    <div className={`rounded-clay bg-surface shadow-clay ${paddingMap[padding]} ${className}`}>
      {children}
    </div>
  );
}
