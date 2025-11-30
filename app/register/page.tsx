import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center p-6 selection:bg-indigo-500/30">
            <div className="w-full max-w-md mb-8 text-center">
                <div className="inline-flex items-center justify-center gap-2 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20">
                        P
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-white">
                        Portfolio<span className="text-indigo-400">App</span>
                    </span>
                </div>
            </div>
            <RegisterForm />
        </div>
    )
}
