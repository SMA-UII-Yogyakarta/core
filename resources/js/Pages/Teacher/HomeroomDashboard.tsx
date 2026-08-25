import { useState, useMemo } from "react";
import { Link } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";
import {
    PageHeader,
    StatCard,
    StatusBadge,
    Table,
    Pagination,
    SearchBar,
    Button,
    EmptyState,
} from "@/Components";
import { FiUserX, FiCheckCircle } from "react-icons/fi";
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

function rowNote(s: Student): string {
    const att = s.attendances[0];
    const status = getRowStatus(s);
    if (status === "alpa") return "Belum ada kabar";
    if (status === "terlambat") return att?.check_in_time ? `${att.check_in_time} WIB` : "-";
    if (status === "pending") return "Pengajuan Izin " + (s.pendingLeave?.category ?? "");
    if (status === "diizinkan") return "Pengajuan Izin Diterima";
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
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

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
                <EmptyState
                    variant="no-data"
                    icon={<FiUserX className="text-4xl" />}
                    title="Belum Ditugaskan"
                    description="Anda belum ditugaskan sebagai wali kelas."
                />
            </AppShell>
        );
    }

    const columns: Column<Student>[] = [
        {
            key: "nis",
            header: "NISN",
            render: (s: Student) => <span className="font-bold text-text-primary">{s.nis}</span>,
        },
        {
            key: "name",
            header: "Nama Siswa",
            render: (s: Student) => <span className="font-semibold text-text-primary">{s.name}</span>,
        },
        {
            key: "status",
            header: "Status Hari Ini",
            render: (s: Student) => <StatusBadge variant={getRowStatus(s)} />,
        },
        {
            key: "note",
            header: "Waktu / Keterangan",
            render: (s: Student) => {
                const st = getRowStatus(s);
                return (
                    <span className={st === "terlambat" ? "text-warning font-semibold" : "text-text-secondary"}>
                        {rowNote(s)}
                    </span>
                );
            },
        },
        {
            key: "actions",
            header: "Tindakan",
            render: (s: Student) => {
                const st = getRowStatus(s);
                if (st === "pending") {
                    return (
                        <Link href="/leave-requests/verification">
                            <Button variant="primary" size="sm">
                                Verifikasi Izin
                            </Button>
                        </Link>
                    );
                }
                if (st === "alpa") {
                    return <span className="text-text-muted text-[13px]">-</span>;
                }
                return (
                    <Button variant="outline" size="sm">
                        Lihat Detail
                    </Button>
                );
            },
        },
    ];

    return (
        <AppShell title="Overview Wali Kelas">
            <PageHeader
                title={`Overview Wali Kelas: ${kelas.name}`}
                description="Pantau kehadiran harian anak didik kelas Anda secara real-time."
            >
                <span className="text-[13px] font-semibold px-3 py-1.5 rounded-lg bg-primary-light text-primary border border-primary/20">
                    {todayFormatted()}
                </span>
            </PageHeader>

            {/* 4 Stat Cards */}
            {stats && (
                <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatCard label="HADIR / TEPAT WAKTU" value={stats.present} />
                    <StatCard label="TERLAMBAT" value={stats.late} />
                    <StatCard label="SAKIT / IZIN" value={stats.pending_leave ?? 0} />
                    <StatCard label="TANPA KETERANGAN" value={stats.absent} />
                </section>
            )}

            {/* ── DESKTOP (lg:block): Standalone Table ─────────────── */}
            <section className="hidden lg:block space-y-4 font-inter">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-[16px] font-bold text-text-primary">
                            Perhatian Khusus Hari Ini
                        </h2>
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

                <Table
                    columns={columns}
                    data={paginatedAttention}
                    keyExtractor={(s) => s.id}
                    emptyMessage={search ? "Tidak ditemukan siswa yang cocok." : "Semua siswa hadir tepat waktu ✓"}
                />

                {attentionStudents.length > pageSize && (
                    <div className="pt-2">
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
            <div className="lg:hidden flex flex-col gap-4 font-inter">
                {/* Hero Summary Card */}
                <div className="bg-primary text-white rounded-2xl p-5 shadow-card overflow-hidden">
                    <p className="text-white/80 text-[12px] font-medium">Ringkasan Hari Ini</p>
                    <h2 className="text-white text-[22px] font-bold mt-1">{todayFormatted()}</h2>

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
                            <span className="text-[20px] font-bold text-success block mt-0.5">
                                {stats?.present ?? 0}
                            </span>
                        </div>
                        <div>
                            <span className="text-white/70 text-[10px] uppercase font-bold tracking-wider block">
                                Absen/Telat
                            </span>
                            <span className="text-[20px] font-bold text-warning block mt-0.5">
                                {(stats?.late ?? 0) + (stats?.absent ?? 0)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Mobile Attention List */}
                <div className="space-y-3">
                    <h3 className="text-[14px] font-bold text-text-primary">Perhatian Khusus Hari Ini</h3>

                    {attentionStudents.length === 0 ? (
                        <EmptyState
                            variant="no-data"
                            icon={<FiCheckCircle className="text-4xl text-success" />}
                            title="Semua Siswa Hadir Tepat Waktu"
                            description="Tidak ada anomali atau izin tertunda hari ini."
                            className="py-8"
                        />
                    ) : (
                        <div className="space-y-3">
                            {attentionStudents.map((s) => {
                                const st = getRowStatus(s);
                                return (
                                    <div
                                        key={s.id}
                                        className="bg-surface rounded-2xl p-4 border border-border shadow-card flex flex-col gap-3"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <h4 className="text-[14px] font-bold text-text-primary truncate">
                                                    {s.name}
                                                </h4>
                                                <p className="text-[12px] text-text-muted mt-0.5">{rowNote(s)}</p>
                                            </div>
                                            <StatusBadge variant={st} />
                                        </div>

                                        {st === "pending" && (
                                            <Link href="/leave-requests/verification" className="w-full">
                                                <Button variant="primary" size="sm" className="w-full justify-center">
                                                    Verifikasi Izin
                                                </Button>
                                            </Link>
                                        )}
                                        {st === "terlambat" && (
                                            <Button variant="outline" size="sm" className="w-full justify-center">
                                                Lihat Detail
                                            </Button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AppShell>
    );
}
