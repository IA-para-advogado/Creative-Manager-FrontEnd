import { z } from "zod";

export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .min(1, "O e-mail é obrigatório.")
        .email("Digite um formato de e-mail válido."),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
    