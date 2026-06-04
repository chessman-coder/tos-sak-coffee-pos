import { cn } from "../utils/utils";

export default function Button({
    children,
    variant = "outline",
    className = "",
    disabled = false,
    ...props
}) {
    const variants = {
        outline: "border-2 border-primary-dark",
        fillDark: "border-2 border-primary-dark bg-primary-dark text-secondary-light ",
        fillLight: "border-2 border-secondary-dark bg-secondary-dark text-primary-dark",
        danger: "border-2 border-danger bg-danger text-bg-card",
    };

    return (
        <button
            {...props}
            disabled={disabled}
            className={cn(
                "inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold tracking-widest",
                disabled && "opacity-25 cursor-not-allowed",
                variants[variant] ?? variants.outline,
                className,
            )}
        >
            {children}
        </button>
    );
}
