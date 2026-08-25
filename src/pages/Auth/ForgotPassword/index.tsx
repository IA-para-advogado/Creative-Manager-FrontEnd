import { Mail, ArrowLeft, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../../../components/common/Input";
import { Spinner } from "../../../components/common/Spinner";
import { api } from "../../../api/axios";
import { toast } from "sonner";
import {
    forgotPasswordSchema,
    type ForgotPasswordFormData,
} from "../../../types/Auth/ForgotPasswordSchema";

export function ForgotPasswordPage() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isSubmitSuccessful },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    async function handleRecoverPassword(data: ForgotPasswordFormData) {
        try {
            await api.post("/auth/reset-password-request", { email: data.email });
        } catch (error: any) {
            if (error.response) {
                const status = error.response.status;
                const message = error.response.data?.message || error.response.data?.error;
                if (status === 400 || status === 404) {
                    toast.error(message || "E-mail inválido ou não encontrado.");
                } else if (status === 500 || status === 429) {
                    toast.error(message || "Erro interno no servidor. Tente novamente mais tarde.");
                } else {
                    toast.error(message || "Ocorreu um erro inesperado. Tente novamente.");
                }
            } else {
                toast.error("Não foi possível conectar ao servidor. Tente novamente mais tarde.");
            }
            // Interrompe o submit para evitar que a tela de sucesso apareça indevidamente
            throw error;
        }
    }

    return (
        <div className="min-h-screen bg-background text-text flex flex-col justify-center items-center p-4">
            <div className="absolute w-full h-full bg-primary opacity-10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-sm p-8 sm:p-10 bg-surface rounded-2xl relative z-10 shadow-2xl border border-border">
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

                {isSubmitSuccessful ? (
                    <div className="text-center space-y-4 animate-in fade-in zoom-in duration-500 border-t-2 pt-4 border-primary-hover">
                        <div className="mx-auto w-14 h-14 bg-success/20 rounded-full flex items-center justify-center mb-4">
                            <Mail className="w-8 h-8 text-success" />
                        </div>
                        <h2 className="text-2xl font-bold">E-mail enviado!</h2>
                        <p className="text-text-muted text-sm">
                            Se houver uma conta associada a este e-mail, você
                            receberá um link para redefinir sua senha em
                            instantes.
                        </p>
                        <a
                            href="/auth/login"
                            className="w-full inline-flex justify-center items-center py-2 mt-6 text-sm font-medium text-text bg-transparent border border-border rounded-md hover:bg-background transition-colors"
                        >
                            <ArrowLeft size={16} className="mr-2" />
                            Voltar para o login
                        </a>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold mb-2">
                                Esqueceu sua senha?
                            </h1>
                            <p className="text-text-muted text-sm">
                                Digite seu e-mail abaixo e enviaremos as
                                instruções para redefinir sua senha.
                            </p>
                        </div>

                        <form
                            className="space-y-6"
                            onSubmit={handleSubmit(handleRecoverPassword)}
                        >
                            <Input
                                type="email"
                                id="email"
                                label="Email"
                                placeholder="ex: nome@gmail.com"
                                icon={Mail}
                                error={errors.email?.message}
                                {...register("email")}
                            />

                            <button
                                type="submit"
                                className={`cursor-pointer w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary outline-none transition-all duration-500 ${
                                    !isSubmitting
                                        ? "hover:scale-[1.02] hover:bg-primary-hover"
                                        : "bg-violet-900"
                                }`}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <div className="flex gap-2 justify-center items-center">
                                        <Spinner />
                                        Enviando...
                                    </div>
                                ) : (
                                    <div className="flex gap-2 justify-center items-center">
                                        <Send size={18} />
                                        Enviar link
                                    </div>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <a
                                href="/auth/login"
                                className="inline-flex items-center text-sm font-medium text-text-muted hover:text-text transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface rounded-sm"
                            >
                                <ArrowLeft size={16} className="mr-2" />
                                Voltar para o login
                            </a>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
