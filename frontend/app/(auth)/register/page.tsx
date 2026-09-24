import { RegisterForm } from "@/components/RegisterForm";
import { Zap, ShieldCheck, Clock3, TrendingDown } from "lucide-react";

export default function RegisterPage() {
    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Left — form */}
            <div className="flex flex-1 flex-col items-center justify-center px-8 py-16">
                <RegisterForm />
            </div>

            {/* Right — feature panel */}
            <div className="hidden lg:flex flex-col justify-between w-120 border-l border-slate-200 bg-white p-14">
                <div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-md shadow-indigo-600/20">
                        <Zap className="h-5 w-5 text-white" />
                    </div>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-indigo-600">FlashBuy</p>

                    <h2 className="mt-8 text-3xl font-black tracking-tight text-slate-900 leading-snug">
                        Join in.<br />
                        Never miss a deal.
                    </h2>
                    <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                        Create your account in seconds and get access to exclusive timed sales.
                    </p>
                </div>

                <div className="space-y-4">
                    {[
                        { icon: Clock3, label: "Live countdown timers", sub: "Know exactly when a deal ends" },
                        { icon: TrendingDown, label: "Real-time price drops", sub: "Prices update as stock falls" },
                        { icon: ShieldCheck, label: "Secure checkout", sub: "End-to-end encrypted transactions" },
                    ].map(({ icon: Icon, label, sub }) => (
                        <div key={label} className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                <Icon className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-800">{label}</p>
                                <p className="text-xs text-slate-400">{sub}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <p className="text-xs text-slate-300">© {new Date().getFullYear()} FlashBuy</p>
            </div>
        </div>
    );
}
