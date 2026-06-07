import { Lock, ArrowLeft, CheckCircle, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../../../components/common/Input";
import { Spinner } from "../../../components/common/Spinner";
import {
    resetPasswordSchema,
    type ResetPasswordFormData,
} from "../../../types/Auth/ResetPasswordSchema";

export function ResetPasswordPage() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isSubmitSuccessful },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    async function handleResetPassword(data: ResetPasswordFormData) {
        console.log("Nova senha validada:", data);
        await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return (
        <div className="min-h-screen bg-background text-text flex flex-col justify-center items-center p-4 relative overflow-hidden">
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
                            <CheckCircle className="w-8 h-8 text-success" />
                        </div>
                        <h2 className="text-2xl font-bold">Senha alterada!</h2>
                        <p className="text-text-muted text-sm">
                            Sua senha foi redefinida com sucesso. Você já pode
                            acessar a plataforma.
                        </p>
                        <a
                            href="/auth/login"
                            className="w-full inline-flex justify-center items-center py-2 mt-6 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
                        >
                            Fazer login agora
                        </a>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold mb-2">
                                Criar nova senha
                            </h1>
                            <p className="text-text-muted text-sm">
                                Digite sua nova senha abaixo.
                            </p>
                        </div>

                        <form
                            className="space-y-4"
                            onSubmit={handleSubmit(handleResetPassword)}
                        >
                            <Input
                                type="password"
                                id="password"
                                label="Nova Senha"
                                placeholder="Mínimo de 8 caracteres"
                                icon={Lock}
                                error={errors.password?.message}
                                {...register("password")}
                            />

                            <Input
                                type="password"
                                id="confirmPassword"
                                label="Confirmar Senha"
                                placeholder="Repita a nova senha"
                                icon={Lock}
                                error={errors.confirmPassword?.message}
                                {...register("confirmPassword")}
                            />

                            <button
                                type="submit"
                                className={`cursor-pointer w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary outline-none transition-all duration-500 mt-6 ${
                                    !isSubmitting
                                        ? "hover:scale-[1.02] hover:bg-primary-hover"
                                        : "bg-violet-900"
                                }`}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <div className="flex gap-2 justify-center items-center">
                                        <Spinner />
                                        Salvando...
                                    </div>
                                ) : (
                                    <div className="flex gap-2 justify-center items-center">
                                        <Save size={18} />
                                        Redefinir Senha
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
