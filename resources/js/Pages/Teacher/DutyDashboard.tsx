import { useState } from "react";
import { router } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";

interface Teacher {
    id: number;
    name: string;
}

interface ClassStat {
    class_id: number;
    class: string;
    total: number;
    present: number;
    late: number;
    absent: number;
    sick_permission: number;
}

interface AttentionStudent {
    id: number;
    nis: string;
    name: string;
    class: string;
    status: "alpa" | "terlambat" | "pending" | "diizinkan";
    check_in_time: string | null;
    leave_category: string | null;
    leave_approval: string | null;
}

interface PageProps {
    teacher: Teacher;
    isScheduled: boolean;
    today: string;
    classStats: ClassStat[];
    attentionStudents?: AttentionStudent[];
    classes?: { id: number; name: string }[];
    selectedClassId?: number | null;
    selectedDate?: string;
    totals?: {
        total: number;
        present: number;
        late: number;
        sick_permission: number;
        absent: number;
    };
}

type MobileTab = "anomali" | "izin";

type RowStatus = "alpa" | "terlambat" | "pending" | "diizinkan";

const BADGE: Record<RowStatus, { label: string; bg: string; color: string }> = {
    alpa:      { label: "ALPA",         bg: "#FFE4E6", color: "#EF4444" },
    terlambat: { label: "TERLAMBAT",    bg: "#FEF3C7", color: "#F59E0B" },
    pending:   { label: "PENDING IZIN", bg: "#E0E7FF", color: "#2E3391" },
    diizinkan: { label: "DIIZINKAN",    bg: "#DCFCE7", color: "#10B981" },
};

const LEFT_BORDER: Record<RowStatus, string> = {
    alpa: "#EF4444", terlambat: "#F59E0B", pending: "#2E3391", diizinkan: "#10B981",
};

function rowNote(s: AttentionStudent): string {
    if (s.status === "alpa") return "Belum ada kabar";
    if (s.status === "terlambat") return s.check_in_time ? `${s.check_in_time} WIB` : "-";
    if (s.status === "pending") return `Pengajuan Izin ${s.leave_category ?? ""}`;
    return "Pengajuan Izin Diterima";
}

