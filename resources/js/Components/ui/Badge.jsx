import React from "react";
import { cn } from "../utils/utils";

export default function Badge({
    children,
    variant = "default",
    className = "",
    ...props
}) {
    const variants = {
        default: "bg-secondary-light text-primary-light",
        primary: "bg-primary-dark text-secondary-light",
        success: "bg-success-bg text-success",
        danger: "bg-danger-bg text-danger",
        warning: "bg-warning-bg text-warning",
        info: "bg-info-bg text-info",
    };

    return (
        <span
            {...props}
            className={cn(
                "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold",
                variants[variant] ?? variants.default,
                className,
            )}
        >
            {children}
        </span>
    );
}
