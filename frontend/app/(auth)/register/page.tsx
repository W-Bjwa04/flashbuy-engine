import { RegisterForm } from "@/components/RegisterForm";
import { Zap, ShieldCheck, Clock3, TrendingDown } from "lucide-react";

export default function RegisterPage() {
    return (
        <div className="flex min-h-screen bg-zinc-950">
            {/* Left — form */}
            <div className="flex flex-1 flex-col items-center justify-center px-8 py-16">
                <RegisterForm />
            </div>

            {/* Right — visual panel, hidden on mobile */}
            <div className="hidden lg:flex flex-col justify-between w-120 border-l border-zinc-800/60 bg-zinc-900/40 p-14">
                <div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/30">
                        <Zap className="h-5 w-5 text-white" />
                    </div>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-indigo-400">FlashBuy</p>

                    <h2 className="mt-8 text-3xl font-black tracking-tight text-zinc-100 leading-snug">
                        Join in.<br />
                        Never miss a deal.
                    </h2>
                    <p className="mt-3 text-sm text-zinc-500 leading-relaxed">
                        Create your account in seconds and get access to exclusive timed sales on top products.
                    </p>
                </div>

                <div className="space-y-4">
                    {[
                        { icon: Clock3, label: "Live countdown timers", sub: "Know exactly when a deal ends" },
                        { icon: TrendingDown, label: "Real-time price drops", sub: "Prices update as stock falls" },
                        { icon: ShieldCheck, label: "Secure checkout", sub: "End-to-end encrypted transactions" },
                    ].map(({ icon: Icon, label, sub }) => (
                        <div key={label} className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
                                <Icon className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-zinc-200">{label}</p>
                                <p className="text-xs text-zinc-500">{sub}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <p className="text-xs text-zinc-700">© {new Date().getFullYear()} FlashBuy</p>
            </div>
        </div>
    );
}
