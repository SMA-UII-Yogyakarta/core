import { useState, useMemo } from "react";
import { Link } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";
import {
    PageHeader,
    Table,
    Pagination,
    SearchBar,
    EmptyState,
    Button,
} from "@/Components";
import { FiUserX } from "react-icons/fi";
import type { Column } from "@/Components/ui/Table";

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

type RowStatus = "alpa" | "terlambat" | "pending" | "diizinkan" | "hadir";

function getRowStatus(s: Student): RowStatus {
    const att = s.attendances[0];
    if (s.pendingLeave?.approval_status === "Approved") return "diizinkan";
    if (s.pendingLeave?.approval_status === "Pending") return "pending";
    if (!att) return "alpa";
    if (att.status.toLowerCase() === "late") return "terlambat";
    return "hadir";
}

function rowNote(s: Student): string {
    const att = s.attendances[0];
    const status = getRowStatus(s);
    if (status === "alpa") return "Belum ada kabar";
    if (status === "terlambat") return att?.check_in_time ? `${att.check_in_time} WIB` : "07:15 WIB";
    if (status === "pending") return "Pengajuan Izin " + (s.pendingLeave?.category ?? "Sakit");
    if (status === "diizinkan") return "Pengajuan Izin Diterima";
    return att?.check_in_time ? `${att.check_in_time} WIB` : "-";
}

const statusBadgeConfig: Record<RowStatus, { bg: string; text: string; border: string }> = {
    alpa: { bg: "bg-danger-bg", text: "text-danger", border: "border-danger-light" },
    terlambat: { bg: "bg-warning-bg", text: "text-warning", border: "border-warning-light" },
    pending: { bg: "bg-primary/10", text: "text-primary", border: "border-primary-light" },
    diizinkan: { bg: "bg-success-bg", text: "text-success", border: "border-success-light" },
    hadir: { bg: "bg-success-bg", text: "text-success", border: "border-success-light" },
};

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

    const attentionStudents = useMemo(() => {
        const raw = students.filter((s) => getRowStatus(s) !== "hadir");
        if (!search.trim()) return raw;
        const q = search.toLowerCase();
        return raw.filter((s) => s.name.toLowerCase().includes(q) || s.nis.toLowerCase().includes(q));
    }, [students, search]);

    const totalPages = Math.ceil(attentionStudents.length / pageSize) || 1;
    const safePage = Math.min(Math.max(1, currentPage), totalPages);
    const paginatedAttention = useMemo(() => {
        const start = (safePage - 1) * pageSize;
        return attentionStudents.slice(start, start + pageSize);
    }, [attentionStudents, safePage, pageSize]);

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
                <span className="font-semibold text-text-primary text-[14px] whitespace-nowrap truncate block max-w-[240px]" title={s.name}>
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
                const config = statusBadgeConfig[st];
                return (
                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${config.bg} ${config.text} ${config.border}`}>
                        {st.toUpperCase()}
                    </span>
                );
            },
        },
        {
            key: "note",
            header: "Waktu / Keterangan",
            className: "text-[13px]",
            render: (s: Student) => {
                const st = getRowStatus(s);
                if (st === "terlambat") {
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
                if (st === "alpa") {
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
                    <Button
                        variant="outline"
                        size="sm"
                        className="mx-auto text-[12px]"
                    >
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
        sick_permission: students.filter((s) => getRowStatus(s) === "pending" || getRowStatus(s) === "diizinkan").length,
        absent: students.filter((s) => getRowStatus(s) === "alpa").length,
    };

    return (
        <AppShell title="Overview Wali Kelas">
            <PageHeader
                title={`Overview Wali Kelas — ${shortClassName}`}
                description="Pantau presensi dan aktivitas harian siswa di kelas bimbingan Anda."
            />

            {/* Desktop Layout without outer Card wrapper */}
            <div className="space-y-6 font-inter">
                {/* 5 Color-Bordered Stat Cards Grid using Semantic Tokens */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-surface rounded-xl border border-border p-4 flex flex-col justify-between shadow-xs">
                        <span className="text-[28px] font-extrabold text-text-primary leading-none">
                            {summary.total}
                        </span>
                        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wide mt-2">
                            TOTAL SISWA
                        </span>
                    </div>

                    <div className="bg-surface rounded-xl border-2 border-success/40 p-4 flex flex-col justify-between shadow-xs">
                        <span className="text-[28px] font-extrabold text-success leading-none">
                            {summary.present}
                        </span>
                        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wide mt-2">
                            HADIR TERDATA
                        </span>
                    </div>

                    <div className="bg-surface rounded-xl border-2 border-warning/40 p-4 flex flex-col justify-between shadow-xs">
                        <span className="text-[28px] font-extrabold text-warning leading-none">
                            {summary.late}
                        </span>
                        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wide mt-2">
                            TERLAMBAT
                        </span>
                    </div>

                    <div className="bg-surface rounded-xl border-2 border-primary/40 p-4 flex flex-col justify-between shadow-xs">
                        <span className="text-[28px] font-extrabold text-primary leading-none">
                            {summary.sick_permission ?? 0}
                        </span>
                        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wide mt-2">
                            SAKIT / IZIN
                        </span>
                    </div>

                    <div className="bg-surface rounded-xl border-2 border-danger/40 p-4 flex flex-col justify-between shadow-xs">
                        <span className="text-[28px] font-extrabold text-danger leading-none">
                            {summary.absent}
                        </span>
                        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wide mt-2">
                            ALPA (KOSONG)
                        </span>
                    </div>
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

                    <Table<Student>
                        columns={columns}
                        data={paginatedAttention}
                        keyExtractor={(s) => s.id}
                        emptyMessage="Semua siswa di kelas ini hadir tepat waktu hari ini."
                    />

                    {/* Symmetrical Footer Info & Full-Width Pagination Bar */}
                    <div className="mt-4 pt-3 border-t border-border flex flex-col gap-3 font-inter">
                        <div className="flex items-center gap-2 text-[12px] text-text-muted font-medium">
                            <i className="fas fa-info-circle text-primary text-[14px] shrink-0" />
                            <span>Menampilkan daftar siswa kelas {shortClassName} yang memerlukan perhatian khusus.</span>
                        </div>
                        {attentionStudents.length > pageSize && (
                            <Pagination
                                currentPage={safePage}
                                totalPages={totalPages}
                                totalItems={attentionStudents.length}
                                perPage={pageSize}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </div>
                </div>
            </div>
        </AppShell>
    );
}