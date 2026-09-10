import { Link } from "@inertiajs/react";
import { useMemo, useState } from "react";
import { FiInfo, FiUserX } from "react-icons/fi";
import {
    Button,
    EmptyState,
    MobileNativePagination,
    PageHeader,
    SearchBar,
    StatCard,
    StatusBadge,
    Table,
    TableFooter,
} from "@/Components";
import type { Column } from "@/Components/ui/Table";
import { useClientPagination } from "@/hooks/useClientPagination";
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
    start_date: string;
    created_at: string;
}

interface Student {
    id: number;
    nis: string;
    nisn: string;
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
    sick_permission?: number;
}

interface PageProps {
    teacher: Teacher;
    class: SchoolClass | null;
    students: Student[];
    stats: Stats | null;
    pendingLeaveCount?: number;
}

type RowStatus =
    | "alpa"
    | "absent"
    | "terlambat"
    | "late"
    | "pending"
    | "diizinkan"
    | "approved_leave"
    | "hadir"
    | "present";

function getRowStatus(s: Student): RowStatus {
    const att = s.attendances[0];
    if (s.pendingLeave?.approval_status === "Approved") return "diizinkan";
    if (s.pendingLeave?.approval_status === "Pending") return "pending";
    if (!att) return "alpa";
    if (att.status.toLowerCase() === "late" || att.status.toLowerCase() === "terlambat") return "terlambat";
    return "hadir";
}

function rowNote(s: Student): string {
    const att = s.attendances[0];
    const status = getRowStatus(s);
    if (status === "alpa" || status === "absent") return "Belum ada kabar";
    if (status === "terlambat" || status === "late")
        return att?.check_in_time ? `${att.check_in_time} WIB` : "Terlambat";
    if (status === "pending")
        return s.pendingLeave?.category ? `Pengajuan Izin ${s.pendingLeave.category}` : "Pengajuan Izin";
    if (status === "diizinkan" || status === "approved_leave") return "Pengajuan Izin Diterima";
    return att?.check_in_time ? `${att.check_in_time} WIB` : "-";
}

