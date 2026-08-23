import { useState, useMemo } from "react";
import { router, Link } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";
import {
    PageHeader,
    StatCard,
    StatusBadge,
    Table,
    Pagination,
    SearchBar,
    Drawer,
    ActionButton,
    NativeSelect,
    Button,
} from "@/Components";
import type { Column } from "@/Components/ui/Table";
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

    const handleFilter = () => {
        router.get(
            "/teacher/duty",
            { class_id: classVal || undefined, date: dateVal, tab: mobileTab },
            { preserveState: true },
        );
    };

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

    const columns: Column<AttentionStudent>[] = [
        {
            key: "nis",
            header: "NISN",
            render: (s: AttentionStudent) => <span className="font-bold text-text-primary">{s.nis}</span>,
        },
        {
            key: "name",
            header: "Nama Siswa",
            render: (s: AttentionStudent) => (
                <div>
                    <span className="font-semibold text-text-primary block">{s.name}</span>
                    <span className="text-[11px] text-text-muted">{s.class}</span>
                </div>
            ),
        },
        {
            key: "status",
            header: "Status Hari Ini",
            render: (s: AttentionStudent) => <StatusBadge variant={s.status} />,
        },
        {
            key: "note",
            header: "Waktu / Keterangan",
            render: (s: AttentionStudent) => (
                <span className={s.status === "terlambat" ? "text-warning font-semibold" : "text-text-secondary"}>
                    {rowNote(s)}
                </span>
            ),
        },
        {
            key: "actions",
            header: "Aksi",
            render: (s: AttentionStudent) => (
                <ActionButton
                    variant="detail"
                    icon="fa-eye"
                    label="Detail"
                    onClick={() => setSelectedStudent(s)}
                />
            ),
        },
    ];

    const classOptions = [
        { value: "", label: "Semua Kelas" },
        ...classes.map((c) => ({ value: c.id.toString(), label: c.name })),
        ...(classes.length === 0
            ? classStats.map((c) => ({ value: c.class_id.toString(), label: c.class }))
            : []),
    ];

    return (
        <AppShell title="Overview Guru Piket">
            <PageHeader
                title="Overview Monitoring Guru Piket"
                description="Pantau kehadiran siswa secara real-time dan kelola siswa yang memerlukan perhatian khusus."
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
                        title={`Terakhir diperbarui: ${
                            lastUpdated ? lastUpdated.toLocaleTimeString("id-ID") : "—"
                        }`}
                    >
                        <i className={`fas fa-sync-alt text-[12px] ${isRefreshing ? "fa-spin" : ""}`} />
                    </Button>
                </div>
            </PageHeader>

            {/* ── DESKTOP (lg:block) ──────────────────────────────────────── */}
            <div className="hidden lg:block space-y-6 font-inter">
                {/* Controls Bar */}
                <div className="flex items-center justify-between gap-4 bg-surface p-4 border border-border rounded-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-48">
                            <NativeSelect
                                value={classVal}
                                onChange={(e) => handleClassChange(e.target.value)}
                            >
                                {classOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </NativeSelect>
                        </div>
                        <div className="flex items-center gap-2">
                            <i className="fas fa-calendar-alt text-text-muted text-[13px]" />
                            <input
                                type="date"
                                value={dateVal}
                                onChange={(e) => setDateVal(e.target.value)}
                                onBlur={handleFilter}
                                className="h-10 border border-border rounded-lg px-3 text-[13px] text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </div>

                    <div className="w-64">
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

                {/* 5 Stat Cards Grid */}
                <div className="grid grid-cols-5 gap-4">
                    <StatCard label="TOTAL SISWA" value={summary.total} />
                    <StatCard label="HADIR TERDATA" value={summary.present} />
                    <StatCard label="TERLAMBAT" value={summary.late} />
                    <StatCard label="SAKIT / IZIN" value={summary.sick_permission} />
                    <StatCard label="ALPA (KOSONG)" value={summary.absent} />
                </div>

                {/* Standalone Table (Tabel Berdiri Sendiri) */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[18px] font-bold text-text-primary font-inter">
                            Perhatian Khusus Hari Ini
                        </h2>
                        <span className="text-[14px] text-text-muted">
                            Menampilkan {paginatedAttention.length} dari {filteredAttention.length} siswa terpantau
                        </span>
                    </div>

                    <Table
                        columns={columns}
                        data={paginatedAttention}
                        keyExtractor={(s) => s.id}
                        emptyMessage="Tidak ada data siswa yang memerlukan perhatian khusus."
                    />

                    {filteredAttention.length > pageSize && (
                        <div className="pt-2">
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

            {/* ── MOBILE (lg:hidden) ──────────────────────────────────────── */}
            <div className="block lg:hidden flex flex-col gap-4 font-inter">
                {/* Filter Controls */}
                <div className="grid grid-cols-2 gap-3">
                    <NativeSelect
                        value={classVal}
                        onChange={(e) => handleClassChange(e.target.value)}
                    >
                        {classOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </NativeSelect>
                    <input
                        type="date"
                        value={dateVal}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className="w-full h-11 rounded-xl px-3.5 text-[13px] font-bold text-text-primary bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-xs"
                    />
                </div>

                {/* Tab Switcher */}
                <div className="flex gap-2 p-1 bg-muted rounded-xl">
                    <button
                        type="button"
                        onClick={() => setMobileTab("anomali")}
                        className={`flex-1 py-2 text-[12px] font-bold rounded-lg transition-colors cursor-pointer ${
                            mobileTab === "anomali"
                                ? "bg-surface text-primary shadow-xs border border-border"
                                : "text-text-muted hover:text-text-primary"
                        }`}
                    >
                        ANOMALI ({anomali.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setMobileTab("izin")}
                        className={`flex-1 py-2 text-[12px] font-bold rounded-lg transition-colors cursor-pointer ${
                            mobileTab === "izin"
                                ? "bg-surface text-primary shadow-xs border border-border"
                                : "text-text-muted hover:text-text-primary"
                        }`}
                    >
                        DATA IZIN ({izinList.length})
                    </button>
                </div>

                {/* Stat Summary */}
                <div className="grid grid-cols-4 gap-2">
                    <StatCard label="TOTAL" value={summary.total} />
                    <StatCard label="HADIR" value={summary.present} />
                    <StatCard label="TELAT" value={summary.late} />
                    <StatCard label="ALPA" value={summary.absent} />
                </div>

                {/* Quick Menu Grid */}
                <div className="space-y-3">
                    <h3 className="text-[14px] font-bold text-text-primary">Menu Utama</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <Link
                            href="/leave-requests"
                            className="bg-surface border border-border rounded-2xl p-4 shadow-card hover:border-primary/40 active:scale-[0.98] transition-all flex flex-col justify-between"
                        >
                            <div className="w-10 h-10 rounded-xl bg-warning-bg text-warning flex items-center justify-center text-[18px] mb-3">
                                <i className="fas fa-file-signature" />
                            </div>
                            <div>
                                <span className="text-[14px] font-bold text-text-primary block leading-tight">
                                    Pantauan Izin
                                </span>
                                <span className="text-[11px] text-text-muted mt-0.5 block">
                                    Izin & dispensasi
                                </span>
                            </div>
                        </Link>

                        <Link
                            href="/reports/daily"
                            className="bg-surface border border-border rounded-2xl p-4 shadow-card hover:border-primary/40 active:scale-[0.98] transition-all flex flex-col justify-between"
                        >
                            <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center text-[18px] mb-3">
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
                            className="bg-surface border border-border rounded-2xl p-4 shadow-card hover:border-primary/40 active:scale-[0.98] transition-all flex flex-col justify-between"
                        >
                            <div className="w-10 h-10 rounded-xl bg-success-light text-success flex items-center justify-center text-[18px] mb-3">
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
                            className="bg-surface border border-border rounded-2xl p-4 shadow-card hover:border-primary/40 active:scale-[0.98] transition-all flex flex-col justify-between"
                        >
                            <div className="w-10 h-10 rounded-xl bg-muted text-text-muted flex items-center justify-center text-[18px] mb-3">
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

                {/* Mobile Student Attention List */}
                <div className="bg-surface border border-border rounded-2xl p-4 shadow-card space-y-3">
                    <p className="text-[12px] font-bold text-text-primary uppercase tracking-wider">
                        Perlu Perhatian ({attentionStudents.length})
                    </p>

                    <div className="space-y-2.5">
                        {(mobileTab === "anomali" ? anomali : izinList).map((s) => (
                            <div
                                key={s.id}
                                className="bg-background border border-border rounded-xl p-3 flex items-center justify-between cursor-pointer hover:border-primary/30 transition-colors"
                                onClick={() => setSelectedStudent(s)}
                            >
                                <div className="min-w-0 pr-2">
                                    <h4 className="text-[13px] font-bold text-text-primary truncate">{s.name}</h4>
                                    <p className="text-[11px] text-text-muted mt-0.5">
                                        {s.nis} • {s.class}
                                    </p>
                                    <p className="text-[10px] text-text-secondary mt-0.5 truncate">{rowNote(s)}</p>
                                </div>
                                <StatusBadge variant={s.status} />
                            </div>
                        ))}
                        {(mobileTab === "anomali" ? anomali : izinList).length === 0 && (
                            <p className="text-center text-[12px] text-text-muted py-4">
                                Tidak ada data siswa untuk kategori ini.
                            </p>
                        )}
                    </div>
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
                                <span className="font-bold text-[15px]">{selectedStudent.name}</span>
                            </div>
                            <StatusBadge variant={selectedStudent.status} />
                        </div>

                        <div className="border border-border rounded-xl p-4 space-y-2">
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

                        <div className="border border-border rounded-xl p-4 space-y-2">
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
