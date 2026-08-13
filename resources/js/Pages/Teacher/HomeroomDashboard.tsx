import { Link } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";

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
    pendingLeaveCount = 0,
}: PageProps) {
    if (!kelas) {
        return (
            <AppShell title="Dashboard Wali Kelas">
                <div className="bg-surface border border-border rounded-xl p-12 text-center">
                    <i className="fas fa-chalkboard-teacher text-[40px] text-text-muted mb-4 block" />
                    <p className="text-text-muted text-[14px]">Anda belum ditugaskan sebagai wali kelas.</p>
                </div>
            </AppShell>
        );
    }

    // Split students: "perhatian khusus" = bukan hadir tepat waktu
    const attentionStudents = students.filter((s) => getRowStatus(s) !== "hadir");

    return (
        <AppShell title="Dashboard Wali Kelas">
            {/* ── Page header ─────────────────────────────────── */}
            <div className="flex items-start justify-between mb-6 flex-wrap gap-2">
                <div>
                    <h1 className="text-[22px] font-bold text-text-primary font-inter">
                        Dasbor Wali Kelas: {kelas.name}
                    </h1>
                    <p className="text-[13px] text-text-muted font-inter mt-1">
                        Pantau kehadiran harian anak didik Anda secara real-time.
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
            <section className="hidden lg:block bg-surface border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                    <h2 className="text-[15px] font-bold text-text-primary font-inter">Perhatian Khusus Hari Ini</h2>
                </div>
                {attentionStudents.length === 0 ? (
                    <div className="py-12 text-center text-text-muted text-[13px]">Semua siswa hadir tepat waktu ✓</div>
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
                            {attentionStudents.map((s) => {
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
            </section>

            {/* ── MOBILE: Summary card + card list ────────────── */}
            <div className="lg:hidden flex flex-col gap-4">
                {/* Summary card navy */}
                <div className="rounded-xl px-5 py-5" style={{ background: "#2E3391" }}>
                    <p className="text-white/70 text-[11px] font-inter">Ringkasan Hari Ini</p>
                    <p className="text-white text-[20px] font-bold font-inter mt-1">{todayFormatted()}</p>
                    <div className="flex gap-4 mt-3">
                        <div>
                            <p className="text-white/70 text-[10px] uppercase tracking-wide">Total Siswa</p>
                            <p className="text-white font-bold text-[16px]">{stats?.total ?? 0}</p>
                        </div>
                        <div>
                            <p className="text-white/70 text-[10px] uppercase tracking-wide">Hadir</p>
                            <p className="font-bold text-[16px]" style={{ color: "#10B981" }}>
                                {stats?.present ?? 0}
                            </p>
                        </div>
                        <div>
                            <p className="text-white/70 text-[10px] uppercase tracking-wide">Absen/Telat</p>
                            <p className="font-bold text-[16px]" style={{ color: "#F59E0B" }}>
                                {(stats?.late ?? 0) + (stats?.absent ?? 0)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Section title */}
                <p className="text-[14px] font-bold text-text-primary font-inter">Perhatian Khusus Hari Ini</p>

                {attentionStudents.length === 0 ? (
                    <p className="text-text-muted text-[13px] text-center py-6">Semua siswa hadir tepat waktu ✓</p>
                ) : (
                    attentionStudents.map((s) => {
                        const status = getRowStatus(s);
                        const badge = BADGE[status];
                        const note = rowNote(s);
                        // Border kiri warna per status
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
                                className="bg-white rounded-xl overflow-hidden"
                                style={{
                                    border: "1px solid #E2E8F0",
                                    borderLeft: `4px solid ${leftBorder[status]}`,
                                }}
                            >
                                <div className="px-4 pt-3 pb-2 flex items-start justify-between gap-2">
                                    <div>
                                        <p className="text-[14px] font-bold text-text-primary">{s.name}</p>
                                        <p className="text-[12px] text-text-muted mt-0.5">{note}</p>
                                    </div>
                                    <span
                                        className="text-[10px] font-bold px-2 py-1 rounded-full shrink-0 mt-0.5"
                                        style={{ background: badge.bg, color: badge.color }}
                                    >
                                        {badge.label}
                                    </span>
                                </div>
                                {status === "pending" && (
                                    <div className="px-4 pb-3">
                                        <Link
                                            href="/leave-requests/verification"
                                            className="w-full flex items-center justify-center py-2 rounded-lg text-[13px] font-bold text-white"
                                            style={{ background: "#2E3391" }}
                                        >
                                            Verifikasi Izin
                                        </Link>
                                    </div>
                                )}
                                {(status === "terlambat" || status === "diizinkan") && (
                                    <div className="px-4 pb-3">
                                        <button
                                            type="button"
                                            className="w-full flex items-center justify-center py-2 rounded-lg text-[13px] font-semibold border border-border text-text-primary"
                                        >
                                            Lihat Detail
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}

                {/* Quick link verifikasi jika ada pending */}
                {pendingLeaveCount > 0 && (
                    <Link
                        href="/leave-requests/verification"
                        className="flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-white"
                    >
                        <span className="text-[13px] font-semibold text-text-primary">Verifikasi Izin</span>
                        <span
                            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[11px] font-bold"
                            style={{ background: "#EF4444" }}
                        >
                            {pendingLeaveCount}
                        </span>
                    </Link>
                )}
            </div>
        </AppShell>
    );
}
