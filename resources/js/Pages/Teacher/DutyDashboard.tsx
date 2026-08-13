import { useState } from "react";
import { router } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";
import { Drawer, ActionButton } from "@/Components";
import { useInertiaPolling } from "@/hooks/useInertiaPolling";

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
    alpa: { label: "ALPA", bg: "#FFE4E6", color: "#EF4444" },
    terlambat: { label: "TERLAMBAT", bg: "#FEF3C7", color: "#F59E0B" },
    pending: { label: "PENDING IZIN", bg: "#E0E7FF", color: "#2E3391" },
    diizinkan: { label: "DIIZINKAN", bg: "#DCFCE7", color: "#10B981" },
};

const LEFT_BORDER: Record<RowStatus, string> = {
    alpa: "#EF4444",
    terlambat: "#F59E0B",
    pending: "#2E3391",
    diizinkan: "#10B981",
};

function rowNote(s: AttentionStudent): string {
    if (s.status === "alpa") return "Belum ada kabar";
    if (s.status === "terlambat") return s.check_in_time ? `${s.check_in_time} WIB` : "-";
    if (s.status === "pending") return `Pengajuan Izin ${s.leave_category ?? ""}`;
    return "Pengajuan Izin Diterima";
}

export default function DutyDashboard({
    isScheduled: _isScheduled,
    today: _today,
    classStats,
    attentionStudents = [],
    classes = [],
    selectedClassId = null,
    selectedDate,
    totals,
}: PageProps) {
    const [classVal, setClassVal] = useState(selectedClassId?.toString() ?? "");
    const [dateVal, setDateVal] = useState(selectedDate ?? new Date().toISOString().split("T")[0]);
    const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const initialMobileTab = (urlParams?.get("tab") as MobileTab) || "anomali";
    const [mobileTab, setMobileTab] = useState<MobileTab>(initialMobileTab);
    const [selectedStudent, setSelectedStudent] = useState<AttentionStudent | null>(null);

    // ── Live Polling ──────────────────────────────────────────────────────────
    const {
        enabled: isPolling,
        togglePolling,
        isRefreshing,
        lastUpdated,
        triggerRefresh,
    } = useInertiaPolling({
        only: ["classStats", "attentionStudents", "totals"],
        intervalMs: 10000,
    });

    const handleFilter = () => {
        router.get(
            "/teacher/duty",
            { class_id: classVal || undefined, date: dateVal, tab: mobileTab },
            { preserveState: true },
        );
    };

    // Derive totals from classStats if not provided by controller
    const summary =
        totals ??
        classStats.reduce(
            (acc, c) => ({
                total: acc.total + c.total,
                present: acc.present + c.present,
                late: acc.late + c.late,
                sick_permission: acc.sick_permission + c.sick_permission,
                absent: acc.absent + c.absent,
            }),
            { total: 0, present: 0, late: 0, sick_permission: 0, absent: 0 },
        );

    const anomali = attentionStudents.filter((s) => s.status === "alpa" || s.status === "terlambat");
    const izinList = attentionStudents.filter((s) => s.status === "pending" || s.status === "diizinkan");

    // ── Shared table rows ───────────────────────────────────────────────────
    const renderTableRows = (rows: AttentionStudent[]) => (
        <>
            {rows.length === 0 ? (
                <tr>
                    <td colSpan={5} className="text-center text-text-muted text-[13px] py-10">
                        Tidak ada data siswa untuk kriteria ini.
                    </td>
                </tr>
            ) : (
                rows.map((s) => {
                    const badge = BADGE[s.status];
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
                                style={{ color: s.status === "terlambat" ? "#F59E0B" : "#64748B" }}
                            >
                                {note}
                            </td>
                            <td className="px-4 py-3">
                                <ActionButton
                                    variant="detail"
                                    icon="fa-eye"
                                    label="Detail"
                                    onClick={() => setSelectedStudent(s)}
                                />
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
                    {/* Header row: title + live status + filters */}
                    <div className="flex items-center gap-4 flex-wrap mb-5">
                        <div className="flex items-center gap-3 mr-auto">
                            <h1 className="text-[20px] font-bold text-text-primary font-inter">Monitoring Live</h1>

                            {/* Live Badge & Manual Refresh */}
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={togglePolling}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                                        isPolling
                                            ? "bg-success/10 text-success border border-success/30"
                                            : "bg-muted text-text-muted border border-border"
                                    }`}
                                    title="Klik untuk menyalakan/mematikan pembaruan otomatis (10 detik)"
                                >
                                    <span
                                        className={`w-2 h-2 rounded-full ${
                                            isPolling ? "bg-success animate-pulse" : "bg-text-inactive"
                                        }`}
                                    />
                                    {isPolling ? "Live (10s)" : "Paused"}
                                </button>

                                <button
                                    type="button"
                                    onClick={triggerRefresh}
                                    disabled={isRefreshing}
                                    className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
                                    title={`Terakhir diperbarui: ${
                                        lastUpdated ? lastUpdated.toLocaleTimeString("id-ID") : "—"
                                    }`}
                                >
                                    <i
                                        className={`fas fa-sync-alt text-[12px] ${
                                            isRefreshing ? "fa-spin text-primary" : ""
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Filter Kelas */}
                        <div className="flex items-center gap-2">
                            <span className="text-[13px] text-text-muted font-inter shrink-0">Filter Kelas:</span>
                            <select
                                value={classVal}
                                onChange={(e) => {
                                    setClassVal(e.target.value);
                                    handleFilter();
                                }}
                                className="border border-border rounded-lg px-3 py-1.5 text-[13px] text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[140px]"
                            >
                                <option value="">Semua Kelas</option>
                                {classes.map((c) => (
                                    <option key={c.id} value={c.id.toString()}>
                                        {c.name}
                                    </option>
                                ))}
                                {classes.length === 0 &&
                                    classStats.map((c) => (
                                        <option key={c.class_id} value={c.class_id.toString()}>
                                            {c.class}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {/* Filter Tanggal */}
                        <div className="flex items-center gap-2">
                            <i className="fas fa-calendar-alt text-text-muted text-[13px]" />
                            <input
                                type="date"
                                value={dateVal}
                                onChange={(e) => {
                                    setDateVal(e.target.value);
                                }}
                                onBlur={handleFilter}
                                className="border border-border rounded-lg px-3 py-1.5 text-[13px] text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </div>

                    {/* 5 Stat cards */}
                    <div className="grid grid-cols-5 gap-3 mb-5">
                        {[
                            { label: "TOTAL SISWA", value: summary.total, border: "#E2E8F0", color: "#1E293B" },
                            { label: "HADIR TERDATA", value: summary.present, border: "#10B981", color: "#10B981" },
                            { label: "TERLAMBAT", value: summary.late, border: "#F59E0B", color: "#F59E0B" },
                            {
                                label: "SAKIT / IZIN",
                                value: summary.sick_permission,
                                border: "#2E3391",
                                color: "#2E3391",
                            },
                            { label: "ALPA (KOSONG)", value: summary.absent, border: "#EF4444", color: "#EF4444" },
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
                        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                            <h2 className="text-[14px] font-bold text-text-primary font-inter">
                                Perhatian Khusus Hari Ini
                            </h2>
                            <span className="text-[11px] text-text-muted font-medium">
                                Total {attentionStudents.length} siswa terpantau
                            </span>
                        </div>
                        <table className="w-full border-collapse font-inter">
                            <thead>
                                <tr className="bg-background border-b border-border">
                                    {["NISN", "Nama Siswa", "Status Hari Ini", "Waktu / Keterangan", "Aksi"].map(
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
                            <tbody>{renderTableRows(attentionStudents)}</tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── MOBILE ───────────────────────────────────────── */}
            <div className="block lg:hidden">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-[20px] font-bold text-text-primary font-inter">Guru Piket</h1>
                    <button
                        type="button"
                        onClick={togglePolling}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isPolling ? "bg-success/10 text-success" : "bg-muted text-text-muted"
                        }`}
                    >
                        <span
                            className={`w-1.5 h-1.5 rounded-full ${
                                isPolling ? "bg-success animate-pulse" : "bg-text-inactive"
                            }`}
                        />
                        {isPolling ? "Live 10s" : "Paused"}
                    </button>
                </div>

                {/* 5 mini stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-surface border border-border rounded-xl p-3 text-center">
                        <span className="text-[22px] font-bold text-primary block">{summary.total}</span>
                        <span className="text-[10px] font-bold text-text-muted uppercase">Total</span>
                    </div>
                    <div className="bg-surface border border-[#10B981] rounded-xl p-3 text-center">
                        <span className="text-[22px] font-bold text-[#10B981] block">{summary.present}</span>
                        <span className="text-[10px] font-bold text-text-muted uppercase">Hadir</span>
                    </div>
                    <div className="bg-surface border border-[#F59E0B] rounded-xl p-3 text-center">
                        <span className="text-[22px] font-bold text-[#F59E0B] block">{summary.late}</span>
                        <span className="text-[10px] font-bold text-text-muted uppercase">Telat</span>
                    </div>
                </div>

                {/* Tab selector */}
                <div className="flex bg-muted p-1 rounded-xl mb-4 select-none">
                    <button
                        type="button"
                        onClick={() => setMobileTab("anomali")}
                        className={`flex-1 py-2 rounded-lg text-[13px] font-bold transition-colors ${
                            mobileTab === "anomali" ? "bg-surface text-primary shadow-sm" : "text-text-muted"
                        }`}
                    >
                        Anomali ({anomali.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setMobileTab("izin")}
                        className={`flex-1 py-2 rounded-lg text-[13px] font-bold transition-colors ${
                            mobileTab === "izin" ? "bg-surface text-primary shadow-sm" : "text-text-muted"
                        }`}
                    >
                        Izin ({izinList.length})
                    </button>
                </div>

                {/* Card list */}
                <div className="space-y-3">
                    {(mobileTab === "anomali" ? anomali : izinList).map((s) => {
                        const badge = BADGE[s.status];
                        return (
                            <div
                                key={s.id}
                                className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between"
                                style={{ borderLeftWidth: "4px", borderLeftColor: LEFT_BORDER[s.status] }}
                                onClick={() => setSelectedStudent(s)}
                            >
                                <div>
                                    <h2 className="text-[14px] font-bold text-text-primary">{s.name}</h2>
                                    <p className="text-[12px] text-text-muted mt-0.5">
                                        {s.nis} • {s.class}
                                    </p>
                                    <p className="text-[11px] text-text-secondary mt-1">{rowNote(s)}</p>
                                </div>
                                <span
                                    className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0"
                                    style={{ background: badge.bg, color: badge.color }}
                                >
                                    {badge.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Student Detail Drawer */}
            <Drawer
                open={selectedStudent !== null}
                onClose={() => setSelectedStudent(null)}
                title="Detail Status Kehadiran Siswa"
                width="md"
            >
                {selectedStudent && (
                    <div className="space-y-4 text-text-primary text-[14px]">
                        <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl">
                            <div>
                                <span className="text-[11px] font-bold text-text-inactive uppercase tracking-wider block">
                                    Status Hari Ini
                                </span>
                                <span className="font-bold text-[15px]">{BADGE[selectedStudent.status].label}</span>
                            </div>
                            <span
                                className="text-[11px] font-bold px-3 py-1 rounded-full"
                                style={{
                                    background: BADGE[selectedStudent.status].bg,
                                    color: BADGE[selectedStudent.status].color,
                                }}
                            >
                                {BADGE[selectedStudent.status].label}
                            </span>
                        </div>

                        <div className="border border-border/80 rounded-xl p-4 space-y-2">
                            <h3 className="font-bold text-primary text-[13px] uppercase tracking-wide">
                                Informasi Siswa
                            </h3>
                            <div className="grid grid-cols-2 gap-3 text-[13px]">
                                <div>
                                    <span className="text-text-muted block text-[11px]">Nama Lengkap</span>
                                    <span className="font-semibold">{selectedStudent.name}</span>
                                </div>
                                <div>
                                    <span className="text-text-muted block text-[11px]">NIS</span>
                                    <span className="font-semibold">{selectedStudent.nis}</span>
                                </div>
                                <div>
                                    <span className="text-text-muted block text-[11px]">Kelas</span>
                                    <span className="font-semibold">{selectedStudent.class}</span>
                                </div>
                                <div>
                                    <span className="text-text-muted block text-[11px]">Jam Masuk</span>
                                    <span className="font-semibold">{selectedStudent.check_in_time ?? "—"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="border border-border/80 rounded-xl p-4 space-y-2">
                            <h3 className="font-bold text-primary text-[13px] uppercase tracking-wide">
                                Catatan Piket
                            </h3>
                            <p className="text-[13px] text-text-secondary">{rowNote(selectedStudent)}</p>
                        </div>
                    </div>
                )}
            </Drawer>
        </AppShell>
    );
}
