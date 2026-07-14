import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertTriangle, XCircle, X, Info } from "lucide-react";
import { cn } from "../utils/utils";
import { router } from "@inertiajs/react";

// Global listeners registry to handle trigger event from anywhere
let toastListeners = [];
let toastIdCount = 0;

export const toast = {
    show(message, variant = "info", duration = 4000) {
        const id = ++toastIdCount;
        toastListeners.forEach((listener) =>
            listener({ id, message, variant, duration })
        );
        return id;
    },
    success(message, duration) {
        return this.show(message, "success", duration);
    },
    warning(message, duration) {
        return this.show(message, "warning", duration);
    },
    failed(message, duration) {
        return this.show(message, "failed", duration);
    },
    error(message, duration) {
        return this.show(message, "failed", duration);
    },
};

export function ToastContainer() {
    const [toasts, setToasts] = useState([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        const handleNewToast = (newToast) => {
            setToasts((prevToasts) => [...prevToasts, newToast]);
        };
        toastListeners.push(handleNewToast);

        // Handle initial load flash messages
        const initialFlash = router.page?.props?.flash;
        if (initialFlash) {
            if (initialFlash.success) toast.success(initialFlash.success);
            if (initialFlash.warning) toast.warning(initialFlash.warning);
            if (initialFlash.failed) toast.failed(initialFlash.failed);
            if (initialFlash.error) toast.failed(initialFlash.error);
        }

        // Listen for subsequent page navigations / request updates
        const removeEventListener = router.on('success', (event) => {
            const flash = event.detail.page.props.flash;
            if (flash) {
                if (flash.success) toast.success(flash.success);
                if (flash.warning) toast.warning(flash.warning);
                if (flash.failed) toast.failed(flash.failed);
                if (flash.error) toast.failed(flash.error);
            }
        });

        return () => {
            toastListeners = toastListeners.filter((l) => l !== handleNewToast);
            removeEventListener();
        };
    }, []);

    const removeToast = (id) => {
        setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
    };

    if (!mounted) return null;

    const container = (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-sm px-4 md:px-0 pointer-events-none">
            {toasts.map((t) => (
                <ToastItem
                    key={t.id}
                    toast={t}
                    onClose={() => removeToast(t.id)}
                />
            ))}
        </div>
    );

    return createPortal(container, document.body);
}

function ToastItem({ toast, onClose }) {
    const { message, variant, duration } = toast;
    const [isExiting, setIsExiting] = useState(false);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        // Decrement progress bar
        const intervalTime = 10;
        const totalSteps = duration / intervalTime;
        let currentStep = 0;

        const progressInterval = setInterval(() => {
            currentStep += 1;
            const remaining = Math.max(0, 100 - (currentStep / totalSteps) * 100);
            setProgress(remaining);
        }, intervalTime);

        const exitTimer = setTimeout(() => {
            setIsExiting(true);
        }, duration - 300); // 300ms match transition-all duration

        const closeTimer = setTimeout(() => {
            onClose();
        }, duration);

        return () => {
            clearInterval(progressInterval);
            clearTimeout(exitTimer);
            clearTimeout(closeTimer);
        };
    }, [duration, onClose]);

    const handleManualClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 300);
    };

    const configs = {
        success: {
            icon: CheckCircle2,
            iconClass: "text-success",
            borderClass: "border-success/30",
            bgClass: "bg-card border-success/30 shadow-lg shadow-success/5",
            progressBg: "bg-success",
        },
        warning: {
            icon: AlertTriangle,
            iconClass: "text-warning",
            borderClass: "border-warning/30",
            bgClass: "bg-card border-warning/30 shadow-lg shadow-warning/5",
            progressBg: "bg-warning",
        },
        failed: {
            icon: XCircle,
            iconClass: "text-danger",
            borderClass: "border-danger/30",
            bgClass: "bg-card border-danger/30 shadow-lg shadow-danger/5",
            progressBg: "bg-danger",
        },
        info: {
            icon: Info,
            iconClass: "text-infoColor",
            borderClass: "border-infoColor/30",
            bgClass: "bg-card border-infoColor/30 shadow-lg shadow-infoColor/5",
            progressBg: "bg-infoColor",
        },
    };

    const config = configs[variant] || configs.info;
    const Icon = config.icon;

    return (
        <div
            className={cn(
                "pointer-events-auto relative overflow-hidden flex items-start gap-3 p-4 pr-8 rounded-xl border transition-all duration-300 transform",
                config.bgClass,
                isExiting
                    ? "opacity-0 translate-y-[-10px] scale-95"
                    : "opacity-100 translate-y-0 scale-100 animate-slide-in-right",
            )}
            role="alert"
        >
            <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", config.iconClass)} />
            <div className="flex-1 text-sm font-semibold text-primary-text leading-relaxed">
                {message}
            </div>
            
            <button
                onClick={handleManualClose}
                className="absolute top-3 right-3 shrink-0 p-1 text-primary-text/40 hover:text-primary-text hover:bg-black/5 rounded-lg transition-colors"
                aria-label="Close notification"
            >
                <X className="h-3.5 w-3.5" />
            </button>

            {/* Progress Bar for Auto-dismiss Visual Timer */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-black/5">
                <div
                    className={cn("h-full transition-all ease-linear", config.progressBg)}
                    style={{ width: `${progress}%`, transitionDuration: "10ms" }}
                />
            </div>
        </div>
    );
}
