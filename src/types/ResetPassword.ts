import { z } from "zod";

export const resetPasswordSchema = z
    .object({
        password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres."),
        confirmPassword: z.string().min(1, "Confirme sua senha."),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "As senhas não coincidem.",
        path: ["confirmPassword"],
    });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
