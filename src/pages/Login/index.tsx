import { Mail, Lock } from "lucide-react";
import { TypeAnimation } from "react-type-animation";
import { Input } from "../../components/common/Input";

export function LoginPage() {
    return (
        <div className="grid grid-col-1 md:grid-cols-2 gap-x-5 bg-background min-h-screen text-text  px-10 py-7">
            <div className="flex flex-col justify-center items-center p-8 sm:p-12 lg:p-22 bg-surface rounded-2xl">
                <div className="w-full max-w-md space-y-8">
                    <h1 className="text-5xl text-center font-extrabold text-primary">
                        LOGO
                    </h1>

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

                    <form className="mt-8 space-y-6" action="">
                        <div className="space-y-4">
                            <Input
                                type="email"
                                id="email"
                                name="email"
                                label="Email"
                                placeholder="ex: nome@gmail.com"
                                icon={Mail}
                                required
                            />

                            <Input
                                type="password"
                                id="password"
                                name="password"
                                label="Senha"
                                placeholder="********"
                                icon={Lock}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="cursor-pointer w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background transition-colors"
                        >
                            Entrar
                        </button>
                    </form>
                </div>
            </div>

            <div 
                className="hidden md:flex flex-col w-full h-full justify-center p-12 lg:p-20 relative overflow-hidden bg-background border-l border-border rounded-2xl"
            >
            
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