export default function DutyDashboard({
    isScheduled: _isScheduled,
    today,
    classStats,
    attentionStudents = [],
    classes = [],
    selectedClassId = null,
    selectedDate,
    totals,
}: PageProps) {
    const [classVal, setClassVal] = useState(selectedClassId?.toString() ?? "");
    const [dateVal, setDateVal] = useState(selectedDate ?? new Date().toISOString().split("T")[0]);
    const [mobileTab, setMobileTab] = useState<MobileTab>("anomali");

    const handleFilter = () => {
        router.get(
            "/teacher/duty",
            { class_id: classVal || undefined, date: dateVal },
            { preserveState: true },
        );
    };

    // Derive totals from classStats if not provided by controller
    const summary = totals ?? classStats.reduce(
        (acc, c) => ({
            total:           acc.total + c.total,
            present:         acc.present + c.present,
            late:            acc.late + c.late,
            sick_permission: acc.sick_permission + c.sick_permission,
            absent:          acc.absent + c.absent,
        }),
        { total: 0, present: 0, late: 0, sick_permission: 0, absent: 0 },
    );

    const anomali   = attentionStudents.filter((s) => s.status === "alpa" || s.status === "terlambat");
    const izinList  = attentionStudents.filter((s) => s.status === "pending" || s.status === "diizinkan");

    // ── Shared table rows ───────────────────────────────────────────────────
    const renderTableRows = (rows: AttentionStudent[]) => (
        <>
            {rows.length === 0 ? (
                <tr>
                    <td colSpan={5} className="text-center text-text-muted text-[13px] py-10">
                        Tidak ada data.
                    </td>
                </tr>
            ) : (
                rows.map((s) => {
                    const badge = BADGE[s.status];
                    const note  = rowNote(s);
                    return (
                        <tr key={s.id} className="border-b border-border last:border-b-0 hover:bg-background transition-colors">
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
                            <td className="px-4 py-3 text-[13px]"
                                style={{ color: s.status === "terlambat" ? "#F59E0B" : "#64748B" }}>
                                {note}
                            </td>
                            <td className="px-4 py-3">
                                <button
                                    type="button"
                                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-[12px] font-semibold border border-border text-text-primary hover:bg-background transition-colors"
                                >
                                    Lihat Detail
                                </button>
                            </td>
                        </tr>
                    );
                })
            )}
        </>
    );

    return (
        <AppShell title="Dashboard Guru Piket">

            {/* ── DESKTOP ──────────────────────────────────────── */}
            <div className="hidden lg:block">

                {/* Monitoring Live card */}
                <div className="bg-surface border border-border rounded-xl p-5 mb-5">
                    {/* Header row: title + filters */}
                    <div className="flex items-center gap-4 flex-wrap mb-5">
                        <h1 className="text-[20px] font-bold text-text-primary font-inter mr-auto">
                            Monitoring Live
                        </h1>
                        {/* Filter Kelas */}
                        <div className="flex items-center gap-2">
                            <span className="text-[13px] text-text-muted font-inter shrink-0">
                                Filter Kelas:
                            </span>
                            <select
                                value={classVal}
                                onChange={(e) => { setClassVal(e.target.value); handleFilter(); }}
                                className="border border-border rounded-lg px-3 py-1.5 text-[13px] text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[140px]"
                            >
                                <option value="">Semua Kelas</option>
                                {classes.map((c) => (
                                    <option key={c.id} value={c.id.toString()}>{c.name}</option>
                                ))}
                                {/* fallback from classStats */}
                                {classes.length === 0 && classStats.map((c) => (
                                    <option key={c.class_id} value={c.class_id.toString()}>{c.class}</option>
                                ))}
                            </select>
                        </div>
                        {/* Filter Tanggal */}
                        <div className="flex items-center gap-2">
                            <i className="fas fa-calendar-alt text-text-muted text-[13px]" />
                            <input
                                type="date"
                                value={dateVal}
                                onChange={(e) => { setDateVal(e.target.value); }}
                                onBlur={handleFilter}
                                className="border border-border rounded-lg px-3 py-1.5 text-[13px] text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </div>

                    {/* 5 Stat cards */}
                    <div className="grid grid-cols-5 gap-3 mb-5">
                        {[
                            { label: "TOTAL SISWA",   value: summary.total,           border: "#E2E8F0", color: "#1E293B" },
                            { label: "HADIR TERDATA", value: summary.present,         border: "#10B981", color: "#10B981" },
                            { label: "TERLAMBAT",     value: summary.late,            border: "#F59E0B", color: "#F59E0B" },
                            { label: "SAKIT / IZIN",  value: summary.sick_permission, border: "#2E3391", color: "#2E3391" },
                            { label: "ALPA (KOSONG)", value: summary.absent,          border: "#EF4444", color: "#EF4444" },
                        ].map(({ label, value, border, color }) => (
                            <div
                                key={label}
                                className="bg-surface rounded-xl p-4 flex flex-col gap-1"
                                style={{ border: `1px solid ${border}` }}
                            >
                                <span className="text-[26px] font-bold leading-none" style={{ color }}>
                                    {value}
                                </span>
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide">
                                    {label}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Tabel */}
                    <div className="border border-border rounded-xl overflow-hidden">
                        <div className="px-5 py-3 border-b border-border">
                            <h2 className="text-[14px] font-bold text-text-primary font-inter">
                                Perhatian Khusus Hari Ini
                            </h2>
                        </div>
                        <table className="w-full border-collapse font-inter">
                            <thead>
                                <tr className="bg-background border-b border-border">
                                    {["NISN", "Nama Siswa", "Status Hari Ini", "Waktu / Keterangan", "Tindakan"].map((h) => (
                                        <th key={h} className="px-4 py-3 text-left text-[12px] font-semibold text-text-muted uppercase tracking-wide">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {renderTableRows(attentionStudents)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── MOBILE ───────────────────────────────────────── */}
            <div className="lg:hidden flex flex-col gap-4">
                {/* Filter row */}
                <div className="flex gap-2">
                    <select
                        value={classVal}
                        onChange={(e) => { setClassVal(e.target.value); handleFilter(); }}
                        className="flex-1 border border-border rounded-lg px-3 py-2 text-[13px] bg-surface focus:outline-none"
                    >
                        <option value="">Semua Kelas</option>
                        {classes.map((c) => (
                            <option key={c.id} value={c.id.toString()}>{c.name}</option>
                        ))}
                        {classes.length === 0 && classStats.map((c) => (
                            <option key={c.class_id} value={c.class_id.toString()}>{c.class}</option>
                        ))}
                    </select>
                    <input
                        type="date"
                        value={dateVal}
                        onChange={(e) => { setDateVal(e.target.value); }}
                        onBlur={handleFilter}
                        className="border border-border rounded-lg px-3 py-2 text-[13px] bg-surface focus:outline-none"
                    />
                </div>

                {/* Mobile tabs */}
                <div className="flex border-b border-border">
                    {(["anomali", "izin"] as MobileTab[]).map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setMobileTab(tab)}
                            className="flex-1 py-2.5 text-[13px] font-bold transition-colors"
                            style={{
                                color: mobileTab === tab ? "#2E3391" : "#94A3B8",
                                borderBottom: mobileTab === tab ? "2px solid #FAE62A" : "2px solid transparent",
                            }}
                        >
                            {tab === "anomali" ? "ANOMALI ABSEN" : "DATA IZIN"}
                        </button>
                    ))}
                </div>

                {/* 4 mini stat pills */}
                <div className="grid grid-cols-4 gap-2">
                    {[
                        { label: "TOTAL", value: summary.total,   color: "#1E293B" },
                        { label: "HADIR", value: summary.present, color: "#10B981" },
                        { label: "TELAT", value: summary.late,    color: "#F59E0B" },
                        { label: "ALPA",  value: summary.absent,  color: "#EF4444" },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="bg-white border border-border rounded-lg p-2 flex flex-col items-center gap-0.5">
                            <span className="text-[16px] font-bold" style={{ color }}>{value}</span>
                            <span className="text-[9px] font-bold text-text-muted uppercase">{label}</span>
                        </div>
                    ))}
                </div>

                {/* Tab content */}
                {mobileTab === "anomali" ? (
                    <div className="flex flex-col gap-3">
                        {anomali.length === 0 ? (
                            <p className="text-center text-text-muted text-[13px] py-6">
                                Tidak ada anomali absensi.
                            </p>
                        ) : (
                            anomali.map((s) => {
                                const badge = BADGE[s.status];
                                return (
                                    <div
                                        key={s.id}
                                        className="bg-white rounded-xl overflow-hidden"
                                        style={{
                                            border: "1px solid #E2E8F0",
                                            borderLeft: `4px solid ${LEFT_BORDER[s.status]}`,
                                        }}
                                    >
                                        <div className="px-4 py-3 flex items-start justify-between gap-2">
                                            <div>
                                                <p className="text-[14px] font-bold text-text-primary">{s.name}</p>
                                                <p className="text-[12px] text-text-muted mt-0.5">{rowNote(s)}</p>
                                            </div>
                                            <span
                                                className="text-[10px] font-bold px-2 py-1 rounded-full shrink-0"
                                                style={{ background: badge.bg, color: badge.color }}
                                            >
                                                {badge.label}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {izinList.length === 0 ? (
                            <p className="text-center text-text-muted text-[13px] py-6">
                                Tidak ada data izin.
                            </p>
                        ) : (
                            izinList.map((s) => {
                                const badge = BADGE[s.status];
                                return (
                                    <div
                                        key={s.id}
                                        className="bg-white rounded-xl p-4"
                                        style={{ border: "1px solid #E2E8F0" }}
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div>
                                                <p className="text-[14px] font-bold text-text-primary">{s.name}</p>
                                                <p className="text-[12px] text-text-muted mt-0.5">
                                                    {s.leave_category} — {rowNote(s)}
                                                </p>
                                            </div>
                                            <span
                                                className="text-[10px] font-bold px-2 py-1 rounded-full shrink-0"
                                                style={{ background: badge.bg, color: badge.color }}
                                            >
                                                {badge.label}
                                            </span>
                                        </div>
                                        {s.status === "pending" && (
                                            <p className="text-[11px] text-danger flex items-center gap-1">
                                                <i className="fas fa-lock" />
                                                Hanya Wali Kelas yang dapat memverifikasi
                                            </p>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* Hint tanggal */}
                <p className="text-[12px] text-text-muted text-center mt-2">
                    {today}
                </p>
            </div>
        </AppShell>
    );
}
