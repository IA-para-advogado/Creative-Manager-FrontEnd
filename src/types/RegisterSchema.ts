import { z } from "zod";

export const registerSchema = z.object({
    name: z.string()
        .min(1, "O nome é obrigatório.")
        .refine((value) => value.length >= 3, {
            message: "O nome deve ter no mínimo 3 caracteres."
        })
        ,
    lastName: z.string().min(1, "O sobrenome é obrigatório."),
    phone: z
        .string()
        .min(1, "O telefone é obrigatório.")
        .transform((value) => value.replace(/\D/g, ""))
        .refine((value) => value.length === 11, {
            message: "Telefone inválido"
        }),
    email: z
        .string()
        .min(1, "O e-mail é obrigatório.")
        .email("Digite um formato de e-mail válido."),
    password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres."),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
