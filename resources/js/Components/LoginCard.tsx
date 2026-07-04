import type { FormEventHandler } from "react";
import Button from "@/Components/ui/Button";
import Input from "@/Components/ui/Input";

interface LoginCardProps {
    onSubmit: FormEventHandler;
    loading?: boolean;
    error?: string;
    data?: {
        username: string;
        password: string;
        remember: boolean;
    };
    setData?: (field: string, value: string | boolean) => void;
}

export default function LoginCard({
    onSubmit,
    loading,
    error,
    data,
    setData,
}: LoginCardProps) {
    return (
        <div className="relative flex w-7xl max-w-full min-h-150 lg:h-180 shadow-modal rounded-xl overflow-hidden bg-background">
            {/* Left Panel — Branding */}
            <div className="hidden lg:flex w-120 bg-primary p-12 flex-col justify-center items-center text-white shrink-0">
                <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mb-6">
                    <span className="text-primary text-3xl font-bold font-inter">
                        UII
                    </span>
                </div>
                <h2 className="text-2xl font-bold font-inter mb-3">
                    Portal SSO Mandiri
                </h2>
                <p className="text-center text-white/70 text-sm font-inter leading-relaxed max-w-70">
                    Satu identitas digital resmi untuk seluruh civitas akademika
                    SMA UII.
                </p>
            </div>

            {/* Right Panel — Form */}
            <div className="flex-1 bg-surface p-8 lg:p-12 flex flex-col justify-center items-center">
                <div className="w-full max-w-[320px]">
                    {/* Mobile logo */}
                    <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center mx-auto mb-6 lg:hidden">
                        <span className="text-accent text-xl font-bold font-inter">
                            UII
                        </span>
                    </div>

                    <h1 className="text-center text-[20px] font-bold text-text-primary font-inter mb-8">
                        Sign In Institusi
                    </h1>

                    {error && (
                        <div className="bg-danger-bg text-danger px-4 py-2 rounded-lg text-[13px] font-inter mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="flex flex-col gap-5">
                        <Input
                            name="username"
                            label="Username / NISN"
                            placeholder="Masukkan username atau NISN"
                            icon="fa-user"
                            required
                            value={data?.username ?? ""}
                            onChange={(e) =>
                                setData?.("username", e.target.value)
                            }
                        />
                        <Input
                            name="password"
                            label="Password"
                            type="password"
                            placeholder="Masukkan password"
                            icon="fa-lock"
                            required
                            value={data?.password ?? ""}
                            onChange={(e) =>
                                setData?.("password", e.target.value)
                            }
                        />
                        <label className="flex items-center gap-2 text-[13px] text-text-muted font-inter cursor-pointer">
                            <input
                                type="checkbox"
                                name="remember"
                                checked={data?.remember ?? false}
                                onChange={(e) =>
                                    setData?.("remember", e.target.checked)
                                }
                                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                            />
                            Ingat saya
                        </label>
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            loading={loading}
                            className="w-full justify-center"
                        >
                            MASUK
                        </Button>
                    </form>
                </div>
            </div>

            {/* Footer */}
            <footer className="absolute bottom-0 left-0 right-0 flex justify-center py-3 bg-surface border-t border-border">
                <span className="text-[13px] text-text-muted font-inter">
                    &copy; 2026 SMA UII Yogyakarta &mdash; Copyright Terpusat
                </span>
            </footer>
        </div>
    );
}
