import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "../../components/common/Input";
import { Mail, User, Phone, Info } from "lucide-react";
import { toast } from "sonner"; // opcional, mas vi que está no package.json

const profileSchema = z.object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
    phone: z.string().min(14, "Telefone inválido").optional().or(z.literal("")),
    email: z.string().email("E-mail inválido"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const normalizePhone = (value: string | undefined) => {
    if (!value) return "";
    
    return value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4,5})(\d{4})/, "$1-$2")
        .substring(0, 15);
};

export function ProfileTab() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: "John Doe",
            phone: "(11) 99999-9999",
            email: "john.doe@example.com",
        },
    });

    const onSubmit = async (data: ProfileFormData) => {
        try {
            // Simulando integração
            console.log("Payload para integração:", data);
            
            await new Promise((resolve) => setTimeout(resolve, 1000));
            
            toast?.success?.("Perfil atualizado com sucesso!");
        } catch (error) {
            toast?.error?.("Erro ao atualizar o perfil");
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-fade-in">
            <div>
                <h3 className="text-lg font-medium">Perfil</h3>
                <p className="text-sm text-text-muted">
                    Informações que podem ser vistas por outros usuários.
                </p>
            </div>

            <div className="bg-surface border border-border rounded-lg p-6 space-y-6">
                <div className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
                        JD
                    </div>
                    <button type="button" className="px-4 py-2 bg-background border border-border rounded-md text-sm font-medium hover:bg-border transition-colors">
                        Alterar Foto
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Nome Completo"
                        id="name"
                        icon={User}
                        maxLength={100}
                        error={errors.name?.message}
                        {...register("name")}
                    />
                    <Input
                        label="Telefone"
                        id="phone"
                        type="tel"
                        icon={Phone}
                        maxLength={15}
                        error={errors.phone?.message}
                        {...register("phone", {
                            onChange: (e) => {
                                e.target.value = normalizePhone(e.target.value);
                            }
                        })}
                    />
                    <div className="md:col-span-2">
                        <Input
                            label="E-mail"
                            id="email"
                            type="email"
                            icon={Mail}
                            error={errors.email?.message}
                            {...register("email")}
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                </button>
            </div>
        </form>
    );
}
