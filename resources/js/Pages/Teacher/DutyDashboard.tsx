import { Link, router } from "@inertiajs/react";
import { useMemo, useState } from "react";
import { FiCalendar, FiEdit3, FiFileText, FiInfo, FiRefreshCw, FiUser } from "react-icons/fi";
import {
    Button,
    Drawer,
    FilterBar,
    Input,
    MobileNativePagination,
    NativeSelect,
    PageHeader,
    StatCard,
    StatusBadge,
    Table,
    TableFooter,
    TabSwitcher,
} from "@/Components";
import type { Column } from "@/Components/ui/Table";
import { useClientPagination } from "@/hooks/useClientPagination";
import { useInertiaPolling } from "@/hooks/useInertiaPolling";
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
    status: "alpa" | "absent" | "terlambat" | "late" | "pending" | "diizinkan" | "hadir";
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

function rowNote(s: AttentionStudent): string {
    if (s.status === "alpa" || s.status === "absent") return "Belum ada kabar";
    if (s.status === "terlambat" || s.status === "late")
        return s.check_in_time ? `${s.check_in_time} WIB` : "07:15 WIB";
    if (s.status === "pending") return `Pengajuan Izin ${s.leave_category ?? "Sakit"}`;
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

    const displayStudents = attentionStudents;

    // Search & pagination
    const [search, setSearch] = useState("");

    const filteredAttention = useMemo(() => {
        if (!search.trim()) return displayStudents;
        const q = search.toLowerCase();
        return displayStudents.filter(
            (s) =>
                s.name.toLowerCase().includes(q) ||
                s.nis.toLowerCase().includes(q) ||
                s.class.toLowerCase().includes(q),
        );
    }, [displayStudents, search]);

    const {
        currentPage,
        setCurrentPage,
        totalPages,
        safePage,
        paginatedData: paginatedAttention,
        pageSize,
    } = useClientPagination(filteredAttention, 1, 10);

    // Live Polling
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

    const summary = totals ?? {
        total: 0,
        present: 0,
        late: 0,
        sick_permission: 0,
        absent: 0,
    };

    const classOptions = [
        { value: "", label: "Semua Kelas" },
        ...classes.map((c) => ({ value: c.id.toString(), label: c.name.split(" (")[0] })),
        ...(classes.length === 0
            ? classStats.map((c) => ({ value: c.class_id.toString(), label: c.class.split(" (")[0] }))
            : []),
    ];

    const columns: Column<AttentionStudent>[] = [
        {
            key: "nis",
            header: "NISN",
            className: "w-32",
            render: (s: AttentionStudent) => <span className="font-bold text-text-primary text-[13px]">{s.nis}</span>,
        },
        {
            key: "name",
            header: "Nama Siswa",
            className: "min-w-[180px]",
            render: (s: AttentionStudent) => (
                <span
                    className="font-semibold text-text-primary text-[14px] whitespace-nowrap truncate block max-w-[240px]"
                    title={s.name}
                >
                    {s.name}
                </span>
            ),
        },
        {
            key: "status",
            header: "Status Hari Ini",
            className: "w-40 text-center",
            render: (s: AttentionStudent) => {
                const label =
                    s.status === "pending"
                        ? "PENDING IZIN"
                        : s.status === "diizinkan"
                          ? "DIIZINKAN"
                          : s.status.toUpperCase();
                return <StatusBadge variant={s.status} label={label} />;
            },
        },
        {
            key: "note",
            header: "Waktu / Keterangan",
            className: "text-[13px]",
            render: (s: AttentionStudent) => {
                if (s.status === "terlambat" || s.status === "late") {
                    return <span className="font-bold text-warning text-[13px]">{rowNote(s)}</span>;
                }
                return <span className="text-text-secondary font-medium text-[13px]">{rowNote(s)}</span>;
            },
        },
        {
            key: "actions",
            header: "Tindakan",
            className: "w-36 text-center",
            render: (s: AttentionStudent) => {
                if (s.status === "alpa") {
                    return <span className="text-text-muted text-[13px]">-</span>;
                }
                if (s.status === "pending") {
                    return (
                        <Link
                            href="/leave-requests"
                            className="px-3.5 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-[12px] font-bold inline-flex items-center justify-center gap-1.5 shadow-xs transition-all mx-auto cursor-pointer"
                        >
                            Verifikasi Izin
                        </Link>
                    );
                }
                return (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedStudent(s)}
                        className="mx-auto text-[12px]"
                    >
                        Lihat Detail
                    </Button>
                );
            },
        },
    ];

    return (
        <AppShell title="Overview Guru Piket">
            <PageHeader
                title="Overview Monitoring Guru Piket"
                description="Pantau kehadiran siswa secara real-time dan kelola siswa yang memerlukan perhatian khusus."
                className="hidden lg:flex shrink-0 mb-4"
            >
                <div className="flex items-center gap-2">
                    <Button
                        variant={isPolling ? "outline" : "ghost"}
                        size="sm"
                        onClick={togglePolling}
                        className="text-[12px]"
                    >
                        <span
                            className={`w-2 h-2 rounded-full mr-1.5 ${
                                isPolling ? "bg-success animate-pulse" : "bg-text-inactive"
                            }`}
                        />
                        {isPolling ? "Live Auto (10s)" : "Auto-Refresh Paused"}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={triggerRefresh}
                        loading={isRefreshing}
                        title={`Terakhir diperbarui: ${lastUpdated ? lastUpdated.toLocaleTimeString("id-ID") : "—"}`}
                    >
                        <FiRefreshCw className={`text-[12px] ${isRefreshing ? "animate-spin" : ""}`} />
                    </Button>
                </div>
            </PageHeader>

            {/* ── DESKTOP Layout (Standalone without Card outer wrapper) ──────── */}
            <div className="hidden lg:block space-y-6 font-inter">
                {/* Filter Controls Bar */}
                <FilterBar className="mb-6">
                    <FilterBar.Select
                        label="Filter Kelas"
                        value={classVal}
                        onChange={(e) => handleClassChange(e.target.value)}
                        options={classOptions}
                    />
                    <FilterBar.Date label="Tanggal" value={dateVal} onChange={handleDateChange} />
                    <div className="w-full sm:w-64 sm:ml-auto">
                        <FilterBar.Search
                            value={search}
                            onChange={(val) => {
                                setSearch(val);
                                setCurrentPage(1);
                            }}
                            onSubmit={(e) => {
                                e.preventDefault();
                                setCurrentPage(1);
                            }}
                            placeholder="Cari nama / NIS / kelas..."
                        />
                    </div>
                </FilterBar>

                {/* 5 Stat Cards Grid (Pure Design Tokens) */}
                <div className="grid grid-cols-5 gap-4">
                    <StatCard label="TOTAL SISWA" value={summary.total} />
                    <StatCard label="HADIR TERDATA" value={summary.present} variant="success" />
                    <StatCard label="TERLAMBAT" value={summary.late} variant="warning" />
                    <StatCard label="SAKIT / IZIN" value={summary.sick_permission} variant="info" />
                    <StatCard label="ALPA (KOSONG)" value={summary.absent} variant="danger" />
                </div>

                {/* Standalone Table Section (No outer Card container) */}
                <div className="space-y-4">
                    <h3 className="text-[16px] font-bold text-text-primary font-inter">Perhatian Khusus Hari Ini</h3>

                    <Table<AttentionStudent>
                        columns={columns}
                        data={paginatedAttention}
                        keyExtractor={(s) => s.id}
                        emptyMessage="Tidak ada data siswa yang memerlukan perhatian khusus."
                    />

                    <TableFooter
                        currentPage={safePage}
                        totalPages={totalPages}
                        totalItems={filteredAttention.length}
                        perPage={pageSize}
                        onPageChange={setCurrentPage}
                        itemLabel="siswa terpantau hari ini"
                    />
                </div>
            </div>

            {/* ── MOBILE (lg:hidden) ──────────────────────────────────────── */}
            <div className="block lg:hidden flex flex-col gap-4 font-inter">
                {/* Filter & Action Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-3">
                        <div className="w-full sm:w-44">
                            <NativeSelect
                                value={classVal}
                                onChange={(e) => handleClassChange(e.target.value)}
                                className="h-10 text-[13px]"
                            >
                                {classOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </NativeSelect>
                        </div>
                        <div className="w-full sm:w-36">
                            <Input
                                type="date"
                                value={dateVal}
                                onChange={(e) => handleDateChange(e.target.value)}
                                inputClassName="h-10 rounded-xl font-bold shadow-xs text-[12.5px]"
                            />
                        </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-2 shrink-0 ml-auto">
                        <Button
                            variant={isPolling ? "outline" : "ghost"}
                            size="sm"
                            onClick={togglePolling}
                            className="text-[12px] h-10 px-3"
                        >
                            <span
                                className={`w-2 h-2 rounded-full mr-1.5 ${
                                    isPolling ? "bg-success animate-pulse" : "bg-text-inactive"
                                }`}
                            />
                            {isPolling ? "Live (10s)" : "Paused"}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={triggerRefresh}
                            loading={isRefreshing}
                            className="h-10 px-3"
                            title={`Terakhir diperbarui: ${
                                lastUpdated ? lastUpdated.toLocaleTimeString("id-ID") : "—"
                            }`}
                        >
                            <FiRefreshCw className={`text-[13px] ${isRefreshing ? "animate-spin" : ""}`} />
                        </Button>
                    </div>
                </div>

                {/* Tab Switcher (Mobile & Tablet) */}
                <div className="lg:hidden">
                    <TabSwitcher
                        tabs={[
                            { key: "anomali", label: `ANOMALI (${summary.late + summary.absent})` },
                            { key: "izin", label: `DATA IZIN (${summary.sick_permission})` },
                        ]}
                        activeKey={mobileTab}
                        onChange={(k) => setMobileTab(k as MobileTab)}
                        variant="segmented"
                        fullWidth
                    />
                </div>

                {/* Stat Summary Cards */}
                <div className="grid grid-cols-4 gap-2">
                    <StatCard label="TOTAL" value={summary.total} />
                    <StatCard label="HADIR" value={summary.present} variant="success" />
                    <StatCard label="TELAT" value={summary.late} variant="warning" />
                    <StatCard label="ALPA" value={summary.absent} variant="danger" />
                </div>

                {/* Quick Menu Grid */}
                <div className="space-y-3">
                    <h3 className="text-[14px] font-bold text-text-primary">Menu Utama</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <Link
                            href="/leave-requests"
                            className="bg-surface border border-border rounded-2xl p-4 shadow-xs hover:border-primary/40 active:scale-[0.98] transition-all flex flex-col justify-between"
                        >
                            <div className="w-10 h-10 rounded-xl bg-warning-bg text-warning flex items-center justify-center text-[18px] mb-3">
                                <FiEdit3 />
                            </div>
                            <div>
                                <span className="text-[14px] font-bold text-text-primary block leading-tight">
                                    Pantauan Izin
                                </span>
                                <span className="text-[11px] text-text-muted mt-0.5 block">Izin & dispensasi</span>
                            </div>
                        </Link>

                        <Link
                            href="/reports/daily"
                            className="bg-surface border border-border rounded-2xl p-4 shadow-xs hover:border-primary/40 active:scale-[0.98] transition-all flex flex-col justify-between"
                        >
                            <div className="w-10 h-10 rounded-xl bg-success-bg text-success flex items-center justify-center text-[18px] mb-3">
                                <FiCalendar />
                            </div>
                            <div>
                                <span className="text-[14px] font-bold text-text-primary block leading-tight">
                                    Rekap Harian
                                </span>
                                <span className="text-[11px] text-text-muted mt-0.5 block">Laporan per kelas</span>
                            </div>
                        </Link>

                        <Link
                            href="/export"
                            className="bg-surface border border-border rounded-2xl p-4 shadow-xs hover:border-primary/40 active:scale-[0.98] transition-all flex flex-col justify-between"
                        >
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-[18px] mb-3">
                                <FiFileText />
                            </div>
                            <div>
                                <span className="text-[14px] font-bold text-text-primary block leading-tight">
                                    Ekspor Laporan
                                </span>
                                <span className="text-[11px] text-text-muted mt-0.5 block">PDF & Excel</span>
                            </div>
                        </Link>

                        <button
                            type="button"
                            onClick={triggerRefresh}
                            disabled={isRefreshing}
                            className="bg-surface border border-border rounded-2xl p-4 shadow-xs hover:border-primary/40 active:scale-[0.98] transition-all flex flex-col justify-between cursor-pointer"
                        >
                            <div className="w-10 h-10 rounded-xl bg-info-bg text-info flex items-center justify-center text-[18px] mb-3">
                                <FiRefreshCw className={isRefreshing ? "animate-spin" : ""} />
                            </div>
                            <div>
                                <span className="text-[14px] font-bold text-text-primary block leading-tight">
                                    Refresh Data
                                </span>
                                <span className="text-[11px] text-text-muted mt-0.5 block">Sinkronkan manual</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Mobile Student List */}
                <div className="space-y-3">
                    <h3 className="text-[14px] font-bold text-text-primary">
                        {mobileTab === "anomali" ? "Siswa Anomali Kehadiran" : "Pengajuan Izin Siswa"}
                    </h3>

                    {paginatedAttention.length === 0 ? (
                        <div className="bg-surface border border-border rounded-xl p-6 text-center text-text-muted">
                            Tidak ada data siswa yang memerlukan perhatian khusus.
                        </div>
                    ) : (
                        paginatedAttention.map((s) => (
                            <div
                                key={s.id}
                                onClick={() => setSelectedStudent(s)}
                                className="bg-surface border border-border rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-xs active:bg-muted cursor-pointer"
                            >
                                <div className="space-y-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-text-primary text-[14px] truncate">
                                            {s.name}
                                        </span>
                                        <span className="text-[11px] font-semibold text-text-muted px-1.5 py-0.5 bg-muted rounded">
                                            {s.class ? s.class.split(" (")[0] : "-"}
                                        </span>
                                    </div>
                                    <p className="text-[12px] text-text-secondary truncate">{rowNote(s)}</p>
                                </div>

                                <div className="shrink-0">
                                    <StatusBadge
                                        variant={s.status}
                                        label={
                                            s.status === "pending"
                                                ? "PENDING"
                                                : s.status === "diizinkan"
                                                  ? "DIIZINKAN"
                                                  : s.status.toUpperCase()
                                        }
                                    />
                                </div>
                            </div>
                        ))
                    )}

                    {filteredAttention.length > pageSize && (
                        <div className="pt-2 font-inter">
                            <MobileNativePagination
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

            {/* Student Detail Drawer */}
            <Drawer
                open={Boolean(selectedStudent)}
                onClose={() => setSelectedStudent(null)}
                title="Detail Perhatian Khusus"
            >
                {selectedStudent && (
                    <div className="space-y-6 font-inter">
                        <div className="flex items-center gap-3 p-4 bg-muted rounded-2xl border border-border">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
                                <FiUser />
                            </div>
                            <div>
                                <h4 className="font-bold text-text-primary text-[16px]">{selectedStudent.name}</h4>
                                <p className="text-[13px] text-text-muted">
                                    NIS: {selectedStudent.nis} • Kelas{" "}
                                    {selectedStudent.class ? selectedStudent.class.split(" (")[0] : "-"}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-border">
                                <span className="text-[13px] text-text-muted">Status Kehadiran</span>
                                <StatusBadge
                                    variant={selectedStudent.status}
                                    label={
                                        selectedStudent.status === "pending"
                                            ? "PENDING IZIN"
                                            : selectedStudent.status === "diizinkan"
                                              ? "DIIZINKAN"
                                              : selectedStudent.status.toUpperCase()
                                    }
                                />
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-border">
                                <span className="text-[13px] text-text-muted">Waktu / Keterangan</span>
                                <span className="text-[13px] font-bold text-text-primary">
                                    {rowNote(selectedStudent)}
                                </span>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            {selectedStudent.status === "pending" && (
                                <Link
                                    href="/leave-requests"
                                    className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-[13px] text-center shadow-xs"
                                >
                                    Proses Verifikasi Izin
                                </Link>
                            )}
                            <Button variant="outline" className="w-full" onClick={() => setSelectedStudent(null)}>
                                Tutup
                            </Button>
                        </div>
                    </div>
                )}
            </Drawer>
        </AppShell>
    );
}
