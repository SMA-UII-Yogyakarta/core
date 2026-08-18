import { useState, useMemo } from "react";
import { Link } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";
import { Pagination, SearchBar } from "@/Components";

interface Teacher {
    id: number;
    name: string;
}

interface SchoolClass {
    id: number;
    name: string;
}

interface StudentAttendance {
    id: number;
    status: string;
    check_in_time: string | null;
}

interface LeaveInfo {
    id: number;
    category: string;
    approval_status: string;
    description: string | null;
    document_url: string | null;
}

interface Student {
    id: number;
    nis: string;
    name: string;
    attendances: StudentAttendance[];
    pendingLeave: LeaveInfo | null;
}

interface Stats {
    total: number;
    present: number;
    late: number;
    absent: number;
    pending_leave?: number;
}

interface PageProps {
    teacher: Teacher;
    class: SchoolClass | null;
    students: Student[];
    stats: Stats | null;
    pendingLeaveCount?: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function todayFormatted(): string {
    return new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

type RowStatus = "alpa" | "terlambat" | "pending" | "diizinkan" | "hadir";

function getRowStatus(s: Student): RowStatus {
    const att = s.attendances[0];
    if (s.pendingLeave?.approval_status === "Approved") return "diizinkan";
    if (s.pendingLeave?.approval_status === "Pending") return "pending";
    if (!att) return "alpa";
    if (att.status.toLowerCase() === "late") return "terlambat";
    return "hadir";
}

type BadgeDef = { label: string; bg: string; color: string };
const BADGE: Record<RowStatus, BadgeDef> = {
    alpa: { label: "ALPA", bg: "#FFE4E6", color: "#EF4444" },
    terlambat: { label: "TERLAMBAT", bg: "#FEF3C7", color: "#F59E0B" },
    pending: { label: "PENDING IZIN", bg: "#E0E7FF", color: "#2E3391" },
    diizinkan: { label: "DIIZINKAN", bg: "#DCFCE7", color: "#10B981" },
    hadir: { label: "HADIR", bg: "#DCFCE7", color: "#10B981" },
};

function rowNote(s: Student): string {
    const att = s.attendances[0];
    const status = getRowStatus(s);
    if (status === "alpa") return "Belum ada kabar";
    if (status === "terlambat") return att?.check_in_time ? `${att.check_in_time} WIB` : "-";
    if (status === "pending") return "Pengajuan Izin " + (s.pendingLeave?.category ?? "");
    if (status === "diizinkan") return "Pengajuan Izin Diterima";
    return att?.check_in_time ? `${att.check_in_time} WIB` : "-";
}

// ─────────────────────────────────────────────────────────────────────────────
export default function HomeroomDashboard({
    teacher: _teacher,
    class: kelas,
    students,
    stats,
    pendingLeaveCount: _pendingLeaveCount = 0,
}: PageProps) {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // Split students: "perhatian khusus" = bukan hadir tepat waktu
    const attentionStudents = useMemo(() => {
        const raw = students.filter((s) => getRowStatus(s) !== "hadir");
        if (!search.trim()) return raw;
        const q = search.toLowerCase();
        return raw.filter((s) => s.name.toLowerCase().includes(q) || s.nis.toLowerCase().includes(q));
    }, [students, search]);

    const totalPages = Math.ceil(attentionStudents.length / pageSize) || 1;
    const paginatedAttention = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return attentionStudents.slice(start, start + pageSize);
    }, [attentionStudents, currentPage, pageSize]);

