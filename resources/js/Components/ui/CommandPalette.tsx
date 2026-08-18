import { useEffect, useRef, useState, useMemo } from "react";
import { router, usePage } from "@inertiajs/react";
import { useLanguage } from "@/Contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiSearch,
    FiFileText,
    FiFolder,
    FiUser,
    FiClock,
    FiSliders,
    FiLogOut,
    FiGlobe,
    FiCornerDownLeft,
    FiMaximize2,
    FiSend,
} from "react-icons/fi";

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
}

interface CommandItem {
    id: string;
    title: string;
    description: string;
    category: string;
    icon: React.ComponentType<{ className?: string }>;
    action: () => void;
    roles?: string[];
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
    const { auth } = usePage().props as { auth?: { user?: { role?: string } } };
    const userRole = auth?.user?.role;
    const { setLanguage } = useLanguage();
    const [search, setSearch] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);

    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // List of all command palette actions
    const commands = useMemo<CommandItem[]>(() => {
        const list: CommandItem[] = [
            // Navigasi
            {
                id: "nav-dashboard",
                title:
                    userRole === "admin"
                        ? "Buka Dashboard Admin"
                        : userRole === "student"
                          ? "Buka Overview Siswa"
                          : userRole === "guardian"
                            ? "Buka Overview Wali Murid"
                            : "Buka Overview Guru",
                description:
                    userRole === "admin"
                        ? "Pusat kendali operasional dan analitik sekolah"
                        : "Kembali ke ringkasan beranda utama",
                category: "Navigasi Halaman",
                icon: FiSliders,
                action: () =>
                    router.visit(
                        userRole === "admin"
                            ? "/dashboard"
                            : userRole === "student"
                              ? "/student/dashboard"
                              : userRole === "guardian"
                                ? "/guardian"
                                : "/overview",
                    ),
            },
            {
                id: "nav-master-data",
                title: "Buka Manajemen Data Master",
                description: "Kelola Siswa, Guru, Wali Murid, dan Kelas",
                category: "Navigasi Halaman",
                icon: FiFolder,
                action: () => router.visit("/master-data"),
                roles: ["admin"],
            },
            {
                id: "nav-enrolment",
                title: "Buka Enrolment Kelas",
                description: "Atur penempatan kelas dan ajaran siswa",
                category: "Navigasi Halaman",
                icon: FiFolder,
                action: () => router.visit("/class-enrolment"),
                roles: ["admin"],
            },
            {
                id: "nav-settings",
                title: "Buka Atur Waktu & Hari Libur",
                description: "Konfigurasi jam absensi dan hari libur sekolah",
                category: "Navigasi Halaman",
                icon: FiClock,
                action: () => router.visit("/settings"),
                roles: ["admin"],
            },
            {
                id: "nav-export",
                title: "Buka Laporan Rekapitulasi",
                description: "Unduh laporan kehadiran berkala (Excel/PDF)",
                category: "Navigasi Halaman",
                icon: FiFileText,
                action: () => router.visit("/export"),
                roles: ["admin"],
            },
            {
                id: "nav-notifications",
                title: "Buka Bilah Notifikasi",
                description: "Buka dan baca pengumuman sekolah",
                category: "Navigasi Halaman",
                icon: FiSend,
                action: () => router.visit("/notifications"),
            },
            {
                id: "nav-profile",
                title: "Buka Profil Saya",
                description: "Atur informasi akun dan setelan keamanan",
                category: "Navigasi Halaman",
                icon: FiUser,
                action: () => router.visit("/profile"),
            },
            // Preferensi Bahasa
            {
                id: "lang-id",
                title: "Ubah Bahasa ke Indonesia (ID)",
                description: "Ganti bahasa antarmuka ke Bahasa Indonesia",
                category: "Bahasa & Preferensi",
                icon: FiGlobe,
                action: () => setLanguage("id"),
            },
            {
                id: "lang-en",
                title: "Change Language to English (EN)",
                description: "Switch interface language to English",
                category: "Bahasa & Preferensi",
                icon: FiGlobe,
                action: () => setLanguage("en"),
            },
            // Pintasan Admin Cepat
            {
                id: "action-add-student",
                title: "Pintasan: Tambah Siswa Baru",
                description: "Tambah entitas siswa ke Data Master",
                category: "Aksi Cepat Admin",
                icon: FiUser,
                action: () => router.visit("/master-data?tab=students"),
                roles: ["admin"],
            },
            {
                id: "action-add-class",
                title: "Pintasan: Tambah Kelas Baru",
                description: "Tambah entitas kelas ke Data Master",
                category: "Aksi Cepat Admin",
                icon: FiFolder,
                action: () => router.visit("/master-data?tab=class"),
                roles: ["admin"],
            },
            {
                id: "action-add-holiday",
                title: "Pintasan: Buat Hari Libur Baru",
                description: "Buat kalender libur akademik",
                category: "Aksi Cepat Admin",
                icon: FiClock,
                action: () => router.visit("/settings"),
                roles: ["admin"],
            },
            {
                id: "action-send-notif",
                title: "Pintasan: Kirim Notifikasi Pengumuman",
                description: "Kirim pengumuman massal sekolah",
                category: "Aksi Cepat Admin",
                icon: FiSend,
                action: () => router.visit("/notifications"),
                roles: ["admin"],
            },
            // Autentikasi
            {
                id: "auth-logout",
                title: "Keluar Akun (Logout)",
                description: "Akhiri sesi dan keluar dari sistem",
                category: "Sesi Pengguna",
                icon: FiLogOut,
                action: () => router.post("/logout"),
            },
        ];

        // Filter based on user roles
        return list.filter((cmd) => {
            if (!cmd.roles) return true;
            return userRole ? cmd.roles.includes(userRole) : false;
        });
    }, [userRole, setLanguage]);

    // Filter by search query
    const filteredCommands = useMemo(() => {
        if (!search) return commands;
        const query = search.toLowerCase();
        return commands.filter(
            (cmd) =>
                cmd.title.toLowerCase().includes(query) ||
                cmd.description.toLowerCase().includes(query) ||
                cmd.category.toLowerCase().includes(query),
        );
    }, [commands, search]);

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    // Keyboard handlers
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    setActiveIndex((prev) => (prev + 1) % filteredCommands.length);
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setActiveIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
                    break;
                case "Enter":
                    e.preventDefault();
                    if (filteredCommands[activeIndex]) {
                        filteredCommands[activeIndex].action();
                        onClose();
                    }
                    break;
                case "Escape":
                    e.preventDefault();
                    onClose();
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, activeIndex, filteredCommands, onClose]);

    // Scroll highlighted item into view
    useEffect(() => {
        if (listRef.current) {
            const activeElement = listRef.current.children[activeIndex] as HTMLElement;
            activeElement?.scrollIntoView({ block: "nearest" });
        }
    }, [activeIndex]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4">
                {/* Backdrop overlay */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-neutral-950/40 backdrop-blur-xs"
                />

                {/* Command Bar Modal Box */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="relative bg-surface border border-border w-full max-w-2xl rounded-2xl shadow-modal overflow-hidden flex flex-col max-h-[50vh]"
                >
                    {/* Search Field */}
                    <div className="flex items-center px-4 border-b border-border py-3">
                        <FiSearch className="text-text-inactive w-5 h-5 mr-3 shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setActiveIndex(0);
                            }}
                            placeholder="Ketik perintah atau navigasi halaman... (Ctrl + K)"
                            className="w-full bg-transparent border-0 text-[14px] text-text-primary placeholder:text-text-inactive focus:outline-none focus:ring-0 font-inter"
                        />
                        <span className="text-[10px] bg-muted text-text-inactive px-2 py-0.5 rounded-md font-bold uppercase font-inter shrink-0 ml-2 select-none">
                            ESC
                        </span>
                    </div>

                    {/* Commands List */}
                    <div
                        ref={listRef}
                        className="flex-1 overflow-y-auto py-2 divide-y divide-border/20 max-h-[350px] scrollbar-thin"
                    >
                        {filteredCommands.length === 0 ? (
                            <div className="px-5 py-8 text-center text-text-inactive text-[13px] font-inter">
                                Tidak ada hasil untuk &ldquo;{search}&rdquo;
                            </div>
                        ) : (
                            filteredCommands.map((cmd, idx) => {
                                const Icon = cmd.icon;
                                const isHighlighted = idx === activeIndex;

                                return (
                                    <div
                                        key={cmd.id}
                                        role="option"
                                        aria-selected={isHighlighted}
                                        tabIndex={-1}
                                        onClick={() => {
                                            cmd.action();
                                            onClose();
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                cmd.action();
                                                onClose();
                                            }
                                        }}
                                        className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors select-none ${
                                            isHighlighted
                                                ? "bg-primary/5 text-primary"
                                                : "text-text-primary hover:bg-muted/40"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3.5 min-w-0">
                                            <div
                                                className={`p-2 rounded-lg shrink-0 ${
                                                    isHighlighted
                                                        ? "bg-primary text-white"
                                                        : "bg-muted text-text-inactive"
                                                }`}
                                            >
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <h4
                                                    className={`text-[13.5px] font-inter truncate ${
                                                        isHighlighted
                                                            ? "font-semibold text-primary"
                                                            : "font-medium text-text-primary"
                                                    }`}
                                                >
                                                    {cmd.title}
                                                </h4>
                                                <p className="text-[11px] text-text-secondary truncate mt-0.5 font-inter">
                                                    {cmd.description}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] bg-muted text-text-inactive px-1.5 py-0.5 rounded font-bold uppercase font-inter select-none">
                                                {cmd.category}
                                            </span>
                                            {isHighlighted && <FiCornerDownLeft className="text-[11px] text-primary" />}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer Tips */}
                    <div className="bg-muted px-4 py-2 border-t border-border flex items-center justify-between text-[10px] text-text-inactive font-medium font-inter select-none">
                        <div className="flex items-center gap-3">
                            <span>⇅ Navigasi</span>
                            <span>↵ Jalankan</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <FiMaximize2 className="text-[10px]" />
                            <span>Aksi Cepat Pintar SMA UII</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
