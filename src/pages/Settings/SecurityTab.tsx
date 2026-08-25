import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "../../components/common/Input";
import { Key } from "lucide-react";
import { toast } from "sonner";

const securitySchema = z.object({
    currentPassword: z.string().min(1, "A senha atual é obrigatória"),
    newPassword: z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string().min(1, "A confirmação da senha é obrigatória"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
});

type SecurityFormData = z.infer<typeof securitySchema>;

export function SecurityTab() {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<SecurityFormData>({
        resolver: zodResolver(securitySchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: SecurityFormData) => {
        try {
            // Payload validado pronto para envio ao backend
            const payload = {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            };
            console.log("Payload para integração (Alterar Senha):", payload);

            // Simulando o tempo da requisição
            await new Promise((resolve) => setTimeout(resolve, 1000));

            toast?.success?.("Senha atualizada com sucesso!");
            reset(); // Limpa os campos após o sucesso
        } catch (error) {
            toast?.error?.("Erro ao atualizar a senha");
            console.error(error);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h3 className="text-lg font-medium">Segurança</h3>
                <p className="text-sm text-text-muted">
                    Gerencie sua senha e configurações de segurança.
                </p>
            </div>

            <div className="bg-surface border border-border rounded-lg p-6">
                <div>
                    <h4 className="text-sm font-medium mb-4">Alterar Senha</h4>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Input
                            label="Senha Atual"
                            id="currentPassword"
                            type="password"
                            icon={Key}
                            placeholder="********"
                            showPasswordToggle
                            error={errors.currentPassword?.message}
                            {...register("currentPassword")}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Nova Senha"
                                id="newPassword"
                                type="password"
                                icon={Key}
                                placeholder="********"
                                showPasswordToggle
                                error={errors.newPassword?.message}
                                {...register("newPassword")}
                            />
                            <Input
                                label="Confirmar Nova Senha"
                                id="confirmPassword"
                                type="password"
                                icon={Key}
                                placeholder="********"
                                showPasswordToggle
                                error={errors.confirmPassword?.message}
                                {...register("confirmPassword")}
                            />
                        </div>
                        <div className="flex pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "Atualizando..." : "Atualizar Senha"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
