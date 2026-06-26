import { ArrowLeft, RefreshCw, MailOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner"; 
import { Spinner } from "../../../components/common/Spinner";

export function EmailConfirmPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        if (!location.state) {
            toast.warning('Email não encontrado.');
            navigate('/auth/login')
        }
    }, [])

    async function handleResendEmail() {
        setIsResending(true);
        try {
            console.log(location.state.email)
            // await api.post("/auth/resend-confirmation", { email });

            await new Promise((resolve) => setTimeout(resolve, 2000));
            toast.success("E-mail de confirmação reenviado com sucesso!");
        } catch (error: any) {
            toast.error(
                "Erro ao reenviar o e-mail. Tente novamente mais tarde.",
            );
        } finally {
            setIsResending(false);
        }
    }

    return (
        <div className="min-h-screen bg-background text-text flex flex-col justify-center items-center p-4 relative overflow-hidden">
            <div className="absolute w-full h-full bg-primary opacity-10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-sm p-8 sm:p-10 bg-surface rounded-2xl relative z-10 shadow-2xl border border-border text-center">
                <div className="flex justify-center items-center mb-6">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                        <MailOpen className="w-10 h-10 text-primary" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold mb-3">
                    Verifique seu e-mail
                </h1>

                <p className="text-text-muted text-sm mb-8 leading-relaxed">
                    Enviamos um link de confirmação para você. Por favor, clique
                    no link enviado para ativar sua conta e liberar seu acesso à
                    plataforma. <strong>{location.state.email}</strong>
                    <br />
                    <br />
                    <span className="text-xs">
                        Não se esqueça de checar a pasta de spam ou lixo
                        eletrônico.
                    </span>
                </p>

                <div className="space-y-4">
                    <button
                        onClick={handleResendEmail}
                        disabled={isResending}
                        className={`cursor-pointer w-full flex justify-center py-2 px-4 border border-border rounded-md shadow-sm text-sm font-medium text-text bg-transparent outline-none transition-all duration-300 ${
                            !isResending
                                ? "hover:bg-border focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
                                : "opacity-70 cursor-not-allowed"
                        }`}
                    >
                        {isResending ? (
                            <div className="flex gap-2 justify-center items-center">
                                <Spinner />
                                Reenviando...
                            </div>
                        ) : (
                            <div className="flex gap-2 justify-center items-center">
                                <RefreshCw size={18} />
                                Reenviar e-mail
                            </div>
                        )}
                    </button>

                    <button
                        onClick={() => navigate("/auth/login")}
                        className="w-full inline-flex justify-center items-center py-2 text-sm font-medium text-primary hover:text-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface rounded-sm"
                    >
                        <ArrowLeft size={16} className="mr-2" />
                        Voltar para o login
                    </button>
                </div>
            </div>
        </div>
    );
}
