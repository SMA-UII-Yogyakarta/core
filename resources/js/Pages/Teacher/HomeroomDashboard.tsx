import { useMemo, useState } from "react";
import { FiAlertCircle, FiCalendar, FiFileText, FiUsers, FiUserX } from "react-icons/fi";
import {
    Avatar,
    EmptyState,
    MobileNativePagination,
    PageHeader,
    SearchBar,
    SectionHeader,
    StatusBadge,
    Table,
    TableFooter,
    TableSection,
    TeacherAttendanceStats,
    TeacherInlineAction,
    TeacherOverviewHero,
    TeacherQuickAction,
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

function getRowStatus(student: Student): RowStatus {
    const attendance = student.attendances[0];
    if (student.pendingLeave?.approval_status === "Approved") return "diizinkan";
    if (student.pendingLeave?.approval_status === "Pending") return "pending";
    if (!attendance) return "alpa";
    if (attendance.status.toLowerCase() === "late" || attendance.status.toLowerCase() === "terlambat") {
        return "terlambat";
    }
    return "hadir";
}

function rowNote(student: Student): string {
    const attendance = student.attendances[0];
    const status = getRowStatus(student);
    if (status === "alpa" || status === "absent") return "Belum ada kabar";
    if (status === "terlambat" || status === "late") {
        return attendance?.check_in_time ? `${attendance.check_in_time} WIB` : "Terlambat";
    }
    if (status === "pending") {
        return student.pendingLeave?.category ? `Pengajuan Izin ${student.pendingLeave.category}` : "Pengajuan Izin";
    }
    if (status === "diizinkan" || status === "approved_leave") return "Pengajuan izin diterima";
    return attendance?.check_in_time ? `${attendance.check_in_time} WIB` : "-";
}

export default function HomeroomDashboard({
    teacher,
    class: kelas,
    students,
    stats,
    pendingLeaveCount = 0,
}: PageProps) {
    const [search, setSearch] = useState("");

    const attentionStudents = useMemo(() => {
        const raw = students.filter((student) => {
            const status = getRowStatus(student);
            return status !== "hadir" && status !== "present";
        });

        if (!search.trim()) return raw;
        const query = search.toLowerCase().trim();
        return raw.filter(
            (student) => student.name.toLowerCase().includes(query) || student.nis.toLowerCase().includes(query),
        );
    }, [students, search]);

    const {
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
    const summary = stats ?? {
        total: students.length,
        present: students.length - attentionStudents.length,
        late: students.filter((student) => getRowStatus(student) === "terlambat").length,
        sick_permission: students.filter(
            (student) => getRowStatus(student) === "pending" || getRowStatus(student) === "diizinkan",
        ).length,
        absent: students.filter((student) => getRowStatus(student) === "alpa").length,
    };
    const attentionCount = attentionStudents.length;

    const columns: Column<Student>[] = [
        {
            key: "nis",
            header: "NISN",
            className: "w-32",
            render: (student) => <span className="font-bold text-[13px] text-text-primary">{student.nis}</span>,
        },
        {
            key: "name",
            header: "Nama Siswa",
            className: "min-w-[190px]",
            render: (student) => (
                <div className="flex min-w-0 items-center gap-2.5">
                    <Avatar name={student.name} size="sm" variant="primary" />
                    <span
                        className="block max-w-[240px] truncate whitespace-nowrap text-[13px] font-semibold text-text-primary"
                        title={student.name}
                    >
                        {student.name}
                    </span>
                </div>
            ),
        },
        {
            key: "status",
            header: "Status Hari Ini",
            className: "w-40 text-center",
            render: (student) => <StatusBadge variant={getRowStatus(student)} />,
        },
        {
            key: "note",
            header: "Waktu / Keterangan",
            className: "min-w-[170px] text-[13px]",
            render: (student) => {
                const status = getRowStatus(student);
                return (
                    <span
                        className={`text-[13px] ${
                            status === "terlambat" || status === "late"
                                ? "font-bold text-warning"
                                : "font-medium text-text-secondary"
                        }`}
                    >
                        {rowNote(student)}
                    </span>
                );
            },
        },
        {
            key: "actions",
            header: "Tindakan",
            className: "w-36 text-center",
            render: (student) =>
                getRowStatus(student) === "pending" ? (
                    <TeacherInlineAction href="/leave-requests/verification">Verifikasi</TeacherInlineAction>
                ) : (
                    <span className="text-[13px] text-text-inactive">—</span>
                ),
        },
    ];

    return (
        <AppShell
            title="Overview Wali Kelas"
            hasTopCard
            searchValue={search}
            onSearchChange={(value) => {
                setSearch(value);
                setCurrentPage(1);
            }}
            searchPlaceholder="Cari nama atau NISN..."
        >
            <div className="flex min-w-0 flex-col gap-4 font-inter sm:gap-5 lg:gap-6">
                <PageHeader
                    title={`Overview Wali Kelas — ${shortClassName}`}
                    description="Pantau presensi dan aktivitas harian siswa di kelas bimbingan Anda."
                    className="hidden shrink-0 lg:flex"
                />

                <TeacherOverviewHero
                    eyebrow="WALI KELAS • OVERVIEW"
                    title={`Kelas ${shortClassName}`}
                    description={`Halo, ${teacher.name}. Berikut ringkasan presensi kelas Anda hari ini.`}
                    statusLabel={pendingLeaveCount > 0 ? `${pendingLeaveCount} izin menunggu` : "Kelas terpantau"}
                    statusDetail={
                        attentionCount > 0
                            ? `${attentionCount} siswa perlu perhatian`
                            : "Tidak ada anomali yang perlu ditindaklanjuti"
                    }
                    statusTone={pendingLeaveCount > 0 ? "warning" : attentionCount > 0 ? "primary" : "success"}
                    badges={[
                        {
                            icon: <FiUsers className="h-3.5 w-3.5 text-accent" />,
                            label: `${summary.total} siswa aktif`,
                        },
                        { icon: <FiCalendar className="h-3.5 w-3.5 text-white/70" />, label: "Presensi hari ini" },
                    ]}
                    action={
                        pendingLeaveCount > 0 ? (
                            <TeacherInlineAction
                                href="/leave-requests/verification"
                                className="min-h-8 bg-accent px-3 text-primary hover:bg-accent hover:brightness-95"
                            >
                                Verifikasi izin
                            </TeacherInlineAction>
                        ) : undefined
                    }
                />

                <TeacherAttendanceStats
                    summary={{
                        total: summary.total,
                        present: summary.present,
                        late: summary.late,
                        sick_permission: summary.sick_permission ?? 0,
                        absent: summary.absent,
                    }}
                />

                <section className="min-w-0 space-y-3" aria-label="Perhatian khusus hari ini">
                    <SectionHeader
                        title="Perhatian Khusus Hari Ini"
                        description={`${attentionStudents.length} siswa memerlukan perhatian atau tindak lanjut.`}
                        icon={<FiAlertCircle />}
                        action={
                            <div className="w-full sm:hidden lg:block lg:w-64">
                                <SearchBar
                                    value={search}
                                    onChange={(value) => {
                                        setSearch(value);
                                        setCurrentPage(1);
                                    }}
                                    onSearch={() => setCurrentPage(1)}
                                    placeholder="Cari nama atau NISN..."
                                />
                            </div>
                        }
                        className="flex-col items-stretch sm:flex-row sm:items-center"
                    />

                    <div className="space-y-3 sm:hidden">
                        {paginatedAttention.length === 0 ? (
                            <div className="rounded-2xl border border-success/20 bg-success-bg p-6 text-center text-[13px] font-medium text-success">
                                Semua siswa di kelas ini hadir tepat waktu hari ini.
                            </div>
                        ) : (
                            paginatedAttention.map((student) => {
                                const status = getRowStatus(student);
                                return (
                                    <article
                                        key={student.id}
                                        className="rounded-2xl border border-border bg-surface p-3.5 shadow-card"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex min-w-0 items-center gap-2.5">
                                                <Avatar name={student.name} size="md" variant="primary" />
                                                <div className="min-w-0">
                                                    <h3 className="truncate text-[14px] font-bold text-text-primary">
                                                        {student.name}
                                                    </h3>
                                                    <p className="mt-0.5 text-[11px] text-text-muted">
                                                        NISN: {student.nis}
                                                    </p>
                                                </div>
                                            </div>
                                            <StatusBadge variant={status} />
                                        </div>
                                        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
                                            <span className="truncate text-[12px] font-medium text-text-secondary">
                                                {rowNote(student)}
                                            </span>
                                            {status === "pending" && (
                                                <TeacherInlineAction
                                                    href="/leave-requests/verification"
                                                    className="shrink-0 px-2.5 py-1 text-[11px]"
                                                >
                                                    Verifikasi
                                                </TeacherInlineAction>
                                            )}
                                        </div>
                                    </article>
                                );
                            })
                        )}

                        {attentionStudents.length > pageSize && (
                            <MobileNativePagination
                                currentPage={safePage}
                                totalPages={totalPages}
                                totalItems={attentionStudents.length}
                                perPage={pageSize}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </div>

                    <TableSection desktopOnly className="h-[360px] sm:h-[380px] lg:h-[420px]">
                        <Table<Student>
                            columns={columns}
                            data={paginatedAttention}
                            keyExtractor={(student) => student.id}
                            emptyMessage="Semua siswa di kelas ini hadir tepat waktu hari ini."
                            minWidthClassName="min-w-[760px]"
                            dense
                            fill
                        />
                        <TableFooter
                            info={`Menampilkan siswa kelas ${shortClassName} yang memerlukan perhatian khusus.`}
                            currentPage={safePage}
                            totalPages={totalPages}
                            totalItems={attentionStudents.length}
                            perPage={pageSize}
                            onPageChange={setCurrentPage}
                        />
                    </TableSection>
                </section>

                <section aria-labelledby="homeroom-actions-title" className="space-y-3">
                    <h2
                        id="homeroom-actions-title"
                        className="flex items-center gap-2 px-0.5 text-[12px] font-bold uppercase tracking-wider text-text-muted"
                    >
                        <FiFileText className="text-primary" />
                        Akses Cepat
                    </h2>
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                        <TeacherQuickAction
                            href="/leave-requests/verification"
                            title="Verifikasi Izin"
                            description={
                                pendingLeaveCount > 0
                                    ? `${pendingLeaveCount} pengajuan menunggu`
                                    : "Lihat semua pengajuan"
                            }
                            icon={<FiAlertCircle />}
                            tone={pendingLeaveCount > 0 ? "warning" : "primary"}
                        />
                        <TeacherQuickAction
                            href="/reports"
                            title="Rekap Kelas"
                            description="Harian, bulanan, dan semester"
                            icon={<FiCalendar />}
                            tone="success"
                        />
                        <TeacherQuickAction
                            href="/export"
                            title="Ekspor Data"
                            description="Unduh rekap presensi kelas"
                            icon={<FiFileText />}
                            tone="info"
                        />
                    </div>
                </section>
            </div>
        </AppShell>
    );
}
