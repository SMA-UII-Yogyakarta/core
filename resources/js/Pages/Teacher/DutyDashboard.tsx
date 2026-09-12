import { router } from "@inertiajs/react";
import { useMemo, useState } from "react";
import { FiAlertCircle, FiCalendar, FiEdit3, FiFileText, FiRefreshCw, FiUsers } from "react-icons/fi";
import {
    Avatar,
    Button,
    Drawer,
    FilterBar,
    HeaderIconButton,
    Input,
    MobileNativePagination,
    NativeSelect,
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
    selectedDate?: string;
    classStats: ClassStat[];
    attentionStudents?: AttentionStudent[];
    classes?: { id: number; name: string }[];
    selectedClassId?: number | null;
    totals?: {
        total: number;
        present: number;
        late: number;
        sick_permission: number;
        absent: number;
    };
}

function rowNote(student: AttentionStudent): string {
    if (student.status === "alpa" || student.status === "absent") return "Belum ada kabar";
    if (student.status === "terlambat" || student.status === "late") {
        return student.check_in_time ? `${student.check_in_time} WIB` : "Terlambat";
    }
    if (student.status === "pending") {
        return student.leave_category ? `Pengajuan Izin ${student.leave_category}` : "Pengajuan Izin";
    }
    return "Pengajuan izin diterima";
}

function normalizeClassName(value: string): string {
    return value.split(" (")[0].trim();
}

