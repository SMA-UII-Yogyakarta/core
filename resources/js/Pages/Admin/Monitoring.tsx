import { useState } from "react";
import { router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { StatCard, StatusBadge, Button, Table } from "@/Components";
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

// ─── Page ───

export default function Monitoring({
    classes,
    selectedClassId,
    stats,
    students,
}: MonitoringProps) {
    const [classId, setClassId] = useState<string>(
        selectedClassId?.toString() ?? "",
    );

    // Real-time monitoring with Laravel Echo
    useState(() => {
        if (typeof window !== 'undefined' && window.Echo && classId) {
            window.Echo.channel(`monitoring.${classId}`)
                .listen('.attendance.created', (data: { student_name: string; status: string; check_in_time: string }) => {
                    console.log('Real-time attendance update:', data);
                });
        }
        return () => {
            if (typeof window !== 'undefined' && window.Echo && classId) {
                window.Echo.leaveChannel(`monitoring.${classId}`);
            }
        };
    });

    const handleFilter = () => {
        router.get(
            "/admin/monitoring",
            { class_id: classId || undefined },
            { preserveState: true },
        );
    };

    const columns: Column<AttendanceStudent>[] = [
        { key: "nisn", header: "NISN", render: (s) => s.student.nisn },
        { key: "name", header: "Nama Siswa", render: (s) => s.student.name },
        {
            key: "status",
            header: "Status Hari Ini",
            render: (s) => {
                let variant: StatusVariant = "absent";
                let label = "ALPA";

                if (s.status === "Present") {
                    variant = "present";
                    label = "HADIR";
                } else if (s.status === "Late") {
                    variant = "late";
                    label = "TERLAMBAT";
                } else if (s.status === "Sick" || s.status === "Permission") {
                    variant = "approved";
                    label = "DIIZINKAN";
                } else if (s.status === "Pending") {
                    variant = "pending";
                    label = "PENDING IZIN";
                }

                return <StatusBadge variant={variant} label={label} />;
            },
        },
        {
            key: "time",
            header: "Waktu / Keterangan",
            render: (s) => {
                if (s.status === "Absent") {
                    return <span className="text-text-placeholder">Belum ada kabar</span>;
                }
                if (s.status === "Sick" || s.status === "Permission") {
                    return <span className="text-text-secondary">Pengajuan Izin Diterima</span>;
                }
                if (s.status === "Pending") {
                    return <span className="text-text-secondary">Pengajuan Izin Sakit</span>;
                }
                return s.attendance?.check_in_time ? `${s.attendance.check_in_time} WIB` : "-";
            },
        },
        {
            key: "action",
            header: "Tindakan",
            className: "text-right",
            render: (s) => {
                if (s.status === "Pending") {
                    return (
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => router.get("/admin/verifikasi-izin")}
                            className="bg-primary hover:bg-primary/90 text-white rounded text-[12px] px-3 py-1 font-semibold"
                        >
                            Verifikasi Izin
                        </Button>
                    );
                }
                return (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.get(`/admin/data-master`)}
                        className="border border-border text-text-primary hover:bg-background rounded text-[12px] px-3 py-1 font-semibold"
                    >
                        Lihat Detail
                    </Button>
                );
            },
        },
    ];

    const today = new Date().toISOString().split("T")[0];

    return (
        <AdminLayout title="Monitoring Live" activeMenu="Live Presensi">
            {/* Filter Section */}
            <section className="bg-surface border border-border rounded-lg p-4 lg:p-6 mb-6">
                <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-stretch sm:items-end">
                    <div>
                        <label className="block text-[13px] text-text-muted font-inter mb-1">
                            Filter Kelas
                        </label>
                        <select
                            value={classId}
                            onChange={(e) => setClassId(e.target.value)}
                            className="w-full sm:w-auto border border-border rounded-lg px-3 py-2 text-[14px] font-inter text-text-primary bg-surface focus:ring-2 focus:ring-primary/40 focus:outline-none"
                        >
                            <option value="">-- Pilih Kelas --</option>
                            {classes.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}{" "}
                                    {c.teacher ? `(${c.teacher.name})` : ""}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[13px] text-text-muted font-inter mb-1">
                            Tanggal
                        </label>
                        <input
                            type="date"
                            defaultValue={today}
                            className="w-full sm:w-auto border border-border rounded-lg px-3 py-2 text-[14px] font-inter text-text-primary bg-surface focus:ring-2 focus:ring-primary/40 focus:outline-none"
                        />
                    </div>
                    <Button variant="primary" size="md" onClick={handleFilter}>
                        <i className="fas fa-search mr-2" />
                        Tampilkan
                    </Button>
                </div>
            </section>

            {/* Stats Cards */}
            {stats && (
                <section className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                    <StatCard
                        label="Total Siswa"
                        value={stats.total}
                        color="grey"
                    />
                    <StatCard
                        label="Hadir Terdata"
                        value={stats.present}
                        color="green"
                    />
                    <StatCard
                        label="Terlambat"
                        value={stats.late}
                        color="amber"
                    />
                    <StatCard
                        label="Sakit / Izin"
                        value={stats.sick_permission}
                        color="blue"
                    />
                    <StatCard
                        label="Alpa (Kosong)"
                        value={stats.absent}
                        color="red"
                    />
                </section>
            )}

            {/* Students Table */}
            {selectedClassId && (
                <section className="bg-surface border border-border rounded-lg p-4 lg:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[16px] font-bold text-text-primary font-inter">
                            Perhatian Khusus Hari Ini
                        </h2>
                        <div className="flex items-center gap-4">
                            <span className="text-[13px] text-text-muted">
                                Filter Kelas: <strong className="text-text-primary">{classes.find(c => c.id === selectedClassId)?.name}</strong>
                            </span>
                            <span className="text-[13px] text-text-muted">
                                Tanggal: <strong className="text-text-primary">{today}</strong>
                            </span>
                        </div>
                    </div>
                    <Table
                        columns={columns}
                        data={students}
                        keyExtractor={(s) => s.student.id}
                        emptyMessage="Belum ada data untuk kelas ini."
                    />
                </section>
            )}

            {!selectedClassId && (
                <div className="bg-surface border border-border rounded-lg p-12 text-center">
                    <i className="fas fa-chart-bar text-text-inactive text-4xl mb-3" />
                    <p className="text-text-muted font-inter text-[14px]">
                        Silakan pilih kelas untuk menampilkan data monitoring.
                    </p>
                </div>
            )}
        </AdminLayout>
    );
}