export default function HomeroomDashboard({
    teacher: _teacher,
    class: kelas,
    students,
    stats,
    pendingLeaveCount: _pendingLeaveCount = 0,
}: PageProps) {
    const [search, setSearch] = useState("");

    const attentionStudents = useMemo(() => {
        const raw = students.filter((s) => getRowStatus(s) !== "present");
        if (!search.trim()) return raw;
        const q = search.toLowerCase();
        return raw.filter((s) => s.name.toLowerCase().includes(q) || s.nis.toLowerCase().includes(q));
    }, [students, search]);

    const {
        currentPage,
        setCurrentPage,
        totalPages,
        safePage,
        paginatedData: paginatedAttention,
        pageSize,
    } = useClientPagination(attentionStudents, 1, 10);

    if (!kelas) {
        return (
            <AppShell title="Overview Wali Kelas">
                <EmptyState
                    variant="no-data"
                    icon={<FiUserX className="text-4xl" />}
                    title="Belum Ditugaskan"
                    description="Anda belum ditugaskan sebagai wali kelas."
                />
            </AppShell>
        );
    }

    const shortClassName = kelas.name ? kelas.name.split(" (")[0] : "-";

    const columns: Column<Student>[] = [
        {
            key: "nis",
            header: "NISN",
            className: "w-32",
            render: (s: Student) => <span className="font-bold text-text-primary text-[13px]">{s.nis}</span>,
        },
        {
            key: "name",
            header: "Nama Siswa",
            className: "min-w-[180px]",
            render: (s: Student) => (
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
            render: (s: Student) => {
                const st = getRowStatus(s);
                return <StatusBadge variant={st} label={st.toUpperCase()} />;
            },
        },
        {
            key: "note",
            header: "Waktu / Keterangan",
            className: "text-[13px]",
            render: (s: Student) => {
                const st = getRowStatus(s);
                if (st === "terlambat" || st === "late") {
                    return <span className="font-bold text-warning text-[13px]">{rowNote(s)}</span>;
                }
                return <span className="text-text-secondary font-medium text-[13px]">{rowNote(s)}</span>;
            },
        },
        {
            key: "actions",
            header: "Tindakan",
            className: "w-36 text-center",
            render: (s: Student) => {
                const st = getRowStatus(s);
                if (st === "alpa" || st === "absent") {
                    return <span className="text-text-muted text-[13px]">-</span>;
                }
                if (st === "pending") {
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
                    <Button variant="outline" size="sm" className="mx-auto text-[12px]">
                        Lihat Detail
                    </Button>
                );
            },
        },
    ];

    const summary = stats ?? {
        total: students.length,
        present: Math.max(0, students.length - attentionStudents.length),
        late: students.filter((s) => getRowStatus(s) === "terlambat").length,
        sick_permission: students.filter((s) => getRowStatus(s) === "pending" || getRowStatus(s) === "diizinkan")
            .length,
        absent: students.filter((s) => getRowStatus(s) === "alpa").length,
    };

    return (
        <AppShell title="Overview Wali Kelas" hasTopCard={true}>
            <PageHeader
                title={`Overview Wali Kelas — ${shortClassName}`}
                description="Pantau presensi dan aktivitas harian siswa di kelas bimbingan Anda."
                className="hidden lg:flex shrink-0 mb-4"
            />

            {/* Desktop Layout without outer Card wrapper */}
            <div className="space-y-6 font-inter">
                {/* 5 Stat Cards Grid using Standard StatCard Component */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 font-inter">
                    <StatCard label="TOTAL SISWA" value={summary.total} />
                    <StatCard label="HADIR TERDATA" value={summary.present} variant="success" />
                    <StatCard label="TERLAMBAT" value={summary.late} variant="warning" />
                    <StatCard label="SAKIT / IZIN" value={summary.sick_permission ?? 0} variant="info" />
                    <StatCard label="ALPA (KOSONG)" value={summary.absent} variant="danger" />
                </div>

                {/* Standalone Table Section */}
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h3 className="text-[16px] font-bold text-text-primary font-inter">
                            Perhatian Khusus Hari Ini
                        </h3>
                        <div className="w-full sm:w-72">
                            <SearchBar
                                value={search}
                                onChange={(val) => {
                                    setSearch(val);
                                    setCurrentPage(1);
                                }}
                                onSearch={() => setCurrentPage(1)}
                                placeholder="Cari nama atau NISN..."
                            />
                        </div>
                    </div>

                    {/* Mobile Card Stack (< sm) */}
                    <div className="sm:hidden space-y-3">
                        {paginatedAttention.length === 0 ? (
                            <div className="bg-surface border border-border rounded-xl p-6 text-center text-text-muted">
                                Semua siswa di kelas ini hadir tepat waktu hari ini.
                            </div>
                        ) : (
                            paginatedAttention.map((s) => {
                                const st = getRowStatus(s);
                                return (
                                    <div
                                        key={s.id}
                                        className="bg-surface border border-border rounded-xl p-3.5 space-y-2 shadow-card"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <h4 className="text-[14px] font-bold text-text-primary truncate">
                                                    {s.name}
                                                </h4>
                                                <p className="text-[11px] text-text-muted">NISN: {s.nis}</p>
                                            </div>
                                            <StatusBadge variant={st} label={st.toUpperCase()} />
                                        </div>
                                        <div className="text-[12px] text-text-secondary pt-2 border-t border-border flex items-center justify-between">
                                            <span className="truncate">{rowNote(s)}</span>
                                            {st === "pending" && (
                                                <Link
                                                    href="/leave-requests"
                                                    className="px-2.5 py-1 bg-primary text-white rounded-lg text-[11px] font-bold shrink-0 ml-2"
                                                >
                                                    Verifikasi
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}

                        {attentionStudents.length > pageSize && (
                            <div className="pt-2 font-inter">
                                <MobileNativePagination
                                    currentPage={safePage}
                                    totalPages={totalPages}
                                    totalItems={attentionStudents.length}
                                    perPage={pageSize}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        )}
                    </div>

                    {/* Tablet & Desktop View (>= sm) */}
                    <div className="hidden sm:block space-y-4">
                        <Table<Student>
                            columns={columns}
                            data={paginatedAttention}
                            keyExtractor={(s) => s.id}
                            emptyMessage="Semua siswa di kelas ini hadir tepat waktu hari ini."
                        />

                        <TableFooter
                            info={`Menampilkan daftar siswa kelas ${shortClassName} yang memerlukan perhatian khusus.`}
                            currentPage={safePage}
                            totalPages={totalPages}
                            totalItems={attentionStudents.length}
                            perPage={pageSize}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
