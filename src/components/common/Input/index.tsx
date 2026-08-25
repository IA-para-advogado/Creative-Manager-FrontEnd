import { type InputHTMLAttributes, forwardRef, useState } from "react";
import { type LucideIcon, Eye, EyeOff } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon?: LucideIcon;
    error?: string;
    showPasswordToggle?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        { label, icon: Icon, error, id, showPasswordToggle, type, ...rest },
        ref,
    ) => {
        const [showPassword, setShowPassword] = useState<boolean>(false);
        const inputType = showPasswordToggle && showPassword ? "text" : type;

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
                        type={inputType}
                        className={`
                            block w-full py-2 bg-background border rounded-md text-text placeholder-text-muted 
                            focus:outline-none focus:ring-1 transition-colors

                            autofill:shadow-[inset_0_0_0px_1000px_var(--color-background)]
                            autofill:[-webkit-text-fill-color:var(--color-text)]

                            ${
                                Icon
                                    ? showPasswordToggle
                                        ? "pl-10 pr-10"
                                        : "pl-10 pr-3"
                                    : "px-3"
                            }

                            ${
                                error
                                    ? "border-danger focus:border-danger focus:ring-danger"
                                    : "border-border focus:border-primary focus:ring-primary"
                            }
                        `}
                        {...rest}
                    />

                    {showPasswordToggle && (
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text cursor-pointer"
                        >
                            {showPassword ? (
                                <EyeOff size={18} />
                            ) : (
                                <Eye size={18} />
                            )}
                        </button>
                    )}
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
