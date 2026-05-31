import { type InputHTMLAttributes, forwardRef } from "react";
import { type LucideIcon } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon?: LucideIcon;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, icon: Icon, error, id, ...rest }, ref) => {
        return (
            <div className="w-full">
                <label
                    htmlFor={id}
                    className="block text-sm font-medium mb-1 text-text"
                >
                    {label}
                </label>

                <div className="relative">
                    {Icon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Icon className="w-5 h-5 text-text-muted" />
                        </div>
                    )}

                    <input
                        id={id}
                        ref={ref}
                        className={`
                            block w-full py-2 bg-background border rounded-md text-text placeholder-text-muted 
                            focus:outline-none focus:ring-1 transition-colors
                            ${Icon ? "pl-10 pr-3" : "px-3"}
                            ${
                                error
                                    ? "border-danger focus:border-danger focus:ring-danger"
                                    : "border-border focus:border-primary focus:ring-primary"
                            }
                        `}
                        {...rest}
                    />
                </div>

                {error && (
                    <span className="text-xs text-danger mt-1 block">
                        {error}
                    </span>
                )}
            </div>
        );
    },
);

Input.displayName = "Input";
