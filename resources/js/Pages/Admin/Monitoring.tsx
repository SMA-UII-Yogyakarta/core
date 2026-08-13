import { useState } from "react";
import { router } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";
import { StatCard, StatusBadge, Button, Table, Card, SelectInput, Input } from "@/Components";
import type { Column } from "@/Components/ui/Table";
import type { StatusVariant } from "@/types/component";

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

// ─── Helpers ───

const statusToVariant: Record<string, StatusVariant> = {
    Present: "present",
    Late: "late",
    Absent: "absent",
    Sick: "sick",
    Permission: "permission",
};

const statusLabels: Record<string, string> = {
    Present: "Hadir",
    Late: "Terlambat",
    Absent: "Tidak Hadir",
    Sick: "Sakit",
    Permission: "Izin",
};

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

    // Real-time monitoring with Laravel Echo
    useState(() => {
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
                        const oldStatus = studentsState.find((s) => s.student.id === data.student_id)?.status;
                        if (oldStatus && counts[oldStatus as keyof Stats] > 0) {
                            counts[oldStatus as keyof Stats]--;
                        }
                        const newKey =
                            data.status === "Permission"
                                ? "sick_permission"
                                : (data.status.toLowerCase() as keyof Stats);
                        if (newKey in counts) {
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
    });

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
            render: (s) => {
                const variant = statusToVariant[s.status] ?? "absent";
                const label = statusLabels[s.status] ?? s.status;
                return <StatusBadge variant={variant} label={label} />;
            },
        },
        {
            key: "time",
            header: "Waktu",
            render: (s) => (s.attendance?.check_in_time ? `${s.attendance.check_in_time} WIB` : "-"),
        },
    ];

    const today = new Date().toISOString().split("T")[0];

    return (
        <AppShell title="Monitoring Presensi">
            {/* Filter Section */}
            <Card className="mb-6">
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
                    <Button variant="primary" size="md" onClick={handleFilter}>
                        <i className="fas fa-search mr-2" />
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
                <Card className="p-12 text-center flex flex-col items-center justify-center">
                    <i className="fas fa-chart-bar text-text-inactive text-4xl mb-3" />
                    <p className="text-text-muted font-inter text-[14px]">
                        Silakan pilih kelas untuk menampilkan data monitoring.
                    </p>
                </Card>
            )}
        </AppShell>
    );
}
