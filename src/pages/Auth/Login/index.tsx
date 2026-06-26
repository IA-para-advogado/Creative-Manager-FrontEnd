import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, LogIn } from "lucide-react";
import { TypeAnimation } from "react-type-animation";
import { Input } from "../../../components/common/Input";
import {
    loginSchema,
    type LoginFormData,
} from "../../../types/Auth/LoginSchema";
import { Spinner } from "../../../components/common/Spinner";
import { api } from "../../../api/axios";
import { toast } from "sonner";

export function LoginPage() {
    const {
        register,
        setError,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

    const navigate = useNavigate();

    async function handleLogin(data: LoginFormData) {
        try {
            const payload: LoginFormData = {
                email: data.email,
                password: data.password,
            };
            const response = await api.post("/auth/sign-in", payload);
            const { user, access_token } = response.data;

            localStorage.setItem("@CM:access_token", access_token);
            localStorage.setItem("@CM:user", JSON.stringify(user));

            api.defaults.headers.common["Authorization"] =
                `Bearer ${access_token}`;

            toast.success("Login efetuado com sucesso!");

            navigate("/home");
        } catch (error: any) {
            if (error.response) {
                const status = error.response.status;
                const message = error.response.data.error;

                if (status === 401) {
                    if (message.includes("inválidos")) {
                        setError("email", {
                            message: "E-mail ou senha inválidos.",
                        });

                        setError("password", {
                            message: "E-mail ou senha inválidos.",
                        });
                    } else if (message.includes("confirmado")) {
                        toast.warning("Confirme seu email para concluir seu cadastro.");
                        navigate("/auth/emailConfirm");
                    }
                } else if (status === 500) {
                    toast.error(
                        "Erro interno no servidor. Tente novamente mais tarde.",
                    );
                }
            } else {
                toast.error(
                    "Erro interno no servidor. Tente novamente mais tarde.",
                );
            }
        }
    }

    return (
        <div className="grid grid-col-1 md:grid-cols-2 gap-x-5 bg-background min-h-screen text-text  px-10 py-7">
            <div className="flex flex-col justify-center items-center p-8 sm:p-12 lg:p-22 bg-surface rounded-2xl">
                <div className="w-full max-w-md space-y-8">
                    <div className="flex justify-center items-center">
                        <div className="relative w-36 h-36">
                            <div className="absolute inset-0 rounded-full bg-primary"></div>
                            <div className="absolute inset-1 rounded-full bg-background flex items-center justify-center">
                                <h1 className="text-7xl font-extrabold">
                                    C<span className="text-primary">M</span>
                                </h1>
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <h1 className="text-3xl font-bold mb-2">
                            Bem-vindo(a) de volta!
                        </h1>
                        <p className="text-text-muted text-sm">
                            Organize suas campanhas, acompanhe seus resultados e
                            mantenha todas as suas atividades de marketing sob
                            controle em um único lugar.
                        </p>
                    </div>

                    <form
                        className="mt-8 space-y-6"
                        onSubmit={handleSubmit(handleLogin)}
                    >
                        <div className="space-y-4">
                            <Input
                                type="email"
                                id="email"
                                label="Email"
                                placeholder="ex: nome@gmail.com"
                                icon={Mail}
                                error={errors.email?.message}
                                {...register("email")}
                            />

                            <div>
                                <Input
                                    type="password"
                                    id="password"
                                    label="Senha"
                                    placeholder="********"
                                    icon={Lock}
                                    showPasswordToggle
                                    error={errors.password?.message}
                                    {...register("password")}
                                />
                                <div className="flex justify-end mt-1.5">
                                    <a
                                        href="/auth/forgotpassword"
                                        className="text-sm font-medium text-primary hover:text-primary-hover hover:underline transition-colors focus:outline-none rounded-sm"
                                    >
                                        Esqueceu a senha?
                                    </a>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={`cursor-pointer w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary  outline-none transition-all duration-500 ${!isSubmitting ? "hover:scale-[1.02] hover:bg-primary-hover" : "bg-violet-900"}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <div className="flex gap-2 justify-center items-center">
                                    <Spinner />
                                    Entrando
                                </div>
                            ) : (
                                <div className="flex gap-2 justify-center items-center">
                                    <LogIn size={20} />
                                    Fazer login{" "}
                                </div>
                            )}
                        </button>

                        <p className="mt-6 text-center text-sm text-text-muted">
                            Ainda não tem uma conta?{" "}
                            <a
                                href="/auth/register"
                                className="font-semibold text-primary hover:text-primary-hover hover:underline transition-colors focus:outline-none rounded-sm"
                            >
                                Cadastre-se
                            </a>
                        </p>
                    </form>
                </div>
            </div>

            <div className="hidden md:flex flex-col w-full h-full justify-center p-12 lg:p-20 relative overflow-hidden bg-background border-l border-border rounded-2xl">
                {/* efeito de glow */}
                <div className="absolute top-[-20%] right-[-10%] w-125 h-125 bg-primary opacity-20 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-100 h-100 bg-success opacity-10 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="z-10 w-full max-w-2xl">
                    <h2 className="text-5xl lg:text-7xl font-extrabold text-text leading-[1.1] tracking-tight">
                        Assuma <br />
                        o controle <br />
                        <span className="text-primary mt-2 w-full inline-block whitespace-nowrap">
                            <TypeAnimation
                                sequence={[
                                    "dos criativos.",
                                    2500,
                                    "das campanhas.",
                                    2500,
                                    "das métricas.",
                                    2500,
                                    "do seu ROI.",
                                    2500,
                                ]}
                                wrapper="span"
                                speed={40}
                                deletionSpeed={60}
                                repeat={Infinity}
                                cursor={true}
                            />
                        </span>
                    </h2>

                    <p className="mt-8 text-lg lg:text-xl text-text-muted max-w-lg font-medium">
                        A plataforma para profissionais de marketing
                        centralizarem operações e tomarem decisões baseadas em
                        dados reais.
                    </p>
                </div>
            </div>
        </div>
    );
}
