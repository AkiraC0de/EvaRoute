const sizeMap = {
  sm: 'px-4 py-1.5 text-[13px]',
  md: 'px-6 py-2.5 text-[15px]',
  lg: 'px-8 py-3 text-[18px]',
};

const variantMap = {
  primary:
    'bg-accent text-white shadow-clay-xs hover:bg-accent-strong hover:-translate-y-px hover:shadow-clay motion-safe-transform active:translate-y-0 active:shadow-clay-xs',
  secondary:
    'bg-surface text-ink shadow-clay-xs hover:bg-sunken active:shadow-clay-inset',
};

export default function PillButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  disabled,
  ...props
}) {
  return (
    <button
      className={[
        'inline-flex items-center justify-center rounded-full font-semibold transition disabled:opacity-40',
        variantMap[variant] ?? variantMap.primary,
        sizeMap[size],
        loading ? 'opacity-60 cursor-wait' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="animate-spin mr-2 inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent" />
      )}
      {children}
    </button>
  );
}
