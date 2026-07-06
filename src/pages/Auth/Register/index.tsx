import { useNavigate } from 'react-router-dom';

import { Mail, Lock, User, Phone, UserPlus } from "lucide-react";
import { TypeAnimation } from "react-type-animation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../../../components/common/Input";
import {
    registerSchema,
    type RegisterFormData,
} from "../../../types/Auth/RegisterSchema";
import { Spinner } from "../../../components/common/Spinner";
import { api } from "../../../api/axios";
import { toast } from "sonner";

export function RegisterPage() {
    const {
        register,
        setError,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const navigate = useNavigate();

    async function handleRegister(data: RegisterFormData) {
        try {
            const payload = {
                name: `${data.name} ${data.lastName}`,
                email: data.email,
                phone: data.phone,
                password: data.password,
                confirmPassword: data.password,
            };

            const response = await api.post("/auth/sign-up", payload);

            console.log(response.data);

            toast.success(
                "Conta criada com sucesso! Verifique sua caixa de entrada.",
            );

            // Corrigido: a rota é "emailconfirm" (minúsculo).
            navigate("/auth/emailconfirm", {state: {email: data.email}})
        } catch (error: any) {
            if (error.response) {
                const status = error.response.status;
                const message =
                    error.response.data.error || error.response.data.message;
                    
                if (status === 409 || status === 400) {
                    if (
                        message.includes("já existe") ||
                        message.includes("already") ||
                        message.includes("uso")
                    ) {
                        setError("email", {
                            message: "Este e-mail já está cadastrado.",
                        });
                    } else {
                        toast.error(
                            message ||
                                "Erro ao processar seu cadastro. Verifique os dados.",
                        );
                    }
                } else if (status === 500) {
                    toast.error(
                        "Erro interno no servidor. Tente novamente mais tarde.",
                    );
                } else {
                    toast.error("Ocorreu um erro inesperado. Tente novamente.");
                }
            } else {
                toast.error(
                    "Não foi possível conectar ao servidor. Tente novamente mais tarde.",
                );
            }
        }
    }

    const formatPhone = (value: string) => {
        const numbers = value.replace(/\D/g, "");
        return numbers
            .replace(/^(\d{2})(\d)/, "($1) $2")
            .replace(/(\d{5})(\d)/, "$1-$2")
            .slice(0, 15);
    };

    return (
        <div className="grid grid-col-1 md:grid-cols-2 gap-x-5 bg-background min-h-screen text-text px-10 py-7">
            <div className="flex flex-col justify-center items-center p-8 sm:p-12 lg:p-22 bg-surface rounded-2xl relative z-10 shadow-2xl">
                <div className="w-full max-w-md space-y-6">
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
                        <h1 className="text-3xl font-bold mb-1">
                            Crie sua conta
                        </h1>
                        <p className="text-text-muted text-sm">
                            Comece a centralizar suas operações de marketing
                            hoje mesmo.
                        </p>
                    </div>

                    <form
                        className="mt-6 space-y-4"
                        onSubmit={handleSubmit(handleRegister)}
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                type="text"
                                id="name"
                                label="Nome"
                                placeholder="ex: João"
                                icon={User}
                                error={errors.name?.message}
                                {...register("name")}
                            />

                            <Input
                                type="text"
                                id="lastName"
                                label="Sobrenome"
                                placeholder="ex: Silva"
                                icon={User}
                                error={errors.lastName?.message}
                                {...register("lastName")}
                            />
                        </div>

                        <Input
                            type="tel"
                            id="phone"
                            label="Telefone"
                            placeholder="(85) 99999-9999"
                            icon={Phone}
                            error={errors.phone?.message}
                            {...register("phone", {
                                onChange: (e) => {
                                    e.target.value = formatPhone(
                                        e.target.value,
                                    );
                                },
                            })}
                        />

                        <Input
                            type="email"
                            id="email"
                            label="Email"
                            placeholder="ex: nome@gmail.com"
                            icon={Mail}
                            error={errors.email?.message}
                            {...register("email")}
                        />

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
                                    Criando conta...
                                </div>
                            ) : (
                                <div className="flex gap-2 justify-center items-center">
                                    <UserPlus size={20} />
                                    Cadastrar
                                </div>
                            )}
                        </button>

                        <p className="mt-4 text-center text-sm text-text-muted">
                            Já possui uma conta?{" "}
                            <a
                                href="/auth/login"
                                className="font-semibold text-primary hover:text-primary-hover hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface rounded-sm"
                            >
                                Faça login
                            </a>
                        </p>
                    </form>
                </div>
            </div>

            <div className="hidden md:flex flex-col w-full h-full justify-center p-12 lg:p-20 relative overflow-hidden bg-background border-l border-border rounded-2xl">
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
