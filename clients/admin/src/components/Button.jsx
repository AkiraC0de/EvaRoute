const variants = {
  primary: "bg-[#5269ef] text-white hover:bg-[#4058df]",
  neutral: "bg-[#f7f8fc] text-[#65718c] hover:bg-[#edf0f8]",
  danger: "bg-[#fbe4e3] text-[#d8322d] hover:bg-[#f8d8d6]",
};

const Button = ({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...props
}) => (
  <button
    type={type}
    className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-[11px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5269ef] disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default Button;