export default function DutyDashboard({
    teacher,
    isScheduled,
    today,
    selectedDate,
    classStats,
    attentionStudents = [],
    classes = [],
    selectedClassId = null,
    totals,
}: PageProps) {
    const [classVal, setClassVal] = useState(selectedClassId?.toString() ?? "");
    const [dateVal, setDateVal] = useState(selectedDate ?? new Date().toISOString().split("T")[0]);
    const [search, setSearch] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<AttentionStudent | null>(null);

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

    const summary = useMemo(
        () =>
            totals ??
            classStats.reduce(
                (result, classItem) => ({
                    total: result.total + classItem.total,
                    present: result.present + classItem.present,
                    late: result.late + classItem.late,
                    sick_permission: result.sick_permission + classItem.sick_permission,
                    absent: result.absent + classItem.absent,
                }),
                { total: 0, present: 0, late: 0, sick_permission: 0, absent: 0 },
            ),
        [classStats, totals],
    );

    const classOptions = useMemo(
        () => [
            { value: "", label: "Semua Kelas" },
            ...classes.map((schoolClass) => ({
                value: schoolClass.id.toString(),
                label: normalizeClassName(schoolClass.name),
            })),
        ],
        [classes],
    );

    const selectedClassName = useMemo(() => {
        if (!classVal) return null;
        const selected = classes.find((schoolClass) => schoolClass.id.toString() === classVal);
        return selected ? normalizeClassName(selected.name) : null;
    }, [classVal, classes]);

    const filteredAttention = useMemo(() => {
        const query = search.toLowerCase().trim();
        return attentionStudents.filter((student) => {
            const matchesClass = selectedClassName ? normalizeClassName(student.class) === selectedClassName : true;
            const matchesSearch = query
                ? [student.name, student.nis, student.class].some((value) => value.toLowerCase().includes(query))
                : true;
            return matchesClass && matchesSearch;
        });
    }, [attentionStudents, search, selectedClassName]);

    const {
        setCurrentPage,
        totalPages,
        safePage,
        paginatedData: paginatedAttention,
        pageSize,
    } = useClientPagination(filteredAttention, 1, 10);

    const handleClassChange = (newClass: string) => {
        setClassVal(newClass);
        setCurrentPage(1);
        router.get(
            "/teacher/duty",
            { class_id: newClass || undefined, date: dateVal || undefined },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleDateChange = (newDate: string) => {
        setDateVal(newDate);
        setCurrentPage(1);
        router.get(
            "/teacher/duty",
            { class_id: classVal || undefined, date: newDate || undefined },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const classColumns: Column<ClassStat>[] = [
        {
            key: "class",
            header: "Kelas",
            className: "min-w-[180px]",
            render: (classItem) => (
                <span className="font-bold text-text-primary">{normalizeClassName(classItem.class)}</span>
            ),
        },
        { key: "total", header: "Total", className: "w-24 text-center" },
        { key: "present", header: "Hadir", className: "w-24 text-center text-success font-bold" },
        { key: "late", header: "Terlambat", className: "w-28 text-center text-warning font-bold" },
        { key: "sick_permission", header: "Sakit / Izin", className: "w-28 text-center text-primary font-bold" },
        { key: "absent", header: "Alpa", className: "w-24 text-center text-danger font-bold" },
    ];

    const attentionColumns: Column<AttentionStudent>[] = [
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
                    <div className="min-w-0">
                        <span
                            className="block max-w-[220px] truncate text-[13px] font-semibold text-text-primary"
                            title={student.name}
                        >
                            {student.name}
                        </span>
                        <span className="block text-[11px] text-text-muted">{normalizeClassName(student.class)}</span>
                    </div>
                </div>
            ),
        },
        {
            key: "status",
            header: "Status Hari Ini",
            className: "w-40 text-center",
            render: (student) => {
                const label =
                    student.status === "pending"
                        ? "PENDING IZIN"
                        : student.status === "diizinkan"
                          ? "DIIZINKAN"
                          : student.status.toUpperCase();
                return <StatusBadge variant={student.status} label={label} />;
            },
        },
        {
            key: "note",
            header: "Waktu / Keterangan",
            className: "min-w-[180px] text-[13px]",
            render: (student) => (
                <span
                    className={`text-[13px] ${student.status === "terlambat" || student.status === "late" ? "font-bold text-warning" : "font-medium text-text-secondary"}`}
                >
                    {rowNote(student)}
                </span>
            ),
        },
        {
            key: "actions",
            header: "Tindakan",
            className: "w-36 text-center",
            render: (student) =>
                student.status === "pending" ? (
                    <TeacherInlineAction href="/leave-requests">Verifikasi</TeacherInlineAction>
                ) : (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedStudent(student)}
                        className="mx-auto text-[12px]"
                    >
                        Lihat detail
                    </Button>
                ),
        },
    ];

    const mobileHeaderActions = (
        <div className="flex items-center gap-2 font-inter sm:hidden">
            <HeaderIconButton
                variant="neutral"
                icon={<FiRefreshCw className={isRefreshing ? "animate-spin" : ""} />}
                label="Perbarui data"
                onClick={triggerRefresh}
                disabled={isRefreshing}
            />
        </div>
    );

    return (
        <AppShell
            title="Overview Guru Piket"
            hasTopCard
            headerActions={mobileHeaderActions}
            searchValue={search}
            onSearchChange={(value) => {
                setSearch(value);
                setCurrentPage(1);
            }}
            searchPlaceholder="Cari nama, NIS, atau kelas..."
        >
            <div className="flex min-w-0 flex-col gap-4 font-inter sm:gap-5 lg:gap-6">
                <PageHeader
                    title="Overview Monitoring Guru Piket"
                    description="Pantau kehadiran siswa secara real-time dan kelola siswa yang memerlukan perhatian khusus."
                    className="hidden shrink-0 lg:flex"
                >
                    <div className="flex items-center gap-2">
                        <Button
                            variant={isPolling ? "outline" : "ghost"}
                            size="sm"
                            onClick={togglePolling}
                            className="text-[12px]"
                        >
                            <span
                                className={`mr-1.5 h-2 w-2 rounded-full ${isPolling ? "animate-pulse bg-success" : "bg-text-inactive"}`}
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

                <TeacherOverviewHero
                    eyebrow="GURU PIKET • OVERVIEW"
                    title="Monitoring Kehadiran Sekolah"
                    description={`Halo, ${teacher.name}. Pantau seluruh kelas dari satu ruang kerja.`}
                    statusLabel={isScheduled ? "Tugas aktif pada tanggal ini" : "Tidak ada jadwal pada tanggal ini"}
                    statusDetail={`${filteredAttention.length} siswa perlu perhatian`}
                    statusTone={isScheduled ? "success" : "warning"}
                    badges={[
                        {
                            icon: <FiUsers className="h-3.5 w-3.5 text-accent" />,
                            label: `${summary.total} siswa terpantau`,
                        },
                        { icon: <FiCalendar className="h-3.5 w-3.5 text-white/70" />, label: today },
                    ]}
                    action={
                        <button
                            type="button"
                            onClick={triggerRefresh}
                            disabled={isRefreshing}
                            className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-[12px] font-bold text-primary shadow-xs transition-all hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <FiRefreshCw className={isRefreshing ? "animate-spin" : ""} />
                            Perbarui
                        </button>
                    }
                />

                <div className="hidden sm:block">
                    <FilterBar>
                        <FilterBar.Select
                            label="Filter Kelas"
                            value={classVal}
                            onChange={(event) => handleClassChange(event.target.value)}
                            options={classOptions}
                        />
                        <FilterBar.Date label="Tanggal" value={dateVal} onChange={handleDateChange} />
                        <div className="hidden lg:block lg:ml-auto">
                            <FilterBar.Search
                                value={search}
                                onChange={(value) => {
                                    setSearch(value);
                                    setCurrentPage(1);
                                }}
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    setCurrentPage(1);
                                }}
                                placeholder="Cari nama / NIS / kelas..."
                            />
                        </div>
                    </FilterBar>
                </div>

                <div className="grid grid-cols-2 gap-2.5 rounded-2xl border border-border bg-surface p-3 shadow-card sm:hidden">
                    <NativeSelect
                        value={classVal}
                        onChange={(event) => handleClassChange(event.target.value)}
                        className="h-10 text-[12px]"
                    >
                        {classOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </NativeSelect>
                    <Input
                        type="date"
                        value={dateVal}
                        onChange={(event) => handleDateChange(event.target.value)}
                        inputClassName="h-10 rounded-xl text-[12px]"
                    />
                    <div className="col-span-2">
                        <SearchBar
                            value={search}
                            onChange={(value) => {
                                setSearch(value);
                                setCurrentPage(1);
                            }}
                            onSearch={() => setCurrentPage(1)}
                            placeholder="Cari nama, NIS, atau kelas..."
                        />
                    </div>
                </div>

                <TeacherAttendanceStats summary={summary} />

                <section className="min-w-0 space-y-3" aria-label="Ringkasan per kelas">
                    <SectionHeader
                        title="Ringkasan per Kelas"
                        description="Distribusi presensi berdasarkan kelas pada tanggal terpilih."
                        icon={<FiUsers />}
                        className="flex-col items-stretch sm:flex-row sm:items-center"
                    />

                    <div className="grid grid-cols-2 gap-3 sm:hidden">
                        {classStats.length === 0 ? (
                            <div className="col-span-2 rounded-2xl border border-border bg-surface p-5 text-center text-[13px] text-text-muted">
                                Belum ada data kelas.
                            </div>
                        ) : (
                            classStats.map((classItem) => (
                                <article
                                    key={classItem.class_id}
                                    className="rounded-2xl border border-border bg-surface p-3.5 shadow-card"
                                >
                                    <h3 className="truncate text-[13px] font-bold text-text-primary">
                                        {normalizeClassName(classItem.class)}
                                    </h3>
                                    <p className="mt-1 text-[11px] text-text-muted">{classItem.total} siswa</p>
                                    <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                                        <span className="rounded-lg bg-success-bg px-2 py-1 font-bold text-success">
                                            Hadir {classItem.present}
                                        </span>
                                        <span className="rounded-lg bg-warning-bg px-2 py-1 font-bold text-warning">
                                            Telat {classItem.late}
                                        </span>
                                        <span className="rounded-lg bg-primary-light px-2 py-1 font-bold text-primary">
                                            Izin {classItem.sick_permission}
                                        </span>
                                        <span className="rounded-lg bg-danger-bg px-2 py-1 font-bold text-danger">
                                            Alpa {classItem.absent}
                                        </span>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>

                    <TableSection desktopOnly className="h-[260px] sm:h-[280px] lg:h-[300px]">
                        <Table<ClassStat>
                            columns={classColumns}
                            data={classStats}
                            keyExtractor={(classItem) => classItem.class_id}
                            emptyMessage="Belum ada data kelas."
                            minWidthClassName="min-w-[760px]"
                            dense
                            fill
                        />
                    </TableSection>
                </section>

                <section className="min-w-0 space-y-3" aria-label="Perhatian khusus hari ini">
                    <SectionHeader
                        title="Perhatian Khusus Hari Ini"
                        description={`${filteredAttention.length} siswa memerlukan perhatian atau tindak lanjut.`}
                        icon={<FiAlertCircle />}
                        action={
                            <span className="hidden shrink-0 rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-bold text-text-muted sm:inline-flex">
                                {filteredAttention.length} siswa
                            </span>
                        }
                        className="flex-col items-stretch sm:flex-row sm:items-center"
                    />

                    <div className="space-y-3 sm:hidden">
                        {paginatedAttention.length === 0 ? (
                            <div className="rounded-2xl border border-success/20 bg-success-bg p-6 text-center text-[13px] font-medium text-success">
                                Tidak ada data siswa yang memerlukan perhatian khusus.
                            </div>
                        ) : (
                            paginatedAttention.map((student) => (
                                <button
                                    key={student.id}
                                    type="button"
                                    onClick={() => setSelectedStudent(student)}
                                    className="flex w-full items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-3.5 text-left shadow-card transition-all active:scale-[0.99] active:bg-muted"
                                >
                                    <div className="flex min-w-0 items-center gap-2.5">
                                        <Avatar name={student.name} size="md" variant="primary" />
                                        <div className="min-w-0">
                                            <div className="flex min-w-0 items-center gap-2">
                                                <span className="truncate text-[14px] font-bold text-text-primary">
                                                    {student.name}
                                                </span>
                                                <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-text-muted">
                                                    {normalizeClassName(student.class)}
                                                </span>
                                            </div>
                                            <p className="mt-1 truncate text-[12px] font-medium text-text-secondary">
                                                {rowNote(student)}
                                            </p>
                                        </div>
                                    </div>
                                    <StatusBadge
                                        variant={student.status}
                                        label={
                                            student.status === "pending"
                                                ? "PENDING"
                                                : student.status === "diizinkan"
                                                  ? "DIIZINKAN"
                                                  : student.status.toUpperCase()
                                        }
                                    />
                                </button>
                            ))
                        )}

                        {filteredAttention.length > pageSize && (
                            <MobileNativePagination
                                currentPage={safePage}
                                totalPages={totalPages}
                                totalItems={filteredAttention.length}
                                perPage={pageSize}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </div>

                    <TableSection desktopOnly className="h-[360px] sm:h-[380px] lg:h-[420px]">
                        <Table<AttentionStudent>
                            columns={attentionColumns}
                            data={paginatedAttention}
                            keyExtractor={(student) => student.id}
                            emptyMessage="Tidak ada data siswa yang memerlukan perhatian khusus."
                            minWidthClassName="min-w-[800px]"
                            dense
                            fill
                        />
                        <TableFooter
                            currentPage={safePage}
                            totalPages={totalPages}
                            totalItems={filteredAttention.length}
                            perPage={pageSize}
                            onPageChange={setCurrentPage}
                            itemLabel="siswa terpantau hari ini"
                        />
                    </TableSection>
                </section>

                <section aria-labelledby="duty-actions-title" className="space-y-3">
                    <h2
                        id="duty-actions-title"
                        className="flex items-center gap-2 px-0.5 text-[12px] font-bold uppercase tracking-wider text-text-muted"
                    >
                        <FiFileText className="text-primary" />
                        Akses Cepat
                    </h2>
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                        <TeacherQuickAction
                            href="/leave-requests"
                            title="Pantauan Izin"
                            description="Izin dan dispensasi siswa"
                            icon={<FiEdit3 />}
                            tone="warning"
                        />
                        <TeacherQuickAction
                            href="/reports/daily"
                            title="Rekap Harian"
                            description="Laporan per kelas"
                            icon={<FiCalendar />}
                            tone="success"
                        />
                        <TeacherQuickAction
                            href="/export"
                            title="Ekspor Laporan"
                            description="PDF dan Excel"
                            icon={<FiFileText />}
                            tone="primary"
                        />
                        <TeacherQuickAction
                            title="Refresh Data"
                            description="Sinkronkan data terbaru"
                            icon={<FiRefreshCw className={isRefreshing ? "animate-spin" : ""} />}
                            tone="info"
                            onClick={triggerRefresh}
                            disabled={isRefreshing}
                        />
                    </div>
                </section>
            </div>

            <Drawer
                open={Boolean(selectedStudent)}
                onClose={() => setSelectedStudent(null)}
                title="Detail Perhatian Khusus"
            >
                {selectedStudent && (
                    <div className="space-y-6 font-inter">
                        <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted p-4">
                            <Avatar name={selectedStudent.name} size="lg" variant="primary" />
                            <div className="min-w-0">
                                <h3 className="truncate text-[16px] font-bold text-text-primary">
                                    {selectedStudent.name}
                                </h3>
                                <p className="mt-0.5 text-[13px] text-text-muted">
                                    NIS: {selectedStudent.nis} • Kelas {normalizeClassName(selectedStudent.class)}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between gap-3 border-b border-border py-2">
                                <span className="text-[13px] text-text-muted">Status kehadiran</span>
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
                            <div className="flex items-center justify-between gap-3 border-b border-border py-2">
                                <span className="text-[13px] text-text-muted">Waktu / keterangan</span>
                                <span className="text-right text-[13px] font-bold text-text-primary">
                                    {rowNote(selectedStudent)}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            {selectedStudent.status === "pending" && (
                                <TeacherInlineAction href="/leave-requests" className="flex-1 py-2.5 text-center">
                                    Proses verifikasi
                                </TeacherInlineAction>
                            )}
                            <Button variant="outline" className="flex-1" onClick={() => setSelectedStudent(null)}>
                                Tutup
                            </Button>
                        </div>
                    </div>
                )}
            </Drawer>
        </AppShell>
    );
}
