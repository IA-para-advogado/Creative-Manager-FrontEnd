import { useState } from "react";
import { toast } from "sonner";

export function AccountTab() {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm("Tem certeza que deseja excluir sua conta? Esta ação é irreversível.");
        
        if (!confirmDelete) return;

        try {
            setIsDeleting(true);
            
            // Simulando integração
            const payload = { action: "delete_account", timestamp: new Date().toISOString() };
            console.log("Payload para integração (Excluir Conta):", payload);
            
            await new Promise((resolve) => setTimeout(resolve, 1500));
            
            toast?.success?.("Sua solicitação de exclusão foi enviada.");
            // Aqui normalmente você faria o logout e redirecionaria o usuário
        } catch (error) {
            toast?.error?.("Erro ao tentar excluir a conta.");
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h3 className="text-lg font-medium">Preferências da Conta</h3>
                <p className="text-sm text-text-muted">
                    Gerencie configurações gerais da sua conta.
                </p>
            </div>

            <div className="bg-surface border border-border rounded-lg p-6">
                <div>
                    <h4 className="text-sm font-medium text-danger mb-2">Zona de Perigo</h4>
                    <p className="text-sm text-text-muted mb-4">
                        A exclusão da conta é permanente e não pode ser desfeita. Todos os seus dados serão apagados.
                    </p>
                    <button 
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="px-4 py-2 bg-danger/10 text-danger border border-danger/20 rounded-md text-sm font-medium hover:bg-danger/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isDeleting ? "Excluindo..." : "Excluir Conta"}
                    </button>
                </div>
            </div>
        </div>
    );
}
