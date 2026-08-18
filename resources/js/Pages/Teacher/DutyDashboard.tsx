import { useState, useMemo } from "react";
import { router, Link } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";
import { Drawer, ActionButton, Pagination, SearchBar } from "@/Components";
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
    teacher: _teacher,
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

    // Desktop search & pagination
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const filteredAttention = useMemo(() => {
        if (!search.trim()) return attentionStudents;
        const q = search.toLowerCase();
        return attentionStudents.filter(
            (s) =>
                s.name.toLowerCase().includes(q) ||
                s.nis.toLowerCase().includes(q) ||
                s.class.toLowerCase().includes(q),
        );
    }, [attentionStudents, search]);

    const totalPages = Math.ceil(filteredAttention.length / pageSize) || 1;
    const safePage = Math.min(Math.max(1, currentPage), totalPages);
    const paginatedAttention = useMemo(() => {
        const start = (safePage - 1) * pageSize;
        return filteredAttention.slice(start, start + pageSize);
    }, [filteredAttention, safePage, pageSize]);

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

    const handleClassChange = (newClass: string) => {
        setClassVal(newClass);
        router.get(
            "/teacher/duty",
            { class_id: newClass || undefined, date: dateVal, tab: mobileTab },
            { preserveState: true },
        );
    };

    const handleDateChange = (newDate: string) => {
        setDateVal(newDate);
        router.get(
            "/teacher/duty",
            { class_id: classVal || undefined, date: newDate, tab: mobileTab },
            { preserveState: true },
        );
    };

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
        <AppShell title="Overview Guru Piket">
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
                                className="h-10 border border-border rounded-lg px-3 text-[13px] text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[140px]"
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
                                className="h-10 border border-border rounded-lg px-3 text-[13px] text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                        <div className="px-5 py-3 border-b border-border flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-[14px] font-bold text-text-primary font-inter">
                                    Perhatian Khusus Hari Ini
                                </h2>
                                <span className="text-[11px] text-text-muted font-medium">
                                    Menampilkan {paginatedAttention.length} dari {filteredAttention.length} siswa terpantau
                                </span>
                            </div>
                            <div className="w-56">
                                <SearchBar
                                    value={search}
                                    onChange={(val) => {
                                        setSearch(val);
                                        setCurrentPage(1);
                                    }}
                                    onSearch={() => setCurrentPage(1)}
                                    placeholder="Cari nama / NIS / kelas..."
                                />
                            </div>
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
                            <tbody>{renderTableRows(paginatedAttention)}</tbody>
                        </table>

                        {filteredAttention.length > pageSize && (
                            <div className="p-3 border-t border-border bg-surface">
                                <Pagination
                                    currentPage={safePage}
                                    totalPages={totalPages}
                                    totalItems={filteredAttention.length}
                                    perPage={pageSize}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── MOBILE (lg:hidden) — Figma: Mobile Guru Kelas Guru Piket ──────────────────────────── */}
            <div className="block lg:hidden flex flex-col gap-4 font-inter">
                {/* 1. Filter Bar 2 Kolom (Figma: Class Selector & Date Picker) */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                        <select
                            value={classVal}
                            onChange={(e) => handleClassChange(e.target.value)}
                            className="w-full h-11 appearance-none rounded-xl px-3.5 text-[13px] font-bold text-primary bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 pr-8 cursor-pointer shadow-xs"
                        >
                            <option value="">Semua Kelas</option>
                            {classes.map((c) => (
                                <option key={c.id} value={c.id.toString()}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-primary text-[12px]">
                            <i className="fas fa-chevron-down" />
                        </div>
                    </div>

                    <div className="relative">
                        <input
                            type="date"
                            value={dateVal}
                            onChange={(e) => handleDateChange(e.target.value)}
                            className="w-full h-11 rounded-xl px-3.5 text-[13px] font-bold text-primary bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-xs"
                        />
                    </div>
                </div>

                {/* 2. Tab Switcher with Yellow Gold Underline (Figma: ANOMALI ABSEN / DATA IZIN) */}
                <div className="flex border-b border-border bg-surface rounded-t-xl overflow-hidden shadow-xs">
                    <button
                        type="button"
                        onClick={() => setMobileTab("anomali")}
                        className={`flex-1 py-3 text-[13px] font-extrabold transition-all text-center cursor-pointer border-b-2 ${
                            mobileTab === "anomali"
                                ? "border-accent text-primary bg-accent/5"
                                : "border-transparent text-text-muted hover:text-text-primary"
                        }`}
                    >
                        ANOMALI ABSEN
                    </button>
                    <button
                        type="button"
                        onClick={() => setMobileTab("izin")}
                        className={`flex-1 py-3 text-[13px] font-bold transition-all text-center cursor-pointer border-b-2 flex items-center justify-center gap-1.5 ${
                            mobileTab === "izin"
                                ? "border-accent text-primary bg-accent/5"
                                : "border-transparent text-text-muted hover:text-text-primary"
                        }`}
                    >
                        <span>DATA IZIN</span>
                        <i className="fas fa-lock text-[11px] text-text-muted" />
                    </button>
                </div>

                {/* 3. 4 Metric Cards in a Row (Figma: TOTAL, HADIR, TELAT, ALPA) */}
                <div className="grid grid-cols-4 gap-2">
                    <div className="bg-surface border border-border rounded-xl p-2.5 text-center shadow-xs">
                        <span className="text-[20px] font-bold text-text-primary block leading-none">
                            {summary.total}
                        </span>
                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider mt-1 block">
                            TOTAL
                        </span>
                    </div>
                    <div className="bg-surface border border-emerald-300 rounded-xl p-2.5 text-center shadow-xs">
                        <span className="text-[20px] font-bold text-emerald-600 block leading-none">
                            {summary.present}
                        </span>
                        <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider mt-1 block">
                            HADIR
                        </span>
                    </div>
                    <div className="bg-surface border border-amber-300 rounded-xl p-2.5 text-center shadow-xs">
                        <span className="text-[20px] font-bold text-amber-600 block leading-none">
                            {summary.late}
                        </span>
                        <span className="text-[9px] font-bold text-amber-700 uppercase tracking-wider mt-1 block">
                            TELAT
                        </span>
                    </div>
                    <div className="bg-surface border border-red-300 rounded-xl p-2.5 text-center shadow-xs">
                        <span className="text-[20px] font-bold text-danger block leading-none">
                            {summary.absent}
                        </span>
                        <span className="text-[9px] font-bold text-danger uppercase tracking-wider mt-1 block">
                            ALPA
                        </span>
                    </div>
                </div>

                {/* 3. Menu Utama Grid (2x2) */}
                <div>
                    <h3 className="text-[14px] font-bold text-text-primary mb-3">Menu utama</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <Link
                            href="/leave-requests"
                            className="bg-surface border border-border/80 rounded-2xl p-4 shadow-card hover:border-primary/40 active:scale-[0.98] transition-all flex flex-col justify-between"
                        >
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-[18px] mb-3">
                                <i className="fas fa-file-signature" />
                            </div>
                            <div>
                                <span className="text-[14px] font-bold text-text-primary block leading-tight">
                                    Pantauan Izin
                                </span>
                                <span className="text-[11px] text-text-muted mt-0.5 block">
                                    Izin & dispensasi siswa
                                </span>
                            </div>
                        </Link>

                        <Link
                            href="/reports/daily"
                            className="bg-surface border border-border/80 rounded-2xl p-4 shadow-card hover:border-primary/40 active:scale-[0.98] transition-all flex flex-col justify-between"
                        >
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center text-[18px] mb-3">
                                <i className="fas fa-calendar-alt" />
                            </div>
                            <div>
                                <span className="text-[14px] font-bold text-text-primary block leading-tight">
                                    Rekap Harian
                                </span>
                                <span className="text-[11px] text-text-muted mt-0.5 block">
                                    Laporan per kelas
                                </span>
                            </div>
                        </Link>

                        <Link
                            href="/export"
                            className="bg-surface border border-border/80 rounded-2xl p-4 shadow-card hover:border-primary/40 active:scale-[0.98] transition-all flex flex-col justify-between"
                        >
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-[18px] mb-3">
                                <i className="fas fa-file-alt" />
                            </div>
                            <div>
                                <span className="text-[14px] font-bold text-text-primary block leading-tight">
                                    Ekspor Rekap
                                </span>
                                <span className="text-[11px] text-text-muted mt-0.5 block">
                                    Unduh Excel / PDF
                                </span>
                            </div>
                        </Link>

                        <Link
                            href="/profile"
                            className="bg-surface border border-border/80 rounded-2xl p-4 shadow-card hover:border-primary/40 active:scale-[0.98] transition-all flex flex-col justify-between"
                        >
                            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center text-[18px] mb-3">
                                <i className="fas fa-user" />
                            </div>
                            <div>
                                <span className="text-[14px] font-bold text-text-primary block leading-tight">
                                    Profil Guru
                                </span>
                                <span className="text-[11px] text-text-muted mt-0.5 block">
                                    Data akun piket
                                </span>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* 4. Siswa Perlu Perhatian Section */}
                <div className="bg-surface border border-border/80 rounded-2xl p-4 shadow-card">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-[12px] font-bold text-text-primary uppercase tracking-wider">
                            Perlu Perhatian ({attentionStudents.length})
                        </p>
                    </div>

                    {/* Tab selector */}
                    <div className="flex bg-muted p-1 rounded-xl mb-3 select-none">
                        <button
                            type="button"
                            onClick={() => setMobileTab("anomali")}
                            className={`flex-1 py-2 rounded-lg text-[12px] font-bold transition-colors cursor-pointer ${
                                mobileTab === "anomali" ? "bg-surface text-primary shadow-xs" : "text-text-muted"
                            }`}
                        >
                            Anomali ({anomali.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setMobileTab("izin")}
                            className={`flex-1 py-2 rounded-lg text-[12px] font-bold transition-colors cursor-pointer ${
                                mobileTab === "izin" ? "bg-surface text-primary shadow-xs" : "text-text-muted"
                            }`}
                        >
                            Izin ({izinList.length})
                        </button>
                    </div>

                    {/* Card list */}
                    <div className="space-y-2.5">
                        {(mobileTab === "anomali" ? anomali : izinList).map((s) => {
                            const badge = BADGE[s.status];
                            return (
                                <div
                                    key={s.id}
                                    className="bg-background border border-border rounded-xl p-3 flex items-center justify-between cursor-pointer hover:border-primary/30 transition-colors"
                                    style={{ borderLeftWidth: "4px", borderLeftColor: LEFT_BORDER[s.status] }}
                                    onClick={() => setSelectedStudent(s)}
                                >
                                    <div className="min-w-0 pr-2">
                                        <h4 className="text-[13px] font-bold text-text-primary truncate">{s.name}</h4>
                                        <p className="text-[11px] text-text-muted mt-0.5">
                                            {s.nis} • {s.class}
                                        </p>
                                        <p className="text-[10px] text-text-secondary mt-0.5 truncate">{rowNote(s)}</p>
                                    </div>
                                    <span
                                        className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                                        style={{ background: badge.bg, color: badge.color }}
                                    >
                                        {badge.label}
                                    </span>
                                </div>
                            );
                        })}
                        {(mobileTab === "anomali" ? anomali : izinList).length === 0 && (
                            <p className="text-center text-[12px] text-text-muted py-4">
                                Tidak ada data siswa untuk kategori ini.
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer Branding */}
                <p className="text-center text-[11px] text-text-muted/60 py-4 font-inter">
                    SMART Absen · SMA UII Yogyakarta
                </p>
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
