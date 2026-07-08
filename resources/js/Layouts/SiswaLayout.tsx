import type { ReactNode } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import ErrorBoundary from "@/Components/ErrorBoundary";
import Toast from "@/Components/Toast";

interface SiswaLayoutProps {
    title?: string;
    children: ReactNode;
    username?: string;
    studentClass?: string;
}

const menuItems = [
    { label: "Dashboard", icon: "fa-home", href: "/siswa/dashboard" },
    { label: "Live Presensi", icon: "fa-camera", href: "/siswa/live-presensi" },
    { label: "Riwayat", icon: "fa-history", href: "/siswa/riwayat" },
];

export default function SiswaLayout({
    title,
    children,
    username = "Ahmad Reza Pahlevi",
    studentClass = "X-A",
}: SiswaLayoutProps) {
    const { url } = usePage();

    return (
        <>
            {title && <Head title={title} />}

            <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8F9FB]">
                <Toast />

                {/* ── Mobile Header ── */}
                <header className="lg:hidden bg-primary text-white px-4 py-3 flex items-center justify-between z-50 fixed top-0 left-0 right-0 h-[60px]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-primary font-bold text-[12px]">
                            UII
                        </div>
                        <h1 className="text-[14px] font-bold">SMA UII</h1>
                    </div>
                </header>
                <div className="lg:hidden h-[60px]" />

                {/* ── Desktop Sidebar ── */}
                <aside className="hidden lg:flex w-[260px] bg-primary flex-col py-6 shrink-0 z-10">
                    {/* Brand */}
                    <div className="flex items-center gap-3 px-6 mb-10">
                        <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-primary font-bold text-[13px] shrink-0">
                            UII
                        </div>
                        <span className="text-white font-bold text-[14.px] tracking-wide leading-tight">
                            SMA UII YOGYAKARTA
                        </span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex flex-col gap-1 px-4 flex-1">
                        {menuItems.map((item) => {
                            const isActive = url.startsWith(item.href);
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-inter text-[14px] transition-all ${
                                        isActive
                                            ? "bg-accent text-primary font-bold"
                                            : "text-white/70 hover:bg-white/10 hover:text-white"
                                    }`}
                                >
                                    <i className={`fas ${item.icon} w-5 text-center`} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* ── Main Content Area ── */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Desktop Navbar */}
                    <header className="hidden lg:flex h-[72px] bg-primary items-center justify-end px-8 shrink-0 relative">
                        {/* We use a negative margin trick or absolute positioning if we wanted a seamless corner, 
                            but based on Figma, the sidebar and navbar are both flat bg-primary. */}
                        <div className="absolute inset-y-0 left-0 w-4 bg-primary" /> {/* Seamless cover */}
                        <span className="text-white/80 text-[13px] font-inter">
                            Halo, {username} {studentClass && `(${studentClass})`}
                        </span>
                    </header>

                    {/* Content */}
                    <main className="flex-1 overflow-auto p-4 lg:p-10">
                        <ErrorBoundary>{children}</ErrorBoundary>
                    </main>
                </div>

                {/* ── Mobile Bottom Nav ── */}
                <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex justify-around py-3 z-30">
                    {menuItems.map((item) => {
                        const isActive = url.startsWith(item.href);
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex flex-col items-center gap-1 transition-colors ${
                                    isActive
                                        ? "text-primary"
                                        : "text-text-inactive hover:text-primary"
                                }`}
                            >
                                <i className={`fas ${item.icon} text-[18px]`} />
                                <span className="text-[10px] font-inter">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </>
    );
}
