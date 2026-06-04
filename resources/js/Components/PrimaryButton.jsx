import { cn } from "./utils/utils";

export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={cn(
                'inline-flex items-center text-sm rounded-xl border-2 border-transparent bg-primary-dark py-2 text-secondary-light font-semibold tracking-widest hover:bg-primary-dark/70 focus:bg-primary-dark/70 transition duration-150 ease-in-out focus:outline-none',
                disabled && 'opacity-25',
                className
            )}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
