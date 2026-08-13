import { Link } from "@inertiajs/react";
import { useState, type FormEventHandler } from "react";
import BrandLogo from "@/Components/layout/BrandLogo";
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

export default function LoginCard({ onSubmit, loading, error, data, setData }: LoginCardProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="w-full flex flex-col min-h-dvh lg:min-h-0 lg:h-[calc(100dvh-3rem)] lg:min-h-[460px] lg:max-w-4xl lg:flex-row lg:rounded-2xl lg:shadow-modal lg:overflow-hidden bg-surface">
            {/* Brand — bar biru full-bleed di mobile/tablet, panel kiri di lg+ */}
            <div className="relative bg-primary text-white overflow-hidden shrink-0 lg:flex lg:flex-col lg:w-2/5">
                <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/5 rounded-full" />
                <div className="absolute -bottom-24 -left-12 w-72 h-72 bg-accent/10 rounded-full blur-2xl" />

                <div className="relative px-5 py-4 sm:py-5 lg:flex-1 lg:flex lg:flex-col lg:justify-between lg:items-start lg:text-left lg:gap-5 lg:px-10 lg:py-4">
                    {/* Mobile (< sm): logo tanpa badge + judul, sejajar */}
                    <div className="flex items-center gap-4 sm:hidden">
                        <BrandLogo size="md" badge={false} />
                        <h2 className="text-base font-bold font-inter">Portal SSO Mandiri</h2>
                    </div>

                    {/* Tablet (sm–lg): logo kiri sejajar teks, judul+deskripsi di tengah halaman */}
                    <div className="hidden sm:flex lg:hidden relative w-full items-center justify-center py-2">
                        <BrandLogo size="md" className="absolute left-0 top-1/2 -translate-y-1/2" />
                        <div className="text-center">
                            <h2 className="text-xl font-bold font-inter mb-1">Portal SSO Mandiri</h2>
                            <p className="text-white/70 text-xs font-inter leading-relaxed">
                                Satu identitas digital resmi untuk seluruh civitas akademika SMA UII.
                            </p>
                        </div>
                    </div>

                    {/* Desktop (lg+): panel kiri card, rata kiri */}
                    <div className="hidden lg:flex lg:flex-col lg:items-start lg:gap-5 text-left">
                        <BrandLogo size="md" />
                        <div>
                            <h2 className="text-2xl font-bold font-inter mb-2">Portal SSO Mandiri</h2>
                            <p className="text-white/70 text-sm font-inter leading-relaxed max-w-64">
                                Satu identitas digital resmi untuk seluruh civitas akademika SMA UII.
                            </p>
                        </div>
                    </div>

                    {/* Kembali ke Beranda — desktop: pojok kiri bawah panel biru */}
                    <Link
                        href="/"
                        className="hidden lg:inline-flex items-center gap-2 text-[13px] text-white/80 font-inter hover:text-white transition-colors"
                    >
                        &larr; Kembali ke Beranda
                    </Link>
                </div>
            </div>

            {/* Form — bilah putih full-bleed di mobile/tablet, panel kanan di lg+ */}
            <div className="flex-1 bg-surface flex flex-col min-h-0">
                <div className="flex-1 flex flex-col justify-center px-5 py-6 sm:px-8 lg:px-10 overflow-y-auto">
                    <div className="w-full max-w-[340px] mx-auto">
                        <h1 className="text-center text-[20px] font-bold text-text-primary font-inter mb-1">
                            Sign In Institusi
                        </h1>
                        <p className="text-center text-[13px] text-text-muted font-inter mb-6">
                            Masuk untuk mengakses portal Anda
                        </p>

                        {error && (
                            <div className="bg-danger-bg text-danger px-4 py-2.5 rounded-lg text-[13px] font-inter mb-4 border border-danger/20">
                                {error}
                            </div>
                        )}

                        <form onSubmit={onSubmit} className="flex flex-col gap-4">
                            <Input
                                name="username"
                                label="Username / NISN"
                                placeholder="Masukkan username atau NISN"
                                icon="fa-user"
                                autoComplete="username"
                                autoFocus
                                required
                                value={data?.username ?? ""}
                                onChange={(e) => setData?.("username", e.target.value)}
                            />
                            <Input
                                name="password"
                                label="Password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Masukkan password"
                                icon="fa-lock"
                                autoComplete="current-password"
                                required
                                value={data?.password ?? ""}
                                onChange={(e) => setData?.("password", e.target.value)}
                                rightIcon={
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="text-text-muted hover:text-primary transition-colors cursor-pointer"
                                    >
                                        <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
                                    </button>
                                }
                            />
                            <label className="flex items-center gap-2 text-[13px] text-text-muted font-inter cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={data?.remember ?? false}
                                    onChange={(e) => setData?.("remember", e.target.checked)}
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

                        <p className="pt-5 text-center text-[12px] text-text-muted font-inter">
                            &copy; {new Date().getFullYear()} SMA UII Yogyakarta &mdash; Copyright Terpusat
                        </p>
                    </div>
                </div>

                {/* Kembali ke Beranda — mobile/tablet: pojok kiri bawah bilah putih */}
                <Link
                    href="/"
                    className="lg:hidden inline-flex items-center gap-2 px-5 py-3 text-[12px] text-text-muted font-inter hover:text-primary transition-colors"
                >
                    &larr; Kembali ke Beranda
                </Link>
            </div>
        </div>
    );
}