    if (!kelas) {
        return (
            <AppShell title="Overview Wali Kelas">
                <div className="bg-surface border border-border rounded-xl p-12 text-center">
                    <i className="fas fa-chalkboard-teacher text-[40px] text-text-muted mb-4 block" />
                    <p className="text-text-muted text-[14px]">Anda belum ditugaskan sebagai wali kelas.</p>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell title="Overview Wali Kelas">
            {/* ── Page header ─────────────────────────────────── */}
            <div className="flex items-start justify-between mb-6 flex-wrap gap-2">
                <div>
                    <h1 className="text-[22px] font-bold text-text-primary font-inter">
                        Overview Wali Kelas: {kelas.name}
                    </h1>
                    <p className="text-[13px] text-text-muted font-inter mt-1">
                        Pantau kehadiran harian anak didik kelas Anda secara real-time.
                    </p>
                </div>
                <span
                    className="text-[13px] font-semibold px-3 py-1.5 rounded-lg shrink-0"
                    style={{ background: "#EFF6FF", color: "#2E3391" }}
                >
                    {todayFormatted()}
                </span>
            </div>

            {/* ── 4 Stat cards (colored borders) ──────────────── */}
            {stats && (
                <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                    {[
                        { label: "HADIR / TEPAT WAKTU", value: stats.present, border: "#10B981", color: "#10B981" },
                        { label: "TERLAMBAT", value: stats.late, border: "#F59E0B", color: "#F59E0B" },
                        { label: "SAKIT / IZIN", value: stats.pending_leave ?? 0, border: "#2E3391", color: "#2E3391" },
                        { label: "TANPA KETERANGAN", value: stats.absent, border: "#EF4444", color: "#EF4444" },
                    ].map(({ label, value, border, color }) => (
                        <div
                            key={label}
                            className="bg-surface rounded-xl p-5 flex flex-col gap-1"
                            style={{ border: `1px solid ${border}` }}
                        >
                            <span className="text-[28px] font-bold leading-none" style={{ color }}>
                                {value}
                            </span>
                            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wide">
                                {label}
                            </span>
                        </div>
                    ))}
                </section>
            )}

            {/* ── DESKTOP: Tabel Perhatian Khusus ─────────────── */}
            <section className="hidden lg:block bg-surface border border-border rounded-xl overflow-hidden shadow-card">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-[15px] font-bold text-text-primary font-inter">Perhatian Khusus Hari Ini</h2>
                        <span className="text-[12px] text-text-muted">
                            Menampilkan {paginatedAttention.length} dari {attentionStudents.length} siswa
                        </span>
                    </div>
                    <div className="w-64">
                        <SearchBar
                            value={search}
                            onChange={setSearch}
                            onSearch={() => setCurrentPage(1)}
                            placeholder="Cari nama / NIS..."
                        />
                    </div>
                </div>
                {paginatedAttention.length === 0 ? (
                    <div className="py-12 text-center text-text-muted text-[13px]">
                        {search ? "Tidak ditemukan siswa yang cocok dengan pencarian." : "Semua siswa hadir tepat waktu ✓"}
                    </div>
                ) : (
                    <table className="w-full border-collapse font-inter">
                        <thead>
                            <tr className="bg-background border-b border-border">
                                {["NISN", "Nama Siswa", "Status Hari Ini", "Waktu / Keterangan", "Tindakan"].map(
                                    (h) => (
                                        <th
                                            key={h}
                                            className="px-4 py-3 text-left text-[12px] font-semibold text-text-muted uppercase tracking-wide"
                                        >
                                            {h}
                                        </th>
                                    ),
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedAttention.map((s) => {
                                const status = getRowStatus(s);
                                const badge = BADGE[status];
                                const note = rowNote(s);
                                return (
                                    <tr
                                        key={s.id}
                                        className="border-b border-border last:border-b-0 hover:bg-background transition-colors"
                                    >
                                        <td className="px-4 py-3 text-[13px] font-bold text-text-primary">{s.nis}</td>
                                        <td className="px-4 py-3 text-[13px] text-text-primary">{s.name}</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                                                style={{ background: badge.bg, color: badge.color }}
                                            >
                                                {badge.label}
                                            </span>
                                        </td>
                                        <td
                                            className="px-4 py-3 text-[13px]"
                                            style={{ color: status === "terlambat" ? "#F59E0B" : "#64748B" }}
                                        >
                                            {note}
                                        </td>
                                        <td className="px-4 py-3">
                                            {status === "pending" ? (
                                                <Link
                                                    href="/leave-requests/verification"
                                                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-[12px] font-bold text-white"
                                                    style={{ background: "#2E3391" }}
                                                >
                                                    Verifikasi Izin
                                                </Link>
                                            ) : status === "alpa" ? (
                                                <span className="text-text-muted text-[13px]">-</span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-[12px] font-semibold border border-border text-text-primary hover:bg-background transition-colors"
                                                >
                                                    Lihat Detail
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}

                {attentionStudents.length > pageSize && (
                    <div className="p-4 border-t border-border bg-surface">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={attentionStudents.length}
                            perPage={pageSize}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </section>

            {/* ── MOBILE (lg:hidden) ──────────────────────────── */}
            {/* ── MOBILE (lg:hidden) — Figma: Mobile Wali Kelas Dashboard ──────────────────────────── */}
            <div className="lg:hidden flex flex-col gap-4 font-inter">
                {/* 1. Hero Summary Card (Figma: Ringkasan Hari Ini, Date, Total Siswa, Hadir, Absen/Telat) */}
                <div className="bg-primary text-white rounded-2xl p-5 shadow-card overflow-hidden">
                    <p className="text-white/80 text-[12px] font-medium">
                        Ringkasan Hari Ini
                    </p>
                    <h2 className="text-white text-[22px] font-bold mt-1">
                        {todayFormatted()}
                    </h2>

                    <div className="border-t border-white/20 my-3.5" />

                    <div className="flex items-center justify-between text-center">
                        <div>
                            <span className="text-white/70 text-[10px] uppercase font-bold tracking-wider block">
                                Total Siswa
                            </span>
                            <span className="text-[20px] font-bold text-white block mt-0.5">
                                {stats?.total ?? students.length}
                            </span>
                        </div>
                        <div>
                            <span className="text-white/70 text-[10px] uppercase font-bold tracking-wider block">
                                Hadir
                            </span>
                            <span className="text-[20px] font-bold text-emerald-400 block mt-0.5">
                                {stats?.present ?? 0}
                            </span>
                        </div>
                        <div>
                            <span className="text-white/70 text-[10px] uppercase font-bold tracking-wider block">
                                Absen/Telat
                            </span>
                            <span className="text-[20px] font-bold text-amber-400 block mt-0.5">
                                {(stats?.late ?? 0) + (stats?.absent ?? 0)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. Section: Perhatian Khusus Hari Ini */}
                <div>
                    <h3 className="text-[14px] font-bold text-text-primary mb-3">
                        Perhatian Khusus Hari Ini
                    </h3>

                    {attentionStudents.length === 0 ? (
                        <div className="bg-surface border border-border rounded-2xl p-6 text-center shadow-card">
                            <i className="fas fa-check-circle text-emerald-500 text-3xl mb-2" />
                            <p className="text-text-primary text-[14px] font-bold">
                                Semua Siswa Hadir Tepat Waktu
                            </p>
                            <p className="text-text-muted text-[12px] mt-0.5">
                                Tidak ada anomali atau izin tertunda hari ini.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {attentionStudents.map((s) => {
                                const status = getRowStatus(s);
                                const badge = BADGE[status];
                                const note = rowNote(s);
                                const leftBorder: Record<RowStatus, string> = {
                                    alpa: "#EF4444",
                                    terlambat: "#F59E0B",
                                    pending: "#2E3391",
                                    diizinkan: "#10B981",
                                    hadir: "#10B981",
                                };
                                return (
                                    <div
                                        key={s.id}
                                        className="bg-surface rounded-2xl p-4 border border-border/80 shadow-card flex flex-col gap-3"
                                        style={{ borderLeftWidth: "5px", borderLeftColor: leftBorder[status] }}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <h4 className="text-[14px] font-bold text-primary truncate">
                                                    {s.name}
                                                </h4>
                                                <p className="text-[12px] text-text-muted mt-0.5">
                                                    {note}
                                                </p>
                                            </div>
                                            <span
                                                className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0"
                                                style={{ background: badge.bg, color: badge.color }}
                                            >
                                                {badge.label}
                                            </span>
                                        </div>

                                        {/* Action Buttons matching Figma mockup */}
                                        {status === "pending" && (
                                            <Link
                                                href="/leave-requests/verification"
                                                className="w-full py-2.5 bg-primary text-white font-bold text-[13px] rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-all"
                                            >
                                                <span>Verifikasi Izin</span>
                                            </Link>
                                        )}

                                        {status === "terlambat" && (
                                            <button
                                                type="button"
                                                onClick={() => {}}
                                                className="w-full py-2 border-2 border-primary text-primary font-bold text-[13px] rounded-xl flex items-center justify-center gap-1.5 hover:bg-primary/5 active:scale-[0.98] transition-all"
                                            >
                                                <span>Lihat Detail</span>
                                            </button>
                                        )}

                                        {status === "diizinkan" && (
                                            <button
                                                type="button"
                                                onClick={() => {}}
                                                className="w-full py-2 border-2 border-emerald-600 text-emerald-600 font-bold text-[13px] rounded-xl flex items-center justify-center gap-1.5 hover:bg-emerald-50 active:scale-[0.98] transition-all"
                                            >
                                                <span>Lihat Detail</span>
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer Branding */}
                <p className="text-center text-[11px] text-text-muted/60 py-4 font-inter">
                    SMART Absen · SMA UII Yogyakarta
                </p>
            </div>
        </AppShell>
    );
}
