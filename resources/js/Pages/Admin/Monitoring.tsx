import { useState, useEffect, useRef } from "react";
import { router } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";
import { PageHeader, StatCard, StatusBadge, Button, Table, Card, SelectInput, Input, BottomSheet } from "@/Components";
import EmptyState from "@/Components/common/EmptyState";
import { FiSearch, FiBarChart2, FiFilter } from "react-icons/fi";
import type { Column } from "@/Components/ui/Table";

// ─── Types ───

interface SchoolClass {
    id: number;
    name: string;
    teacher: { id: number; name: string } | null;
}

interface Stats {
    total: number;
    present: number;
    late: number;
    absent: number;
    sick_permission: number;
}

interface AttendanceStudent {
    student: {
        id: number;
        nisn: string;
        name: string;
        user: { id: number; name: string } | null;
        class: { id: number; name: string } | null;
    };
    attendance: {
        id: number;
        check_in_time: string;
        status: string;
        latitude: string;
        longitude: string;
        photo_url: string;
    } | null;
    status: string;
}

interface MonitoringProps {
    classes: SchoolClass[];
    selectedClassId: number | null;
    stats: Stats | null;
    students: AttendanceStudent[];
}

// ─── Page ───

export default function Monitoring({
    classes,
    selectedClassId,
    stats: initialStats,
    students: initialStudents,
}: MonitoringProps) {
    const [classId, setClassId] = useState<string>(selectedClassId?.toString() ?? "");
    const [studentsState, setStudentsState] = useState(initialStudents);
    const [statsState, setStatsState] = useState(initialStats);

    // Keep studentsState and statsState in sync when Inertia reloads props
    useEffect(() => {
        setStudentsState(initialStudents);
    }, [initialStudents]);

    useEffect(() => {
        setStatsState(initialStats);
    }, [initialStats]);

    // Use a ref to always access latest studentsState in Echo callback without stale closure
    const studentsRef = useRef(studentsState);
    useEffect(() => {
        studentsRef.current = studentsState;
    }, [studentsState]);

    // Real-time monitoring with Laravel Echo
    useEffect(() => {
        if (typeof window !== "undefined" && window.Echo && classId) {
            window.Echo.channel(`monitoring.${classId}`).listen(
                ".attendance.created",
                (data: {
                    student_id: number;
                    student_name: string;
                    status: string;
                    check_in_time: string;
                    id: number;
                    latitude: string;
                    longitude: string;
                }) => {
                    const currentStudents = studentsRef.current;
                    const existingStudent = currentStudents.find((s) => s.student.id === data.student_id);
                    const oldStatus = existingStudent?.status;

                    setStudentsState((prev) =>
                        prev.map((s) =>
                            s.student.id === data.student_id
                                ? {
                                      ...s,
                                      attendance: {
                                          id: data.id,
                                          check_in_time: data.check_in_time,
                                          status: data.status,
                                          latitude: data.latitude,
                                          longitude: data.longitude,
                                          photo_url: s.attendance?.photo_url ?? "",
                                      },
                                      status: data.status,
                                  }
                                : s,
                        ),
                    );

                    setStatsState((prev) => {
                        if (!prev) return prev;
                        const counts = { ...prev };

                        const normalizeStatusKey = (st: string): keyof Stats | null => {
                            const lower = st.toLowerCase();
                            if (lower === "permission" || lower === "sick") return "sick_permission";
                            if (lower === "present" || lower === "late" || lower === "absent") return lower as keyof Stats;
                            return null;
                        };

                        if (oldStatus) {
                            const oldKey = normalizeStatusKey(oldStatus);
                            if (oldKey && counts[oldKey] > 0) {
                                counts[oldKey]--;
                            }
                        }

                        const newKey = normalizeStatusKey(data.status);
                        if (newKey && typeof counts[newKey] === "number") {
                            counts[newKey]++;
                        }

                        return counts;
                    });
                },
            );
        }
        return () => {
            if (typeof window !== "undefined" && window.Echo && classId) {
                window.Echo.leaveChannel(`monitoring.${classId}`);
            }
        };
    }, [classId]);

    const handleFilter = () => {
        router.get("/monitoring", { class_id: classId || undefined }, { preserveState: true });
    };

    const columns: Column<AttendanceStudent>[] = [
        { key: "nisn", header: "NISN", render: (s) => s.student.nisn },
        { key: "name", header: "Nama Siswa", render: (s) => s.student.name },
        {
            key: "class",
            header: "Kelas",
            render: (s) => s.student.class?.name ?? "-",
        },
        {
            key: "status",
            header: "Status",
            render: (s) => <StatusBadge variant={s.status} />,
        },
        {
            key: "time",
            header: "Waktu",
            render: (s) => (s.attendance?.check_in_time ? `${s.attendance.check_in_time} WIB` : "-"),
        },
    ];

    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const hasActiveFilters = Boolean(classId);

    const mobileHeaderActions = (
        <div className="flex items-center gap-2 sm:hidden font-inter">
            <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                    hasActiveFilters
                        ? "bg-primary text-white"
                        : "bg-muted/60 text-text-primary hover:bg-muted"
                }`}
                title="Filter Monitoring Presensi"
                aria-label="Filter Monitoring Presensi"
            >
                <FiFilter className="text-[14px]" />
            </button>
        </div>
    );

    const today = new Date().toISOString().split("T")[0];

    return (
        <AppShell title="Monitoring Presensi" hasTopCard={true} headerActions={mobileHeaderActions}>
            <PageHeader
                title="Monitoring Presensi Siswa"
                description="Pantau log presensi real-time seluruh rombongan belajar institusi hari ini."
                className="hidden lg:flex shrink-0 mb-4"
            />
            {/* Filter Section (Desktop & Tablet) */}
            <Card className="mb-6 hidden sm:block">
                <Card.Body className="p-4 lg:p-6 flex flex-col sm:flex-row flex-wrap gap-4 items-stretch sm:items-end">
                    <SelectInput
                        label="Filter Kelas"
                        value={classId}
                        onChange={(val) => setClassId(String(val))}
                        options={[
                            { label: "-- Pilih Kelas --", value: "" },
                            ...classes.map((c) => ({
                                label: `${c.name} ${c.teacher ? `(${c.teacher.name})` : ""}`,
                                value: c.id.toString(),
                            })),
                        ]}
                        className="w-full sm:w-[240px]"
                    />
                    <Input type="date" label="Tanggal" defaultValue={today} className="w-full sm:w-[200px]" />
                    <Button variant="accent" size="md" onClick={handleFilter}>
                        <FiSearch className="mr-2" />
                        Tampilkan
                    </Button>
                </Card.Body>
            </Card>

            {/* Stats Cards */}
            {statsState && (
                <section className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                    <StatCard label="Total Siswa" value={statsState.total} color="grey" />
                    <StatCard label="Hadir" value={statsState.present} color="green" />
                    <StatCard label="Terlambat" value={statsState.late} color="amber" />
                    <StatCard label="Sakit / Izin" value={statsState.sick_permission} color="blue" />
                    <StatCard label="Tidak Hadir" value={statsState.absent} color="red" />
                </section>
            )}

            {/* Students Table */}
            {selectedClassId && (
                <section>
                    <h2 className="text-[16px] font-bold text-text-primary font-inter mb-4">Daftar Kehadiran Siswa</h2>
                    <Table
                        columns={columns}
                        data={studentsState}
                        keyExtractor={(s) => s.student.id}
                        emptyMessage="Belum ada data untuk kelas ini."
                    />
                </section>
            )}

            {!selectedClassId && (
                <Card className="p-8">
                    <EmptyState
                        variant="no-data"
                        icon={<FiBarChart2 className="text-4xl text-text-inactive" />}
                        title="Pilih Kelas"
                        description="Silakan pilih kelas untuk menampilkan data monitoring."
                        className="py-4"
                    />
                </Card>
            )}

            {/* 📱 MOBILE FILTER BOTTOM SHEET */}
            <BottomSheet
                open={isMobileFilterOpen}
                onClose={() => setIsMobileFilterOpen(false)}
                title="Filter Monitoring Presensi"
                subtitle="Pilih kelas dan tanggal untuk memantau kehadiran"
            >
                <div className="flex flex-col gap-4 font-inter pb-2">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-bold text-text-secondary">
                            Filter Kelas
                        </label>
                        <SelectInput
                            value={classId}
                            onChange={(val) => setClassId(String(val))}
                            options={[
                                { label: "-- Pilih Kelas --", value: "" },
                                ...classes.map((c) => ({
                                    label: `${c.name} ${c.teacher ? `(${c.teacher.name})` : ""}`,
                                    value: c.id.toString(),
                                })),
                            ]}
                            className="h-10 text-[13px]"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-bold text-text-secondary">
                            Tanggal
                        </label>
                        <Input
                            type="date"
                            defaultValue={today}
                            className="h-10 text-[13px]"
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        {hasActiveFilters && (
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setClassId("");
                                    router.get("/monitoring", {}, { preserveState: true });
                                    setIsMobileFilterOpen(false);
                                }}
                                className="flex-1 h-10 text-[13px] font-bold rounded-xl"
                            >
                                Reset Filter
                            </Button>
                        )}
                        <Button
                            variant="primary"
                            onClick={() => {
                                handleFilter();
                                setIsMobileFilterOpen(false);
                            }}
                            className="flex-1 h-10 text-[13px] font-bold rounded-xl"
                        >
                            Tampilkan
                        </Button>
                    </div>
                </div>
            </BottomSheet>
        </AppShell>
    );
}
