import { CheckCircle, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ConfirmedPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background text-text flex flex-col justify-center items-center p-4 relative overflow-hidden">
            <div className="absolute w-full h-full bg-primary opacity-10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-sm p-8 sm:p-10 bg-surface rounded-2xl relative z-10 shadow-2xl border border-border text-center">
                <div className="flex justify-center items-center mb-6">
                    <div className="relative w-24 h-24">
                        <div className="absolute inset-0 rounded-full bg-primary"></div>
                        <div className="absolute inset-1 rounded-full bg-background flex items-center justify-center">
                            <h1 className="text-4xl font-extrabold">
                                C<span className="text-primary">M</span>
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="mx-auto w-14 h-14 bg-success/20 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-success" />
                </div>

                <h1 className="text-2xl font-bold mb-2">Conta confirmada!</h1>

                <p className="text-text-muted text-sm mb-8 leading-relaxed">
                    Seu e-mail foi validado com sucesso e sua conta já está ativa.
                    Faça login para começar a gerenciar suas operações.
                </p>

                <button
                    onClick={() => navigate("/auth/login")}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover hover:scale-[1.02] outline-none transition-all duration-300 cursor-pointer"
                >
                    <LogIn size={18} />
                    Ir para o login
                </button>
            </div>
        </div>
    );
}
